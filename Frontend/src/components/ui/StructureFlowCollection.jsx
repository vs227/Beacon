import React from 'react'
import { NebulaBackground, FluidFieldBackground } from '../../shaders/neuform-isolated/NeuformCraftEffects'
import '../../shaders/threeui.css'

export function StructureFlowCollection({
  variant = 'fluid-field',
  hue = 0,
  saturation = 1.0,
  brightness = 1.0,
  className = '',
  style = {},
}) {
  if (variant === 'fluid-field') {
    return (
      <div className="threeui-background fluid-field-container" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, overflow: 'hidden', ...style }}>
        <FluidFieldBackground
          hue={hue}
          saturation={saturation}
          brightness={brightness}
          className={`structure-flow-fluid ${className}`}
        />
      </div>
    )
  }

  if (variant === 'nebula') {
    return (
      <div className="threeui-background nebula-flow-container" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, overflow: 'hidden', ...style }}>
        <NebulaBackground
          hue={hue}
          saturation={saturation}
          brightness={brightness}
          className={`structure-flow-nebula ${className}`}
        />
      </div>
    )
  }
  return null
}

export default StructureFlowCollection
