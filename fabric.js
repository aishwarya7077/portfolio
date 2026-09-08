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
    const params = { scale: 140, freq: 4.2, amp: 7, speed: 1.4, wells: 2, pull: 12.5, twist: 3.7 };

    const scene = new THREE.Scene();
    // FogExp2 falls off as exp(-(density*d)^2), so the density has to track
    // the camera distance below (~410 units) or the whole field fogs to black.
    scene.fog = new THREE.FogExp2(0x0b0710, 0.001);

    // The field spans roughly `scale * 2` units across (twist can push it a
    // little wider), so the opening shot is framed from that half-extent
    // rather than a hard-coded distance: back off far enough that the whole
    // sheet fits the vertical FOV, then add headroom for the horizontal fit
    // once we know the real aspect ratio (see frameField below).
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 2000);

    const FIELD_RADIUS = params.scale * 1.25;

    function fitDistance(aspect) {
        const vFov = THREE.MathUtils.degToRad(camera.fov);
        const hFov = 2 * Math.atan(Math.tan(vFov / 2) * Math.max(aspect, 0.0001));
        // Whichever axis is tighter decides how far back we have to sit.
        return FIELD_RADIUS / Math.sin(Math.min(vFov, hFov) / 2);
    }

    // Opening camera: pulled back to hold the whole field, tilted down so the
    // wave reads as a sheet rather than edge-on. The user is free to zoom
    // anywhere inside [minDistance, maxDistance] afterwards.
    let framed = false;
    function frameField(aspect) {
        const dist = fitDistance(aspect);
        // Keep the established viewing angle (~25 degrees above the plane).
        const dir = new THREE.Vector3(0, 0.44, 0.9).normalize();
        camera.position.copy(dir.multiplyScalar(dist));
        camera.lookAt(0, 0, 0);
        controls.maxDistance = Math.max(dist * 1.6, 320);
        controls.update();
    }

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.autoRotate = !prefersReducedMotion;
    controls.autoRotateSpeed = 0.5;
    controls.minDistance = 40;
    controls.maxDistance = 320; // widened by frameField once the aspect is known
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
        // On phones the hint and controls are lifted out of the overlay and
        // stacked above the canvas (see styles), so the stage box is taller
        // than the canvas. Measure the canvas itself and let CSS keep owning
        // its layout size -- setSize's third arg stops the renderer writing
        // inline width/height that would override the flex sizing.
        const stacked = window.matchMedia('(max-width: 768px)').matches;
        const box = stacked ? canvas.getBoundingClientRect() : null;
        const w = Math.round(box ? box.width : stage.clientWidth);
        const h = Math.round(box ? box.height : stage.clientHeight);
        if (w === 0 || h === 0) return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, !stacked);
        composer.setSize(w, h);
        // Frame the opening shot once, on the first resize that reports a
        // real size. Later resizes must not yank the camera back: by then
        // the user may have zoomed or orbited where they like.
        if (!framed) {
            framed = true;
            frameField(camera.aspect);
        }
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

            // depth-driven color, remapped onto dyed paper stock:
            // vermilion (0.03) at the crest -> sage (0.42) in the trough.
            // Saturation stays low and lightness high so the mesh reads as
            // pigment on paper rather than emitted light.
            const depth = Math.abs(z) / (params.amp + 0.001);
            let hue = (0.03 + depth * 0.39 + 0.01 * Math.sin(time)) % 1.0;
            if (hue < 0) hue += 1;
            const sat = 0.34 + 0.16 * depth;
            const light = 0.62 - 0.14 * depth;
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

    // The stage grows to fill the viewport as it scrolls into view and
    // shrinks again on the way out (see .fabric-cinematic in styles).
    // That is a CSS-driven size change, which fires no window resize
    // event, so the renderer has to watch the element itself or the
    // scene would stretch to the old aspect ratio.
    if (typeof ResizeObserver !== 'undefined') {
        const stageRO = new ResizeObserver(() => resize());
        stageRO.observe(stage);
        // In the stacked mobile layout the canvas resizes independently of
        // the stage (the control panel above it can reflow), so watch both.
        stageRO.observe(canvas);
    }

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
