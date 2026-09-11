import React from "react";
import { PlasmaButton } from "./neuform-isolated/NeuformIsolatedEffects";
import "./threeui.css";

export type ShaderButtonsProps = {
  variant?: "plasma-button" | "aetherisLabs" | string;
  mode?: "dark" | "light";
  hue?: number;
  saturation?: number;
  brightness?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
};

export function ShaderButtons({
  variant = "plasma-button",
  mode = "dark",
  hue = 0,
  saturation = 1.0,
  brightness = 0.75,
  className = "",
  style = {},
  onClick,
}: ShaderButtonsProps) {
  if (variant === "plasma-button" || variant === "aetherisLabs") {
    return (
      <button
        type="button"
        className={`shader-frame ${className}`}
        onClick={(e) => {
          if (onClick) onClick(e);
        }}
        style={{
          width: "190px",
          height: "52px",
          position: "relative",
          overflow: "hidden",
          borderRadius: "12px",
          cursor: "pointer",
          border: "none",
          padding: 0,
          background: "transparent",
          display: "inline-block",
          outline: "none",
          pointerEvents: "auto",
          zIndex: 100,
          ...style,
        }}
      >
        <PlasmaButton
          mode={mode}
          hue={hue}
          saturation={saturation}
          brightness={brightness}
          style={{ width: "100%", height: "100%", pointerEvents: "none" }}
        />
      </button>
    );
  }

  return null;
}

export default ShaderButtons;
