import * as THREE from 'three';

// Vertex shader
const waterVertexShader = `
uniform float time;
uniform float choppiness;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying vec4 vWorldPosition;

void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    
    // Add simple wave movement
    vec3 newPosition = position;
    float waveHeight = sin(position.x * 0.05 + time) * cos(position.z * 0.05 + time) * choppiness;
    newPosition.y += waveHeight;
    
    vec4 worldPosition = modelMatrix * vec4(newPosition, 1.0);
    vWorldPosition = worldPosition;
    
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;

// Fragment shader
const waterFragmentShader = `
uniform float time;
uniform float choppiness;
uniform sampler2D reflectionTexture;
uniform sampler2D refractionTexture;
uniform vec3 waterColor;
uniform float fresnelBias;
uniform float fresnelScale;
uniform float fresnelPower;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying vec4 vWorldPosition;

const float IOR_AIR = 1.0;
const float IOR_WATER = 1.333;

// Simple noise function
float noise(vec2 uv) {
    return fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    // Basic water color
    vec3 baseColor = waterColor;
    
    // Add wave pattern
    float pattern = sin(vUv.x * 20.0 + time) * cos(vUv.y * 20.0 + time) * 0.5 + 0.5;
    
    // Add noise for more detail
    float noiseValue = noise(vUv + time * 0.1) * 0.1;
    
    // Calculate view direction
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition.xyz);
    
    // Calculate fresnel term
    float fresnel = fresnelBias + fresnelScale * pow(1.0 - max(dot(viewDirection, vNormal), 0.0), fresnelPower);
    
    // Add specular highlight
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    vec3 halfDir = normalize(lightDir + viewDirection);
    float specular = pow(max(dot(halfDir, vNormal), 0.0), 32.0) * 1.0;
    
    // Combine everything
    vec3 finalColor = mix(baseColor, vec3(1.0), pattern * 0.2 + noiseValue);
    finalColor += vec3(specular);
    finalColor = mix(finalColor, vec3(1.0), fresnel * 0.5);
    
    gl_FragColor = vec4(finalColor, 0.9);
}
`;

export class WaterMaterial extends THREE.ShaderMaterial {
    constructor() {
        super({
            uniforms: {
                time: { value: 0 },
                choppiness: { value: 1.0 },
                reflectionTexture: { value: null },
                refractionTexture: { value: null },
                waterColor: { value: new THREE.Color(0x0066cc) }, // Brighter blue
                fresnelBias: { value: 0.1 },
                fresnelScale: { value: 0.8 },
                fresnelPower: { value: 2.0 }
            },
            vertexShader: waterVertexShader,
            fragmentShader: waterFragmentShader,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        });

        // Mark this as a water material for the renderer
        this.userData = {
            isWaterMaterial: true
        };
    }
} 