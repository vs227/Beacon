/**
 * Colour and lighting values for the 3D museum scene, per theme.
 *
 * Kept out of the components so SceneCanvas and MuseumEnvironment share one
 * definition. These are passed down as props rather than read from React
 * context, because context does not reliably cross the R3F <Canvas> boundary.
 *
 * Scope note: this themes the scene *backdrop* — the large architectural
 * surfaces, the wall shader's base tone and the room lighting. Fixture metals
 * and the glowing spotlight lens stay as-is in both themes; they read as light
 * sources and hardware, not as background.
 */

export const SCENE_PALETTES = {
  dark: {
    // Canvas backdrop
    background: '#0E0F12',
    fogColor: '#0E0F12',
    fogNear: 16,
    fogFar: 34,
    exposure: 1.05,
    contactShadowOpacity: 0.35,
    // Colour the scroll transition fades through
    transitionOverlay: '#000000',

    // Large architectural surfaces
    floor: '#0e1220',
    ceiling: '#0F0E0C',
    trim: '#111010',
    pedestal: '#060810',
    soffitBase: '#141210',

    // FluidFieldWall shader
    wallBase: [0.009, 0.009, 0.016],
    wallGlow: 0.75,

    // Room lighting
    spotlightIntensity: 180,
    spotlightColor: '#F1F5F9',
    hemiSky: '#181A20',
    hemiGround: '#08090C',
    hemiIntensity: 0.06,
  },

  light: {
    background: '#EDE6DC',
    fogColor: '#EDE6DC',
    fogNear: 18,
    fogFar: 42,
    exposure: 0.98,
    contactShadowOpacity: 0.16,
    transitionOverlay: '#F6F2EB',

    floor: '#CBC4B8',
    ceiling: '#F0EAE1',
    trim: '#D6CFC4',
    pedestal: '#BDB6AA',
    soffitBase: '#E7E0D6',

    // Pale plaster wall; the animated glow is dialled well back so it reads as
    // a soft light wash rather than the dark theme's neon bloom.
    wallBase: [0.855, 0.833, 0.796],
    wallGlow: 0.18,

    // A single spotlight cannot carry a bright room, so the hemisphere fill
    // does most of the work here and the spot becomes an accent.
    spotlightIntensity: 110,
    spotlightColor: '#FFF6EA',
    hemiSky: '#FFFFFF',
    hemiGround: '#CFC8BC',
    hemiIntensity: 0.95,
  },
}

export function getScenePalette(theme) {
  return SCENE_PALETTES[theme] || SCENE_PALETTES.dark
}
