import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";
import { Art } from "./fever.js";
let camera, scene, renderer, material, clock, smokeTexture, smokeTextureVariant, smokeParticles, delta, bumpMapTexture, randomLight;
let art = [];
let canvas;
let started = false;
let time = 0;

const newContext = () => {
  const aCtx = window.AudioContext || window.webkitAudioContext;
  return new aCtx({ sampleRate: 48000 });
};

window.addEventListener("click", () => {
  if (!started) {
    init();
    animate();
    started = true;
    const div = document.querySelector("div");
    if (div) {
      div.style.opacity = 0;
    }
  }
});

function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

function init() {
  clock = new THREE.Clock();

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  camera.position.z = 1000;
  scene.add(camera);
 
  bumpMapTexture = new THREE.TextureLoader().load("bump.jpg");
  material = new THREE.MeshStandardMaterial({
    color: 0xaa6666,
    roughness: 0.7,
    metalness: 0.5,
    bumpMap: bumpMapTexture,
    bumpScale: 10,
  });


  // Add a ground plane with MeshStandardMaterial to receive shadows
  const planeGeometry = new THREE.PlaneGeometry(2000, 2000);
  const planeMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color("red"), // Set the color here
    roughness: 0.8,
  });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2;
  plane.receiveShadow = true; // Enable shadow receiving for the plane

  smokeTexture = new THREE.TextureLoader().load("Smoke-Element.png");
  smokeTextureVariant = new THREE.TextureLoader().load("smoke.webp");
  smokeParticles = [];

  document.body.appendChild(renderer.domElement);
  canvas = document.querySelector("canvas");
  for (let x = 0; x < 5; x++) {
    const thickness = 500; 
    const smokeGeometry = new THREE.BoxGeometry(600, 600, thickness);
    const artC = new Art(
      newContext(),
      canvas,
      smokeGeometry,
      new THREE.MeshStandardMaterial({
        color: 0x00dddd,
        map: Math.random() < 0.5 ? smokeTexture : smokeTexture,
        transparent: true,
        bumpMap: bumpMapTexture,
        bumpScale: 10,
      })
    );
    art.push(artC);
    scene.add(artC.particle);
    addSmokeLight(artC.particle, artC);
  }
}

function animate() {
  delta = clock.getDelta();
  // moveRandomLight(); // Call the moveRandomLight function
  evolveSmoke();
  render();
  requestAnimationFrame(animate);

}

function moveRandomLight() {
  const radius = 500; // Adjust the radius as needed
  const speed = 0.005; // Adjust the speed of movement
  time += speed;
  const x = Math.cos(time) * radius;
  const y = Math.sin(time) * radius;
  randomLight.position.set(x, y, 0);// Adjust the range as needed
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
    ap.smokeLight.children[0].intensity = ap.output.gain.value * 25
    if (ap.output.gain.value <= 0) {
      if (art.length <= 10) {
        const thickness = 50;
        const smokeGeometry = new THREE.BoxGeometry(600, 600, thickness);
        const artC = new Art(
          newContext(),
          canvas,
          smokeGeometry,
          new THREE.MeshStandardMaterial({
            color: 0x00dddd,
            map: Math.random() < 0.5 ? smokeTexture : smokeTexture,
            transparent: true,
            bumpMap: bumpMapTexture,
            bumpScale: 10,
          })
        );
        art.push(artC);
        scene.add(artC.particle);
        addSmokeLight(artC.particle, artC);
      }
    }
    if (ap.particle.material.opacity <= 0) {
      scene.remove(ap.particle);
      art = art.filter((f) => f.id !== ap.id);
    }
  }
}
let smokeLights = [];

function addSmokeLight(smokeParticle, c) {
  const randomColor = new THREE.Color(Math.random(), Math.random(), Math.random());
  const smokeLight = new THREE.PointLight(randomColor, 1, 600);
  smokeLight.castShadow = true;
  smokeParticle.add(smokeLight);
  c.smokeLight = smokeParticle;
  smokeLight.position.set(0, 0, 0);
}

window.addEventListener("resize", (_) => resize());

function render() {
  renderer.render(scene, camera);
}
