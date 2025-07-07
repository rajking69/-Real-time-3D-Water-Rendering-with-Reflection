import * as THREE from 'three';

// Helper function to calculate Fresnel term
export function calculateFresnel(viewDirection, normal, ior1 = 1.0, ior2 = 1.333) {
    const cosTheta = Math.min(Math.max(viewDirection.dot(normal), -1.0), 1.0);
    const g = Math.sqrt(ior2 * ior2 / (ior1 * ior1) - 1.0 + cosTheta * cosTheta);
    const F = 0.5 * Math.pow((g - cosTheta) / (g + cosTheta), 2.0) * 
        (1.0 + Math.pow((cosTheta * g + cosTheta - 1.0) / (cosTheta * g - cosTheta + 1.0), 2.0));
    return F;
}

// Helper function to calculate wave dispersion
export function calculateDispersion(k, gravity = 9.81) {
    return Math.sqrt(gravity * k);
}

// Helper function to calculate Phillips spectrum
export function calculatePhillips(k, windDirection, windSpeed, A = 0.0081) {
    const L = windSpeed * windSpeed / gravity;
    const kLength = k.length();
    
    if (kLength < 0.000001) return 0;
    
    const kNorm = k.clone().normalize();
    const directionalFactor = kNorm.dot(windDirection);
    
    if (directionalFactor < 0) return 0;
    
    const phillips = A * 
        Math.exp(-1.0 / (kLength * L * kLength * L)) / 
        Math.pow(kLength, 4.0) *
        directionalFactor * directionalFactor;
    
    return phillips;
}

// Helper function to calculate wave vector
export function calculateWaveVector(i, j, N, L) {
    const kx = (2.0 * Math.PI * (i - N / 2)) / L;
    const kz = (2.0 * Math.PI * (j - N / 2)) / L;
    return new THREE.Vector2(kx, kz);
}

// Helper function to calculate complex exponential
export function complexExp(phase) {
    return {
        real: Math.cos(phase),
        imag: Math.sin(phase)
    };
}

// Helper function for complex multiplication
export function complexMultiply(a, b) {
    return {
        real: a.real * b.real - a.imag * b.imag,
        imag: a.real * b.imag + a.imag * b.real
    };
}

// Helper function to convert from world space to screen space
export function worldToScreen(position, camera, renderer) {
    const vector = position.clone();
    vector.project(camera);
    
    const widthHalf = renderer.domElement.width / 2;
    const heightHalf = renderer.domElement.height / 2;
    
    vector.x = (vector.x * widthHalf) + widthHalf;
    vector.y = -(vector.y * heightHalf) + heightHalf;
    
    return vector;
}

// Helper function to calculate reflection direction
export function calculateReflectionDirection(incident, normal) {
    return incident.clone().sub(
        normal.multiplyScalar(2 * incident.dot(normal))
    );
}

// Helper function to calculate refraction direction using Snell's law
export function calculateRefractionDirection(incident, normal, ior1, ior2) {
    const n = ior1 / ior2;
    const cosI = -normal.dot(incident);
    const sinT2 = n * n * (1.0 - cosI * cosI);
    
    if (sinT2 > 1.0) return null; // Total internal reflection
    
    const cosT = Math.sqrt(1.0 - sinT2);
    return incident.clone().multiplyScalar(n).add(
        normal.clone().multiplyScalar(n * cosI - cosT)
    );
} 