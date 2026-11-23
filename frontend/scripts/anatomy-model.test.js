import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { AnimationMixer } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { readGlbDocument } from './glb-utils.mjs';
import { reproductiveAnnotations, reproductiveModelSource, selectionForModelNode } from '../src/data/anatomyModelCatalog.js';

const here = new URL('.', import.meta.url);
const modelPath = fileURLToPath(new URL('../public/models/reproductive-rigged.glb', here));
const document = readGlbDocument(await readFile(modelPath));

test('the packaged GLB is attributed and contains the named reproductive anatomy meshes', async () => {
  assert.match(document.asset.copyright, /HuBMAP.*CC BY 4\.0/);
  assert.equal(reproductiveModelSource.license, 'CC BY 4.0');
  const meshNames = new Set(document.nodes.filter((node) => node.mesh !== undefined).map((node) => node.name));
  for (const annotation of reproductiveAnnotations) {
    for (const nodeName of annotation.nodes) assert.ok(meshNames.has(nodeName), `missing annotation target: ${nodeName}`);
  }
  const attribution = await readFile(fileURLToPath(new URL('../assets/ATTRIBUTION.md', here)), 'utf8');
  assert.match(attribution, /Creative Commons Attribution 4\.0/);
});

test('the reproductive mesh nodes are skinned and include a named contraction clip', () => {
  assert.equal(document.skins.length, 1);
  assert.deepEqual(document.skins[0].joints.map((index) => document.nodes[index].name), [
    'UterusBody_JNT', 'Fundus_JNT', 'LowerSegment_JNT', 'Cervix_JNT',
  ]);
  assert.equal(document.animations.length, 1);
  assert.equal(document.animations[0].name, 'Uterine contraction (illustrative)');
  assert.equal(document.animations[0].channels.length, 4);
  const skinnedNodes = document.nodes.filter((node) => node.skin === 0);
  assert.equal(skinnedNodes.length, 4);
  for (const node of skinnedNodes) {
    const primitive = document.meshes[node.mesh].primitives[0];
    assert.ok(primitive.attributes.JOINTS_0 !== undefined);
    assert.ok(primitive.attributes.WEIGHTS_0 !== undefined);
  }
});

test('Three.js can load the GLB skin and the contraction clip deforms the uterine rig', async () => {
  const bytes = await readFile(modelPath);
  const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  const gltf = await new Promise((resolve, reject) => new GLTFLoader().parse(arrayBuffer, '', resolve, reject));
  assert.equal(gltf.animations[0].name, 'Uterine contraction (illustrative)');
  assert.equal(gltf.scene.children.filter((child) => child.isSkinnedMesh).length, 4);
  const bodyJoint = gltf.scene.getObjectByName('UterusBody_JNT');
  const mixer = new AnimationMixer(gltf.scene);
  mixer.clipAction(gltf.animations[0]).play();
  mixer.setTime(0.9);
  assert.ok(bodyJoint.scale.x < 1, 'the body joint should contract at the peak keyframe');
  mixer.stopAllAction();
  mixer.uncacheRoot(gltf.scene);
});

test('annotation node names map to selectable labelled structures', () => {
  assert.equal(selectionForModelNode('fundus'), 'fundus');
  assert.equal(selectionForModelNode('left-ovary'), 'ovary');
  assert.equal(selectionForModelNode('uterine-veins'), 'vessels');
  assert.equal(reproductiveAnnotations.length, 9);
});

test('offline worker precaches the local model and never caches API responses', async () => {
  const worker = await readFile(fileURLToPath(new URL('../public/sw.js', here)), 'utf8');
  assert.match(worker, /models\/reproductive-rigged\.glb/);
  assert.match(worker, /url\.pathname\.includes\('\/api\/'\)/);
  assert.match(worker, /request\.method !== 'GET'/);
});
