import * as THREE from 'three';
import { Scene } from './core/scene.js';
import { Renderer } from './core/renderer.js';
import { Camera } from './core/camera.js';
import { WaterSimulation } from './simulation/tessendorf.js';

class WaterRenderer {
    constructor() {
        console.log('Initializing WaterRenderer...');
        
        // Create renderer first
        this.renderer = new Renderer();
        
        // Initialize components
        this.scene = new Scene();
        this.camera = new Camera();
        this.waterSimulation = new WaterSimulation();
        
        // Setup scene
        this.init();
        this.setupControls();
        
        // Start animation loop
        this.animate();
        
        console.log('WaterRenderer initialized:', {
            scene: this.scene,
            camera: this.camera,
            renderer: this.renderer,
            waterSimulation: this.waterSimulation
        });
    }

    init() {
        try {
            // Setup environment first
            console.log('Setting up environment...');
            this.scene.setupEnvironment();

            // Initialize water simulation
            console.log('Initializing water simulation...');
            this.waterSimulation.init();
            
            // Position water plane
            this.waterSimulation.mesh.position.y = 0;
            this.scene.add(this.waterSimulation.mesh);

            // Handle window resize
            window.addEventListener('resize', () => {
                this.renderer.onWindowResize();
                this.camera.onWindowResize();
            });

            // Debug output
            console.log('Scene objects:', this.scene.children);
            
        } catch (error) {
            console.error('Error during initialization:', error);
        }
    }

    setupControls() {
        try {
            // Wave height control
            const waveHeightSlider = document.getElementById('waveHeight');
            waveHeightSlider?.addEventListener('input', (e) => {
                this.waterSimulation.setWaveHeight(parseFloat(e.target.value));
            });

            // Wave speed control
            const waveSpeedSlider = document.getElementById('waveSpeed');
            waveSpeedSlider?.addEventListener('input', (e) => {
                this.waterSimulation.setWaveSpeed(parseFloat(e.target.value));
            });

            // Choppiness control
            const choppinessSlider = document.getElementById('choppiness');
            choppinessSlider?.addEventListener('input', (e) => {
                this.waterSimulation.setChoppiness(parseFloat(e.target.value));
            });
            
            console.log('Controls setup complete');
        } catch (error) {
            console.error('Error setting up controls:', error);
        }
    }

    animate() {
        try {
            requestAnimationFrame(() => this.animate());

            // Update camera controls
            this.camera.update();

            // Update water simulation
            if (this.waterSimulation.material) {
                this.waterSimulation.material.uniforms.time.value = performance.now() * 0.001;
            }

            // Render scene
            this.renderer.render(this.scene, this.camera);
            
        } catch (error) {
            console.error('Error in animation loop:', error);
        }
    }
}

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('Starting application...');
        window.app = new WaterRenderer();
    } catch (error) {
        console.error('Failed to start application:', error);
    }
}); 