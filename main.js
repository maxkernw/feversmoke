import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";
import { Art } from "./fever.js";
let camera,
  scene,
  renderer,
  geometry,
  material,
  mesh,
  clock,
  cubeSineDriver,
  light,
  smokeTexture,
  smokeParticles,
  delta;
let art = [];
let canvas;
const newContext = () => {
  const aCtx = window.AudioContext || window.webkitAudioContext;
  return new aCtx({ sampleRate: 48000 });
};
let started = false;
window.addEventListener("click", () => {
  if (!started) {
    init();
    animate();
    const div = document.querySelector("div");
    if (div) {
      div.style.opacity = 0;
    }
    started = true;
  }
});

function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
}
function init() {
  clock = new THREE.Clock();

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  scene = new THREE.Scene();
  scene.background = new THREE.Color("#ece9e9");
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  camera.position.z = 1000;
  scene.add(camera);

  geometry = new THREE.CubeGeometry(600, 600, 600);
  material = new THREE.MeshLambertMaterial({
    color: "0xaa6666",
    wireframe: false,
  });
  mesh = new THREE.Mesh(geometry, material);
  cubeSineDriver = 0;

  light = new THREE.DirectionalLight(0xffffff, 0.5);
  light.position.set(-1, 0, 1);
  scene.add(light);

  smokeTexture = THREE.ImageUtils.loadTexture("Smoke-Element.png");

  smokeParticles = [];

  document.body.appendChild(renderer.domElement);
  canvas = document.querySelector("canvas");
  for (let x = 0; x < 5; x++) {
    const artC = new Art(
      newContext(),
      canvas,
      new THREE.PlaneGeometry(600, 600),
      new THREE.MeshLambertMaterial({
        color: 0x00dddd,
        map: smokeTexture,
        transparent: true,
      })
    );
    art.push(artC);
    scene.add(artC.particle);
    smokeParticles.push(artC.particle);
  }
}

function animate() {
  delta = clock.getDelta();
  requestAnimationFrame(animate);
  evolveSmoke();
  render();
}

function evolveSmoke() {
  for (const ap of art) {
    ap.move();
    ap.particle.rotation.z += delta * 0.02;
    ap.particle.material.opacity = ap.output.gain.value * 15;
    ap.particle.material.shadowSide = THREE.DoubleSide;

    ap.particle.position.z =
      ap.particle.position.z + ap.output.gain.value * 5 + 1;
    ap.particle.position.x = ap.particle.position.x + ap.output.gain.value * 2;
    ap.particle.position.y = ap.particle.position.y + ap.output.gain.value * 2;
    if (ap.output.gain.value <= 0) {
      if (art.length <= 10) {
        const artC = new Art(
          newContext(),
          canvas,
          new THREE.PlaneGeometry(600, 600),
          new THREE.MeshLambertMaterial({
            color: 0x00dddd,
            map: smokeTexture,
            transparent: true,
          })
        );
        art.push(artC);
        scene.add(artC.particle);
      }
    }
    if (ap.particle.material.opacity <= 0) {
      scene.remove(ap.particle);
      art = art.filter((f) => f.id !== ap.id);
    }
  }
}
window.addEventListener("resize", (_) => resize());
function render() {
  mesh.rotation.x += 0.005;
  mesh.rotation.y += 0.01;
  cubeSineDriver += 0.01;
  mesh.position.z = 500 + Math.sin(cubeSineDriver) * 500;
  renderer.render(scene, camera);
}
