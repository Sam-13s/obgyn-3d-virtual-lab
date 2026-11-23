"""Add a small skeletal rig and an illustrative uterine contraction clip to the HuBMAP GLB.

The source model is licensed under CC BY 4.0 and is credited in the asset metadata.
This script preserves its geometry/materials and adds four rigidly weighted joints.
It is a teaching animation, not a physiological or clinical simulation.
"""

import json
import struct
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "reproductive-source.glb"
OUTPUT = ROOT / "public" / "models" / "reproductive-rigged.glb"


def read_glb(path):
    data = path.read_bytes()
    magic, version, total_length = struct.unpack_from("<4sII", data, 0)
    if magic != b"glTF" or version != 2 or total_length != len(data):
        raise ValueError(f"{path.name} is not a valid GLB 2.0 file")
    offset = 12
    document = None
    binary = bytearray()
    while offset < len(data):
        chunk_length, chunk_type = struct.unpack_from("<II", data, offset)
        offset += 8
        chunk = data[offset : offset + chunk_length]
        offset += chunk_length
        if chunk_type == 0x4E4F534A:
            document = json.loads(chunk.decode("utf-8"))
        elif chunk_type == 0x004E4942:
            binary.extend(chunk)
    if document is None or not document.get("buffers"):
        raise ValueError("GLB must contain a JSON document and embedded buffer")
    return document, binary


def append_accessor(document, binary, values, component_type, accessor_type, count, target=None, minimum=None, maximum=None):
    while len(binary) % 4:
        binary.append(0)
    raw = struct.pack("<" + "f" * len(values), *values) if component_type == 5126 else struct.pack("<" + "H" * len(values), *values)
    view = {"buffer": 0, "byteOffset": len(binary), "byteLength": len(raw)}
    if target is not None:
        view["target"] = target
    view_index = len(document.setdefault("bufferViews", []))
    document["bufferViews"].append(view)
    binary.extend(raw)
    accessor = {
        "bufferView": view_index,
        "byteOffset": 0,
        "componentType": component_type,
        "count": count,
        "type": accessor_type,
    }
    if minimum is not None:
        accessor["min"] = minimum
    if maximum is not None:
        accessor["max"] = maximum
    accessor_index = len(document.setdefault("accessors", []))
    document["accessors"].append(accessor)
    return accessor_index


def write_glb(path, document, binary):
    document["buffers"][0]["byteLength"] = len(binary)
    json_chunk = json.dumps(document, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    json_chunk += b" " * ((-len(json_chunk)) % 4)
    binary.extend(b"\x00" * ((-len(binary)) % 4))
    total_length = 12 + 8 + len(json_chunk) + 8 + len(binary)
    path.write_bytes(
        struct.pack("<4sII", b"glTF", 2, total_length)
        + struct.pack("<II", len(json_chunk), 0x4E4F534A)
        + json_chunk
        + struct.pack("<II", len(binary), 0x004E4942)
        + binary
    )


def main():
    document, binary = read_glb(SOURCE)
    nodes = document["nodes"]
    node_indices = {node.get("name"): index for index, node in enumerate(nodes)}
    bone_specs = [
        ("body", "UterusBody_JNT", (0.085, 0.145, 0.375)),
        ("fundus", "Fundus_JNT", (0.08, 0.24, 0.59)),
        ("lower-segment", "LowerSegment_JNT", (0.095, 0.005, 0.18)),
        ("cervix", "Cervix_JNT", (0.11, -0.11, 0.025)),
    ]
    if any(mesh_name not in node_indices for mesh_name, _, _ in bone_specs):
        raise ValueError("Source model is missing a mesh needed by the educational rig")

    root_index = len(nodes)
    nodes.append({"name": "OBGYN_EducationalRig", "children": []})
    joint_indices = []
    for mesh_name, joint_name, pivot in bone_specs:
        joint_index = len(nodes)
        nodes.append({"name": joint_name, "translation": list(pivot)})
        nodes[root_index]["children"].append(joint_index)
        joint_indices.append(joint_index)

    scene = document["scenes"][document.get("scene", 0)]
    scene.setdefault("nodes", []).append(root_index)

    inverse_bind_values = []
    for _, _, pivot in bone_specs:
        inverse_bind_values.extend([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            -pivot[0], -pivot[1], -pivot[2], 1,
        ])
    inverse_bind_accessor = append_accessor(
        document, binary, inverse_bind_values, 5126, "MAT4", len(joint_indices)
    )
    skin_index = len(document.setdefault("skins", []))
    document["skins"].append({
        "name": "Illustrative uterine wall rig",
        "inverseBindMatrices": inverse_bind_accessor,
        "skeleton": root_index,
        "joints": joint_indices,
    })

    for joint_slot, (mesh_name, _, _) in enumerate(bone_specs):
        node = nodes[node_indices[mesh_name]]
        node["skin"] = skin_index
        for primitive in document["meshes"][node["mesh"]]["primitives"]:
            vertex_count = document["accessors"][primitive["attributes"]["POSITION"]]["count"]
            primitive["attributes"]["JOINTS_0"] = append_accessor(
                document, binary, [joint_slot, 0, 0, 0] * vertex_count,
                5123, "VEC4", vertex_count, target=34962,
            )
            primitive["attributes"]["WEIGHTS_0"] = append_accessor(
                document, binary, [1.0, 0.0, 0.0, 0.0] * vertex_count,
                5126, "VEC4", vertex_count, target=34962,
            )

    times = [0.0, 0.45, 0.9, 1.35, 1.8, 2.25, 2.7]
    time_accessor = append_accessor(
        document, binary, times, 5126, "SCALAR", len(times),
        minimum=[min(times)], maximum=[max(times)],
    )
    scale_profiles = [
        ([1, 1, 1], [0.97, 1.02, 1], [0.92, 1.08, 1], [0.95, 1.04, 1], [0.99, 1.01, 1], [1, 1, 1], [1, 1, 1]),
        ([1, 1, 1], [0.98, 1.02, 1], [0.94, 1.06, 1], [0.96, 1.04, 1], [0.99, 1.01, 1], [1, 1, 1], [1, 1, 1]),
        ([1, 1, 1], [1.01, 0.99, 1], [1.04, 0.98, 1], [1.02, 0.99, 1], [1.01, 1, 1], [1, 1, 1], [1, 1, 1]),
        ([1, 1, 1], [1, 1.01, 1], [1, 1.025, 1], [1, 1.015, 1], [1, 1.005, 1], [1, 1, 1], [1, 1, 1]),
    ]
    samplers = []
    channels = []
    for joint_index, profile in zip(joint_indices, scale_profiles):
        output_accessor = append_accessor(
            document, binary, [value for frame in profile for value in frame],
            5126, "VEC3", len(times),
        )
        sampler_index = len(samplers)
        samplers.append({"input": time_accessor, "output": output_accessor, "interpolation": "LINEAR"})
        channels.append({"sampler": sampler_index, "target": {"node": joint_index, "path": "scale"}})
    document.setdefault("animations", []).append({
        "name": "Uterine contraction (illustrative)",
        "samplers": samplers,
        "channels": channels,
        "extras": {"description": "A simplified skeletal teaching animation. It does not represent measured forces, cervical dilation or an individual labour pattern."},
    })

    document["asset"].setdefault("extras", {})["educationalRig"] = "Four rigidly weighted bones with a simplified contraction/relaxation clip; not a patient-specific or clinical simulation."
    write_glb(OUTPUT, document, binary)
    print(f"Wrote {OUTPUT} ({OUTPUT.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
