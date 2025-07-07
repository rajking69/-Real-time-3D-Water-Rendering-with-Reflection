import * as THREE from 'three';

export class Scene extends THREE.Scene {
    constructor() {
        super();
        console.log('Initializing scene...');
        
        // Set background
        this.background = new THREE.Color(0x87ceeb); // Sky blue
        
        // Setup lighting first
        this.setupLighting();
        
        // Setup environment
        this.setupEnvironment();
    }

    setupLighting() {
        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.add(ambientLight);

        // Main sun light
        const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
        sunLight.position.set(50, 100, 50);
        sunLight.castShadow = true;
        
        // Adjust shadow properties
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 500;
        sunLight.shadow.camera.left = -100;
        sunLight.shadow.camera.right = 100;
        sunLight.shadow.camera.top = 100;
        sunLight.shadow.camera.bottom = -100;
        
        this.add(sunLight);

        // Add sun sphere for visualization
        const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const sunSphere = new THREE.Mesh(sunGeometry, sunMaterial);
        sunSphere.position.copy(sunLight.position);
        this.add(sunSphere);

        // Secondary fill light
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
        fillLight.position.set(-50, 40, -50);
        this.add(fillLight);
    }

    setupEnvironment() {
        console.log('Setting up environment...');
        
        // Create ground plane
        const groundGeometry = new THREE.PlaneGeometry(2000, 2000);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x225588,
            roughness: 0.6,
            metalness: 0.1
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -5; // Raised to be closer to water level
        ground.receiveShadow = true;
        this.add(ground);

        // Add test objects
        this.addTestObjects();

        console.log('Environment setup complete:', {
            lights: {
                ambient: this.children.find(child => child instanceof THREE.AmbientLight),
                directional: this.children.find(child => child instanceof THREE.DirectionalLight)
            },
            sun: this.children.find(child => child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial)
        });
    }

    addTestObjects() {
        // Add geometric shapes at different positions
        const geometries = [
            new THREE.BoxGeometry(20, 20, 20),
            new THREE.SphereGeometry(15, 32, 32),
            new THREE.TorusKnotGeometry(10, 3, 100, 16)
        ];

        const materials = [
            new THREE.MeshStandardMaterial({ 
                color: 0xff4444,
                roughness: 0.3,
                metalness: 0.7
            }),
            new THREE.MeshStandardMaterial({ 
                color: 0x44ff44,
                roughness: 0.3,
                metalness: 0.7
            }),
            new THREE.MeshStandardMaterial({ 
                color: 0x4444ff,
                roughness: 0.3,
                metalness: 0.7
            })
        ];

        const positions = [
            new THREE.Vector3(-50, 10, -50),
            new THREE.Vector3(0, 20, -60),
            new THREE.Vector3(50, 15, -50)
        ];

        for (let i = 0; i < geometries.length; i++) {
            const mesh = new THREE.Mesh(geometries[i], materials[i]);
            mesh.position.copy(positions[i]);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.add(mesh);
        }
    }

    getReflectableObjects() {
        return this.children.filter(child => 
            child instanceof THREE.Mesh && 
            !(child.geometry instanceof THREE.PlaneGeometry)
        );
    }
} 