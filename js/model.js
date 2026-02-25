import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

const container = document.getElementById('3d-container');

// 1. Setup Scene, Camera, and Renderer
const scene = new THREE.Scene();

// We want the background to be transparent to show the CSS background color
scene.background = null; 

const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 1.5, 5); // Adjust based on your model's scale

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// 2. Add Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(0, 5, 5);
scene.add(directionalLight);

// 3. Add Orbit Controls (Allows rotation)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = false; // Disable zooming if you want it fixed in place
controls.target.set(0, 1, 0); // Focus on the chest/head area

// 4. Load the FBX Model
let mixer; // Used for the idle animation
const loader = new FBXLoader();

// Make sure to put your actual FBX file in the assets folder!
loader.load('assets/sakura.fbx', (object) => {
    
    // Scale down if the model is too big. Adjust this number!
    object.scale.set(0.01, 0.01, 0.01); 
    
    // Center the model roughly
    object.position.set(0, 0, 0);
    
    scene.add(object);

    // Setup Animation
    if (object.animations && object.animations.length > 0) {
        mixer = new THREE.AnimationMixer(object);
        // Play the first animation (usually the idle animation)
        const action = mixer.clipAction(object.animations[0]);
        action.play();
    }
}, undefined, (error) => {
    console.error('Error loading FBX model:', error);
});

// 5. Animation Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta); // Update animation
    
    controls.update(); // Update rotation controls
    renderer.render(scene, camera);
}

animate();

// 6. Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});