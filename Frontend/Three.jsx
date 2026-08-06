/**
 * Three.jsx - Exhibition Entrypoint
 * 
 * Note: To conform with standard Vite/React project structure, the main 3D rendering
 * logic is located in the src/ folder. You can find the core canvas implementation in:
 * [SceneCanvas.jsx](file:///d:/PBL_Project/Beacon/Frontend/src/components/SceneCanvas.jsx)
 * 
 * This file is kept as a reference and redirects to the React components.
 */

import SceneCanvas from './src/components/SceneCanvas'
export default SceneCanvas
export { default as MuseumEnvironment } from './src/components/MuseumEnvironment'
export { default as ArtifactSculpture } from './src/components/ArtifactSculpture'
export { default as NeuralNetwork } from './src/components/NeuralNetwork'
export { default as DevControls } from './src/components/DevControls'
