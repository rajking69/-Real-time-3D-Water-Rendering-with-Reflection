import * as THREE from 'three';

export class Renderer extends THREE.WebGLRenderer {
    constructor() {
        super({
            antialias: true,
            alpha: true
        });

        console.log('Initializing renderer...');
        
        // Get container element
        const container = document.getElementById('container');
        if (!container) {
            throw new Error('Container element not found!');
        }

        // Configure renderer
        this.setSize(window.innerWidth, window.innerHeight);
        this.setPixelRatio(window.devicePixelRatio);
        this.shadowMap.enabled = true;
        this.shadowMap.type = THREE.PCFSoftShadowMap;
        this.toneMapping = THREE.ACESFilmicToneMapping;
        this.toneMappingExposure = 0.5;
        
        // Append to container
        container.appendChild(this.domElement);
        
        console.log('Renderer initialized:', {
            size: { width: window.innerWidth, height: window.innerHeight },
            pixelRatio: window.devicePixelRatio,
            container: container
        });
    }

    onWindowResize() {
        this.setSize(window.innerWidth, window.innerHeight);
    }

    // Create render targets for reflection and refraction
    createRenderTargets() {
        const pixelRatio = window.devicePixelRatio;
        const width = window.innerWidth * pixelRatio;
        const height = window.innerHeight * pixelRatio;

        this.reflectionRenderTarget = new THREE.WebGLRenderTarget(
            width,
            height,
            {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat,
                encoding: THREE.sRGBEncoding
            }
        );

        this.refractionRenderTarget = new THREE.WebGLRenderTarget(
            width,
            height,
            {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat,
                encoding: THREE.sRGBEncoding
            }
        );
    }

    // Render the scene to the reflection render target
    renderReflection(scene, camera) {
        const currentRenderTarget = this.getRenderTarget();
        
        // Temporarily disable the water mesh visibility
        const waterMesh = scene.children.find(child => child.material && child.material.userData && child.material.userData.isWaterMaterial);
        if (waterMesh) waterMesh.visible = false;
        
        this.setRenderTarget(this.reflectionRenderTarget);
        this.render(scene, camera);
        
        // Restore water mesh visibility
        if (waterMesh) waterMesh.visible = true;
        
        this.setRenderTarget(currentRenderTarget);
    }

    // Render the scene to the refraction render target
    renderRefraction(scene, camera) {
        const currentRenderTarget = this.getRenderTarget();
        
        // Temporarily disable the water mesh visibility
        const waterMesh = scene.children.find(child => child.material && child.material.userData && child.material.userData.isWaterMaterial);
        if (waterMesh) waterMesh.visible = false;
        
        this.setRenderTarget(this.refractionRenderTarget);
        this.render(scene, camera);
        
        // Restore water mesh visibility
        if (waterMesh) waterMesh.visible = true;
        
        this.setRenderTarget(currentRenderTarget);
    }

    // Main render method
    render(scene, camera) {
        this.render(scene, camera);
    }

    // Get render targets for water material
    getRenderTargets() {
        return {
            reflection: this.reflectionRenderTarget.texture,
            refraction: this.refractionRenderTarget.texture
        };
    }

    // Get render target textures
    getRenderTargetTextures() {
        return {
            reflection: this.reflectionRenderTarget.texture,
            refraction: this.refractionRenderTarget.texture
        };
    }
} 