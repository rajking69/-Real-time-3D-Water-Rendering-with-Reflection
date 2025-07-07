# Real-time 3D Water Rendering

Advanced 3D water simulation with realistic reflections, refractions, and waves using Tessendorf's choppy waves method and ray-optics-based shading.

## Project Structure

```
├── src/
│   ├── core/               # Core rendering and simulation components
│   │   ├── renderer.js     # Main WebGL renderer setup
│   │   ├── scene.js       # Scene management
│   │   └── camera.js      # Camera controls and setup
│   ├── shaders/           # GLSL shader files
│   │   ├── water/         # Water-specific shaders
│   │   └── utils/         # Utility shader functions
│   ├── simulation/        # Wave simulation components
│   │   ├── tessendorf.js  # Tessendorf wave implementation
│   │   └── fft.js         # FFT calculations for wave generation
│   ├── materials/         # Material definitions
│   │   └── water.js       # Water material with custom shaders
│   ├── utils/            # Utility functions
│   │   └── math.js       # Math helper functions
│   └── main.js           # Application entry point
├── public/              # Static assets
│   └── textures/        # Texture files
├── index.html           # Main HTML file
└── package.json         # Project dependencies
```

## Features

- Real-time water surface simulation using Tessendorf's method
- Realistic reflections and refractions
- Dynamic wave patterns
- Ray-optics based shading model
- Interactive camera controls
- Customizable water parameters

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Technologies Used

- Three.js - 3D graphics library
- GLSL - Custom shaders
- FFTJS - Fast Fourier Transform calculations
- Cannon.js - Physics engine (optional)
- Vite - Build tool and development server

## Implementation Details

The water rendering system uses a combination of techniques:

1. **Wave Generation**
   - Tessendorf's choppy waves method
   - FFT-based displacement mapping
   - Dynamic normal map generation

2. **Optical Effects**
   - Fresnel reflection/refraction
   - Ray-optics based shading
   - Dynamic environment mapping

3. **Performance Optimization**
   - Efficient shader calculations
   - WebGL render targets for reflections/refractions
   - Level of Detail (LOD) system

## License

MIT 