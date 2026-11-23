import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function FetalDevelopment3D({ week = 28, afi = 14, wireframe = false, isPlaying = true }) {
  const mountRef = useRef(null);
  const stateRef = useRef({ week, afi, wireframe, isPlaying });

  useEffect(() => {
    stateRef.current = { week, afi, wireframe, isPlaying };
  }, [week, afi, wireframe, isPlaying]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 480;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040914);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 5.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const keyLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    keyLight.position.set(4, 6, 5);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0xf43f5e, 0.9);
    rimLight.position.set(-4, -3, 4);
    scene.add(rimLight);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 1. Translucent Uterus Wall
    const uterusGeo = new THREE.SphereGeometry(1.9, 36, 36);
    uterusGeo.scale(0.88, 1.18, 0.82);
    const uterusMat = new THREE.MeshPhysicalMaterial({
      color: 0xe11d48,
      transparent: true,
      opacity: 0.22,
      roughness: 0.35,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const uterusMesh = new THREE.Mesh(uterusGeo, uterusMat);
    rootGroup.add(uterusMesh);

    // 2. Amniotic Fluid Sac (scales with AFI)
    const sacGeo = new THREE.SphereGeometry(1.62, 32, 32);
    sacGeo.scale(0.85, 1.12, 0.8);
    const sacMat = new THREE.MeshPhysicalMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.26,
      roughness: 0.15,
      depthWrite: false
    });
    const sacMesh = new THREE.Mesh(sacGeo, sacMat);
    rootGroup.add(sacMesh);

    // 3. Discoid Placenta (Fundal-Posterior Wall)
    const placentaGeo = new THREE.CylinderGeometry(0.68, 0.74, 0.2, 28);
    const placentaMat = new THREE.MeshStandardMaterial({ color: 0x9f1239, roughness: 0.65 });
    const placentaMesh = new THREE.Mesh(placentaGeo, placentaMat);
    placentaMesh.position.set(0.65, 1.15, -0.45);
    placentaMesh.rotation.set(0.4, 0, -0.55);
    rootGroup.add(placentaMesh);

    // 4. Umbilical Cord (3-vessel helical curve)
    const cordCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.55, 1.05, -0.38),
      new THREE.Vector3(0.42, 0.5, 0.18),
      new THREE.Vector3(0.18, 0.05, 0.25),
      new THREE.Vector3(0.0, -0.15, 0.12)
    ]);
    const cordGeo = new THREE.TubeGeometry(cordCurve, 28, 0.045, 10, false);
    const cordMat = new THREE.MeshStandardMaterial({ color: 0xfda4af, roughness: 0.35 });
    const cordMesh = new THREE.Mesh(cordGeo, cordMat);
    rootGroup.add(cordMesh);

    // 5. Fetus Group (Head + Flexed Spine/Torso + Limbs)
    const fetusGroup = new THREE.Group();
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfecdd3, roughness: 0.45 });

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.36, 24, 24), skinMat);
    head.position.set(0, -0.58, 0.08);
    fetusGroup.add(head);

    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.58, 12, 20), skinMat);
    torso.position.set(-0.08, 0.02, -0.04);
    torso.rotation.z = 0.22;
    fetusGroup.add(torso);

    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.34, 8, 12), skinMat);
    arm.position.set(0.16, -0.16, 0.18);
    arm.rotation.set(0.6, 0.3, -0.5);
    fetusGroup.add(arm);

    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.4, 8, 12), skinMat);
    leg.position.set(0.14, 0.36, 0.16);
    leg.rotation.set(-0.7, 0.2, -0.4);
    fetusGroup.add(leg);

    rootGroup.add(fetusGroup);

    // Mouse & Touch Orbit Controls
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;

    const onDown = (x, y) => { isDragging = true; prevX = x; prevY = y; };
    const onMove = (x, y) => {
      if (!isDragging) return;
      rootGroup.rotation.y += (x - prevX) * 0.01;
      rootGroup.rotation.x += (y - prevY) * 0.01;
      prevX = x;
      prevY = y;
    };
    const onUp = () => { isDragging = false; };
    const onWheel = (e) => {
      e.preventDefault();
      camera.position.z = THREE.MathUtils.clamp(camera.position.z + e.deltaY * 0.004, 3.2, 8.5);
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', (e) => onDown(e.clientX, e.clientY));
    window.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', onUp);
    dom.addEventListener('touchstart', (e) => onDown(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    dom.addEventListener('touchmove', (e) => onMove(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    dom.addEventListener('touchend', onUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    let frameId;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const { week: w, afi: currentAfi, wireframe: wf, isPlaying: play } = stateRef.current;

      // Normalize week (4..40 -> 0..1)
      const progress = THREE.MathUtils.clamp((w - 4) / 36, 0, 1);
      const fetusScale = 0.28 + progress * 0.85;
      fetusGroup.scale.setScalar(fetusScale);

      // Gentle intrauterine motion & auto-rotation
      fetusGroup.position.y = Math.sin(t * 1.6) * 0.04;
      if (play && !isDragging) {
        rootGroup.rotation.y += 0.004;
      }

      // Dynamic AFI volume & color shift
      const afiScale = 0.72 + THREE.MathUtils.clamp((currentAfi - 2) / 26, 0, 1) * 0.42;
      sacMesh.scale.set(0.85 * afiScale, 1.12 * afiScale, 0.8 * afiScale);
      sacMat.color.setHex(currentAfi < 5 ? 0xf43f5e : currentAfi > 24 ? 0xa855f7 : 0x06b6d4);

      // Wireframe toggle
      uterusMat.wireframe = wf;
      sacMat.wireframe = wf;
      skinMat.wireframe = wf;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 480;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full min-h-[380px] rounded-xl overflow-hidden cursor-grab active:cursor-grabbing" />;
}