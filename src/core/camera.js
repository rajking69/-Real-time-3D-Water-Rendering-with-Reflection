import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class Camera extends THREE.PerspectiveCamera {
    constructor() {
        super(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        console.log('Initializing camera...');

        // Set initial position
        this.position.set(0, 100, 200);
        this.lookAt(0, 0, 0);

        // Setup orbit controls
        const container = document.getElementById('container');
        if (!container) {
            throw new Error('Container element not found!');
        }
        
        this.controls = new OrbitControls(this, container);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 50;
        this.controls.maxDistance = 500;
        this.controls.maxPolarAngle = Math.PI * 0.495;
        
        console.log('Camera initialized:', {
            position: this.position,
            rotation: this.rotation,
            controls: this.controls
        });
    }

    onWindowResize() {
        this.aspect = window.innerWidth / window.innerHeight;
        this.updateProjectionMatrix();
    }

    update() {
        this.controls.update();
    }

    createReflectionCamera() {
        // Create a new camera with the same properties
        const reflectionCamera = this.clone();
        
        // Calculate reflection matrix
        const reflectionMatrix = new THREE.Matrix4();
        const normal = new THREE.Vector3(0, 1, 0); // Up vector for water plane
        const position = new THREE.Vector3(0, 0, 0); // Water plane position
        reflectionMatrix.makeReflection(normal, position.y);
        
        // Apply reflection matrix to camera position and target
        const cameraPosition = this.position.clone();
        const target = new THREE.Vector3(0, 0, 0);
        this.getWorldDirection(target);
        target.multiplyScalar(1000).add(cameraPosition);
        
        cameraPosition.applyMatrix4(reflectionMatrix);
        target.applyMatrix4(reflectionMatrix);
        
        // Set reflected camera properties
        reflectionCamera.position.copy(cameraPosition);
        reflectionCamera.lookAt(target);
        
        // Invert the vertical axis to correct the reflection
        reflectionCamera.scale.y *= -1;
        
        return reflectionCamera;
    }

    createRefractionCamera() {
        // Create a new camera with the same properties
        const refractionCamera = this.clone();
        
        // For refraction, we'll use the same camera position but adjust the clipping planes
        refractionCamera.position.copy(this.position);
        refractionCamera.rotation.copy(this.rotation);
        
        // Adjust near and far planes for underwater view
        refractionCamera.near = 0.1;
        refractionCamera.far = 1000;
        
        // Add clipping plane for water surface
        const waterPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
        refractionCamera.updateMatrix();
        refractionCamera.updateMatrixWorld();
        
        return refractionCamera;
    }
} 