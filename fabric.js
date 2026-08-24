// ===== SPACE-TIME FABRIC: vanilla Three.js port =====
// Ported from a React Three Fiber prototype (space_time_fabric.jsx) into a
// dependency-free ES module driven by native <script type="importmap">.
// Starts only when scrolled into view, and stops when scrolled away.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

function initFabric() {
    const stage = document.getElementById('fabricStage');
    const canvas = document.getElementById('fabricCanvas');
    const loading = document.getElementById('fabricLoading');
    if (!stage || !canvas) return;

    const isSmallScreen = window.matchMedia('(max-width: 768px)').matches;
    const isLowPower = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const COUNT = isSmallScreen ? 5000 : (isLowPower ? 9000 : 16000);

    // Live-tunable params, wired to the range inputs below
    const params = { scale: 140, freq: 2.2, amp: 8, speed: 1.4, wells: 2, pull: 8, twist: 2 };

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b0710, 0.008);

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.set(0, 90, 190);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.autoRotate = !prefersReducedMotion;
    controls.autoRotateSpeed = 0.5;
    controls.minDistance = 60;
    controls.maxDistance = 320;
    controls.update();

    const geometry = new THREE.TetrahedronGeometry(0.5);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const mesh = new THREE.InstancedMesh(geometry, material, COUNT);
    mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(COUNT * 3), 3);
    scene.add(mesh);

    const dummy = new THREE.Object3D();
    const target = new THREE.Vector3();
    const color = new THREE.Color();

    // current eased position per particle, lerped toward `target` each frame
    const positions = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomStrength = isLowPower ? 1.0 : 1.4;
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), bloomStrength, 0.4, 0.15);
    composer.addPass(bloomPass);

    function resize() {
        const w = stage.clientWidth;
        const h = stage.clientHeight;
        if (w === 0 || h === 0) return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        composer.setSize(w, h);
    }

    const clock = new THREE.Clock();
    let rafId = null;
    let running = false;

    function tick() {
        rafId = requestAnimationFrame(tick);
        const time = clock.getElapsedTime() * params.speed;

        for (let i = 0; i < COUNT; i++) {
            // GLSL-style hash: fract() is always non-negative, unlike JS's signed %
            const hu = Math.sin(i * 12.9898) * 43758.5453;
            const hv = Math.sin(i * 78.233) * 12345.6789;
            const u = hu - Math.floor(hu);
            const v = hv - Math.floor(hv);

            const x = (u * 2.0 - 1.0) * params.scale;
            const y = (v * 2.0 - 1.0) * params.scale;

            const wave =
                Math.sin(x * 0.02 * params.freq + time) +
                Math.sin(y * 0.02 * params.freq - time * 0.8);

            let z = wave * params.amp;

            const w1x = Math.sin(time * 0.3) * params.scale * 0.4;
            const w1y = Math.cos(time * 0.2) * params.scale * 0.4;
            const w2x = Math.sin(time * 0.5 + 2.0) * params.scale * 0.3;
            const w2y = Math.cos(time * 0.4 + 1.0) * params.scale * 0.3;

            const dx1 = x - w1x, dy1 = y - w1y;
            const d1 = Math.sqrt(dx1 * dx1 + dy1 * dy1 + 4.0);
            const dx2 = x - w2x, dy2 = y - w2y;
            const d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2 + 4.0);

            const bend1 = -params.pull / d1;
            const bend2 = -params.pull / d2;
            z += (bend1 + bend2) * (params.wells > 1.0 ? 1.0 : params.wells * 0.5);

            const ang = params.twist * (bend1 - bend2);
            const cosA = Math.cos(ang);
            const sinA = Math.sin(ang);
            const tx = x * cosA - y * sinA;
            const ty = x * sinA + y * cosA;

            target.set(tx, ty, z);

            // depth-driven color, remapped into the site's rose (0.92) -> violet (0.74) hue range
            const depth = Math.abs(z) / (params.amp + 0.001);
            let hue = (0.92 - depth * 0.18 + 0.03 * Math.sin(time)) % 1.0;
            if (hue < 0) hue += 1;
            const sat = 0.55 + 0.3 * depth;
            const light = 0.55 + 0.25 * (1.0 - depth);
            color.setHSL(hue, sat, light);

            const pi = i * 3;
            positions[pi] += (target.x - positions[pi]) * 0.1;
            positions[pi + 1] += (target.y - positions[pi + 1]) * 0.1;
            positions[pi + 2] += (target.z - positions[pi + 2]) * 0.1;

            dummy.position.set(positions[pi], positions[pi + 1], positions[pi + 2]);
            dummy.updateMatrix();
            mesh.setMatrixAt(i, dummy.matrix);
            mesh.setColorAt(i, color);
        }

        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

        controls.update();
        composer.render();
    }

    function start() {
        if (running) return;
        running = true;
        clock.start();
        resize();
        tick();
    }

    function stop() {
        running = false;
        if (rafId !== null) cancelAnimationFrame(rafId);
        rafId = null;
    }

    // Lazy-start: only render while the section is actually visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) start();
            else stop();
        });
    }, { threshold: 0.1 });
    observer.observe(stage);

    window.addEventListener('resize', resize);

    // Wire up the range-slider controls
    function bindSlider(inputId, valId, key, parse) {
        const input = document.getElementById(inputId);
        const val = document.getElementById(valId);
        if (!input) return;
        input.addEventListener('input', () => {
            params[key] = parse(input.value);
            if (val) val.textContent = input.value;
        });
    }
    bindSlider('fabricFreq', 'fabricFreqVal', 'freq', parseFloat);
    bindSlider('fabricAmp', 'fabricAmpVal', 'amp', parseFloat);
    bindSlider('fabricPull', 'fabricPullVal', 'pull', parseFloat);
    bindSlider('fabricTwist', 'fabricTwistVal', 'twist', parseFloat);

    if (loading) loading.classList.add('hidden');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFabric);
} else {
    initFabric();
}
