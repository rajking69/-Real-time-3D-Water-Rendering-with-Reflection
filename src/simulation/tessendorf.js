import * as THREE from 'three';
import { FFT } from 'fftjs';
import { WaterMaterial } from '../materials/water.js';

export class WaterSimulation {
    constructor() {
        this.params = {
            N: 128, // Reduced size for better performance
            L: 1000, // Physical width of water surface
            A: 1.0, // Increased wave amplitude
            w: 1.0, // Wind speed
            direction: new THREE.Vector2(1, 1).normalize(),
            choppiness: 1.5 // Increased choppiness
        };

        this.fft = new FFT(this.params.N);
        this.spectrum = new Array(this.params.N * this.params.N * 2);
        this.vertices = new Array(this.params.N * this.params.N * 3);
    }

    init() {
        // Create water geometry with higher resolution
        const geometry = new THREE.PlaneGeometry(
            this.params.L,
            this.params.L,
            this.params.N - 1,
            this.params.N - 1
        );

        // Create water material
        this.material = new WaterMaterial();

        // Create mesh
        this.mesh = new THREE.Mesh(geometry, this.material);
        this.mesh.rotation.x = -Math.PI / 2;
        this.mesh.position.y = 0; // Water at ground level
        this.mesh.receiveShadow = true;
        this.mesh.castShadow = true;

        // Initialize wave spectrum
        this.initializeWaveSpectrum();

        // Start animation
        this.animate();

        console.log('Water simulation initialized:', {
            params: this.params,
            geometry: geometry,
            material: this.material
        });
    }

    animate() {
        // Update material uniforms
        this.material.uniforms.time.value = performance.now() * 0.001;
        
        requestAnimationFrame(() => this.animate());
    }

    initializeWaveSpectrum() {
        const { N, L, A, w, direction } = this.params;
        
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                const index = i * N + j;
                
                // Wave vector
                const kx = (2 * Math.PI * (i - N / 2)) / L;
                const kz = (2 * Math.PI * (j - N / 2)) / L;
                const k = new THREE.Vector2(kx, kz);
                const kLength = k.length();

                if (kLength < 0.000001) continue;

                // Phillips spectrum
                const phillips = this.phillipsSpectrum(k, kLength);
                
                // Complex amplitude
                const r1 = Math.random();
                const r2 = Math.random();
                const h0 = Math.sqrt(phillips / 2) * 
                    new THREE.Vector2(r1, r2).normalize();

                this.spectrum[index * 2] = h0.x;
                this.spectrum[index * 2 + 1] = h0.y;
            }
        }
    }

    phillipsSpectrum(k, kLength) {
        const { A, w, direction } = this.params;
        
        // Largest possible wave from wind speed
        const L = w * w / 9.81;
        
        // Wave direction
        const kNorm = k.clone().normalize();
        const directionalFactor = kNorm.dot(direction);
        
        if (directionalFactor < 0) return 0;

        // Phillips spectrum
        const phillips = A * 
            Math.exp(-1 / (kLength * L * kLength * L)) / 
            (kLength * kLength * kLength * kLength) *
            directionalFactor * directionalFactor;

        return phillips;
    }

    update() {
        const time = performance.now() * 0.001;
        this.updateWaveSpectrum(time);
        this.updateGeometry();
    }

    updateWaveSpectrum(time) {
        const { N } = this.params;
        
        // Calculate wave height field using FFT
        const heightField = new Array(N * N * 2);
        
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                const index = i * N + j;
                const h0 = new THREE.Vector2(
                    this.spectrum[index * 2],
                    this.spectrum[index * 2 + 1]
                );

                // Wave vector
                const kx = (2 * Math.PI * (i - N / 2)) / this.params.L;
                const kz = (2 * Math.PI * (j - N / 2)) / this.params.L;
                const k = new THREE.Vector2(kx, kz);
                const kLength = k.length();

                if (kLength < 0.000001) continue;

                // Dispersion relation
                const w = Math.sqrt(9.81 * kLength);
                
                // Complex exponential
                const phase = w * time;
                const cos = Math.cos(phase);
                const sin = Math.sin(phase);

                heightField[index * 2] = (h0.x * cos - h0.y * sin);
                heightField[index * 2 + 1] = (h0.x * sin + h0.y * cos);
            }
        }

        // Perform inverse FFT
        const result = this.fft.inverse(heightField);
        
        // Update geometry with new heights
        const geometry = this.mesh.geometry;
        const vertices = geometry.attributes.position.array;
        
        for (let i = 0; i < result.length / 2; i++) {
            vertices[i * 3 + 1] = result[i * 2] * this.params.A;
        }
        
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
    }

    updateGeometry() {
        // Update material uniforms
        this.material.uniforms.time.value = performance.now() * 0.001;
    }

    setWaveHeight(height) {
        this.params.A = height;
    }

    setWaveSpeed(speed) {
        this.params.w = speed;
        this.initializeWaveSpectrum();
    }

    setChoppiness(choppiness) {
        this.params.choppiness = choppiness;
        this.material.uniforms.choppiness.value = choppiness;
    }

    updateReflection(renderer, scene, camera) {
        // Create reflection camera
        const reflectionCamera = camera.createReflectionCamera();
        
        // Render reflection
        renderer.renderReflection(scene, reflectionCamera);
        
        // Update material with reflection texture
        const renderTargets = renderer.getRenderTargets();
        this.material.uniforms.reflectionTexture.value = renderTargets.reflection;
    }

    updateRefraction(renderer, scene, camera) {
        // Create refraction camera
        const refractionCamera = camera.createRefractionCamera();
        
        // Render refraction
        renderer.renderRefraction(scene, refractionCamera);
        
        // Update material with refraction texture
        const renderTargets = renderer.getRenderTargets();
        this.material.uniforms.refractionTexture.value = renderTargets.refraction;
    }
} 