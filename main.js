import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Initialize scene, camera and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.style.width = '100vw';
renderer.domElement.style.height = '100vh';
renderer.domElement.style.overflow = 'hidden';
document.getElementById('three-scene').appendChild(renderer.domElement);

// Add orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;

// Add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Initialize cube variables
let model;
const colors = [
    new THREE.Color(0x00ff00), // Green
    new THREE.Color(0xff0000), // Red
    new THREE.Color(0x0000ff), // Blue
    new THREE.Color(0xff00ff), // Magenta
    new THREE.Color(0xffff00), // Yellow
    new THREE.Color(0x00ffff)  // Cyan
];
let currentColorIndex = 0;
const modelColor = colors[currentColorIndex];
const initialScale = 5;
const initialCameraZ = 20;

// Mouse tracking variables
const mouse = new THREE.Vector2();
let isMouseDown = false;

// Create and setup cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({
    color: modelColor,
    emissive: modelColor,
    emissiveIntensity: 0.5,
    metalness: 0.5,
    roughness: 0.5
});
model = new THREE.Mesh(geometry, material);
model.scale.set(initialScale, initialScale, initialScale);
scene.add(model);

// Set initial camera position
camera.position.z = initialCameraZ;

const moveSpeed = 0.5;

// Keep track of button press history
const buttonHistory = [];
const maxHistoryLength = 10;

// Controller support
function updateControllerInput() {
    const gamepads = navigator.getGamepads();
    if (gamepads[0]) {
        const gamepad = gamepads[0];
        
        // Right joystick for position
        const rightX = gamepad.axes[2];
        const rightY = gamepad.axes[3];
        
        // Left joystick for rotation and flipping
        const leftX = gamepad.axes[0];
        const leftY = gamepad.axes[1];
        
        if (model) {
            // Apply position changes if joystick moved beyond deadzone
            if (Math.abs(rightX) > 0.1) {
                model.position.x += rightX * moveSpeed;
            }
            if (Math.abs(rightY) > 0.1) {
                model.position.y -= rightY * moveSpeed; // Invert Y for natural feel
            }
            
            // Apply rotation from left joystick X
            if (Math.abs(leftX) > 0.1) {
                model.rotation.y += leftX * 0.05;
            }
            
            // Apply flipping from left joystick Y
            if (Math.abs(leftY) > 0.1) {
                model.rotation.x += leftY * 0.05;
                model.rotation.z += leftY * 0.05;
            }

            // Check for A button press (button index 0)
            if (gamepad.buttons[0].pressed) {
                currentColorIndex = (currentColorIndex + 1) % colors.length;
                const newColor = colors[currentColorIndex];
                model.material.color = newColor;
                model.material.emissive = newColor;
            }
        }
    }
}

document.addEventListener('keydown', (event) => {
    if (!model) return;
    
    switch(event.key) {
        case 'ArrowUp':
            model.position.y += moveSpeed;
            break;
        case 'ArrowDown':
            model.position.y -= moveSpeed;
            break;
        case 'ArrowLeft':
            model.position.x -= moveSpeed;
            break;
        case 'ArrowRight':
            model.position.x += moveSpeed;
            break;
        case 'PageUp':
            model.position.z -= moveSpeed;
            break;
        case 'PageDown':
            model.position.z += moveSpeed;
            break;
        case 'q':
            if (model) {
                model.position.set(0, 0, 0);
            }
            camera.position.set(0, 0, initialCameraZ);
            controls.reset();
            break;
        case 'r': // Reset position and camera
            resetToInitialPosition();
            break;
    }
});

function resetToInitialPosition() {
    if (model) {
        model.position.set(0, 0, 0);
    }
    camera.position.set(0, 0, initialCameraZ);
    controls.reset();
}

document.addEventListener('mousemove', (event) => {
    if (!model || !isMouseDown) return;
    
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    model.position.x = mouse.x * 20;
    model.position.y = mouse.y * 20;
});

document.addEventListener('mousedown', () => {
    isMouseDown = true;
});

document.addEventListener('mouseup', () => {
    isMouseDown = false;
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    updateControllerInput();
    controls.update();
    renderer.render(scene, camera);
}

animate();