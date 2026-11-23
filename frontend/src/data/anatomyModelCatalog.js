export const reproductiveModelUrl = `${import.meta.env?.BASE_URL ?? "/"}models/reproductive-rigged.glb`;

export const reproductiveModelSource = {
  title: "HuBMAP Human Reference Atlas 3D Reference Object Library",
  authors: "Kristen Browne, Heidi Schlehlein et al.",
  adaptation: "Adapted by OrganUI",
  license: "CC BY 4.0",
  url: "https://organui.com/docs/components/uterus",
  modelUrl: "https://github.com/organui/uterus-3d/blob/404a6039b2d667e2b4e08ae71d4964cd9b963cf1/public/models/reproductive.glb",
};

export const reproductiveAnnotations = [
  { part: "uterus", label: "Uterus", position: [-1.75, 1.4, 0.82], target: [0.085, 0.145, 0.375], nodes: ["body", "cornua", "lower-segment"] },
  { part: "fundus", label: "Fundus", position: [-1.75, 0.82, 0.82], target: [0.08, 0.28, 0.62], nodes: ["fundus"] },
  { part: "tube", label: "Fallopian tube", position: [1.75, 1.38, 0.82], target: [-0.58, 0.66, 0.56], nodes: ["ampulla", "infundibulum", "fimbriae", "isthmus", "tubal-ostia"] },
  { part: "ovary", label: "Ovary", position: [1.75, 0.63, 0.82], target: [0.99, 0.53, 0.49], nodes: ["left-ovary", "right-ovary", "mesovarium"] },
  { part: "cervix", label: "Cervix", position: [1.75, -0.34, 0.82], target: [0.11, -0.13, 0.13], nodes: ["cervix", "internal-os", "external-os", "cervicovaginal-junction"] },
  { part: "vagina", label: "Vagina", position: [-1.75, -0.55, 0.82], target: [0.09, -0.78, 0.13], nodes: ["vagina"] },
  { part: "bladder", label: "Bladder", position: [-1.75, -1.12, 0.82], target: [0.05, -0.37, 0.91], nodes: ["bladder"] },
  { part: "ligaments", label: "Pelvic ligaments", position: [1.75, -1.1, 0.82], target: [0.02, 0.12, -0.55], nodes: ["broad-ligament", "mesosalpinx", "mesovarium", "ovarian-ligaments", "suspensory-ligaments", "round-ligaments", "cardinal-ligaments", "uterosacral-ligaments"] },
  { part: "vessels", label: "Uterine vessels", position: [-1.75, -1.65, 0.82], target: [-0.45, -0.02, 0.28], nodes: ["uterine-arteries", "uterine-veins"] },
];

const nodeToPart = new Map(reproductiveAnnotations.flatMap(({ part, nodes }) => nodes.map((node) => [node, part])));

export function selectionForModelNode(nodeName = "") {
  return nodeToPart.get(nodeName.toLowerCase()) ?? null;
}

export function animationNames(animations = []) {
  return animations.map((clip) => clip.name).filter(Boolean);
}
