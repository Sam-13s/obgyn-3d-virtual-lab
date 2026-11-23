import { useEffect, useMemo, useRef } from 'react';
import { useAnimations, useGLTF } from '@react-three/drei';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
import * as THREE from 'three';
import ModelLabel from './ModelLabel.jsx';
import { reproductiveAnnotations, selectionForModelNode } from '../data/anatomyModelCatalog.js';

const modelNodeByPart = new Map(reproductiveAnnotations.flatMap(({ part, nodes }) => nodes.map((node) => [node, part])));

/** Shared licensed, annotated reproductive atlas model and its optional skeletal teaching clip. */
export default function ReproductiveGLB({ selected, onSelect, animationPlaying = false, animationSpeed = 1, onLoaded, url }) {
  const gltf = useGLTF(url);
  const model = useMemo(() => clone(gltf.scene), [gltf.scene]);
  const root = useRef();
  const { actions } = useAnimations(gltf.animations, root);
  const contraction = actions['Uterine contraction (illustrative)'];

  useEffect(() => {
    model.traverse((object) => {
      if (!object.isMesh) return;
      object.castShadow = true;
      object.receiveShadow = true;
      object.material = Array.isArray(object.material)
        ? object.material.map((material) => material.clone())
        : object.material.clone();
    });
    onLoaded?.();
  }, [model, onLoaded]);

  useEffect(() => {
    model.traverse((object) => {
      if (!object.isMesh) return;
      const part = selectionForModelNode(object.name) || modelNodeByPart.get(object.parent?.name);
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) {
        if (!material?.emissive) continue;
        material.emissive.set(part === selected ? '#ffd77a' : '#000000');
        material.emissiveIntensity = part === selected ? 0.62 : 0;
      }
    });
  }, [model, selected]);

  useEffect(() => {
    if (!contraction) return undefined;
    contraction.setLoop(THREE.LoopRepeat, Infinity);
    if (animationPlaying) {
      contraction.reset();
      contraction.play();
    } else {
      contraction.stop();
    }
    return () => contraction.stop();
  }, [contraction, animationPlaying]);

  useEffect(() => {
    if (contraction) contraction.timeScale = animationSpeed;
  }, [contraction, animationSpeed]);

  const annotation = reproductiveAnnotations.find((item) => item.part === selected) || reproductiveAnnotations[0];

  return <group ref={root} onClick={(event) => {
    event.stopPropagation();
    const part = selectionForModelNode(event.object?.name);
    if (part) onSelect(part);
  }}>
    <primitive object={model} />
    <ModelLabel className="anatomy-floating-label" part={annotation.part} selected={selected} onSelect={onSelect} position={annotation.position} target={annotation.target}>{annotation.label}</ModelLabel>
  </group>;
}
