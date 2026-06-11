import React from "react";
import { FittingType } from "../types";

interface GarmentSvgProps {
  type: "top" | "bottom";
  svgType:
    | "tee"
    | "blazer"
    | "hoodie"
    | "blouse"
    | "kurta"
    | "tuxedo_shirt"
    | "chinos"
    | "jeans"
    | "satin_skirt"
    | "ethnic_pajama"
    | "pleated_pants";
  colorHex: string;
  fitting: FittingType;
  modelId?: string; // Links dynamic contouring to the model
  maskId?: string; // Optional dynamic silhouette mask ID received from parent
  className?: string;
  style?: React.CSSProperties;
}

// Exact vector mapping shapes used to build automated dynamic clipping boundaries
const GARMENT_PATHS: Record<string, string[]> = {
  tee: [
    "M32 15 C42 18, 58 18, 68 15 L85 25 L92 38 L78 43 L76 102 C70 104, 30 104, 24 102 L22 43 L8 38 L15 25 Z"
  ],
  blazer: [
    "M30 12 L70 12 L86 28 L90 45 L78 50 L78 106 L22 106 L22 50 L10 45 L14 28 Z"
  ],
  hoodie: [
    "M26 15 C36 12, 64 12, 74 15 L91 26 L94 48 L78 52 L78 105 L22 105 L22 52 L6 48 L9 26 Z"
  ],
  blouse: [
    "M34 16 Q50 20, 66 16 L84 27 L93 50 L81 54 Q77 75, 75 103 C60 106, 40 106, 25 103 Q23 75, 19 54 L7 50 L16 27 Z"
  ],
  kurta: [
    "M35 15 C45 16, 55 16, 65 15 L86 26 L89 45 L76 48 L76 109 L24 109 L24 48 L14 45 L15 26 Z"
  ],
  tuxedo_shirt: [
    "M34 14 C42 16, 58 16, 66 14 L84 25 L88 44 L76 48 L76 104 L24 104 L24 48 L12 44 L16 25 Z"
  ],
  chinos: [
    "M26 10 L74 10 L74 20 L26 20 Z",
    "M26 20 L74 20 L78 120 L52 120 L50 50 L48 120 L22 120 Z"
  ],
  jeans: [
    "M24 10 L76 10 L76 21 L24 21 Z",
    "M24 21 L76 21 L80 122 L54 122 L50 56 L46 122 L20 122 Z"
  ],
  satin_skirt: [
    "M32 10 L68 10 L68 18 L32 18 Z",
    "M32 18 L68 18 C78 70, 94 105, 96 122 C78 126, 22 126, 4 122 C6 105, 22 70, 32 18 Z"
  ],
  ethnic_pajama: [
    "M26 12 L74 12 Q76 30, 78 50 L84 120 L66 120 Q60 70, 50 62 Q40 70, 34 120 L16 120 Q24 30, 26 12 Z"
  ],
  pleated_pants: [
    "M28 8 L72 8 L72 19 L28 19 Z",
    "M28 19 L72 19 L76 121 L51 121 L50 51 L49 121 L24 121 Z"
  ],
};

// Model silhouette boundaries for realistic fitting and masking
const MODEL_SILHOUETTES: Record<string, { top: string; bottom: string }> = {
  "model-sophia": {
    top: 
      "M31 10 C42 12, 58 12, 69 10 " + 
      "C78 12, 85 18, 93 28 " +       
      "L97 45 L83 50 " +               
      "C79 65, 77 82, 82 110 " +       
      "L18 110 " +                     
      "C23 82, 21 65, 17 50 " +        
      "L3 45 L7 28 " +                 
      "C15 18, 22 12, 31 10 Z",        
    bottom:
      "M25 5 L75 5 " +                 
      "C79 18, 83 40, 81 60 " +        
      "L80 130 L52 130 " +             
      "L50 51 " +                      
      "L48 130 L20 130 " +             
      "C17 40, 21 18, 25 5 Z"          
  },
  "model-marcus": {
    top:
      "M32 12 C42 13, 58 13, 68 12 " + 
      "C80 13, 89 16, 97 22 " +       
      "L99 44 L81 48 " +               
      "C79 66, 78 86, 80 110 " +       
      "L20 110 " +                     
      "C22 86, 21 66, 19 48 " +        
      "L1 44 L3 22 " +                 
      "C11 16, 20 13, 32 12 Z",        
    bottom:
      "M23 6 L77 6 " +                 
      "C82 18, 85 42, 83 62 " +        
      "L82 130 L53 130 " +             
      "L50 53 " +                      
      "L47 130 L18 130 " +             
      "C15 42, 18 18, 23 6 Z"          
  },
  "model-aria": {
    top:
      "M31 12 C41 15, 59 15, 69 12 " + 
      "C77 14, 84 19, 91 26 " +       
      "L94 48 L80 50 " +               
      "C77 68, 77 86, 79 110 " +       
      "L21 110 " +                     
      "C23 86, 23 68, 20 50 " +        
      "L6 48 L9 26 " +                 
      "C16 19, 23 14, 31 12 Z",        
    bottom:
      "M26 8 L74 8 " +                 
      "C78 20, 81 44, 79 64 " +        
      "L79 130 L51 130 " +             
      "L50 50 " +                      
      "L49 130 L21 130 " +             
      "C19 44, 22 20, 26 8 Z"          
  },
  "model-rohan": {
    top:
      "M32 11 C42 11, 58 11, 68 11 " + 
      "C78 12, 86 15, 93 20 " +       
      "L96 42 L80 44 " +               
      "C77 64, 76 84, 78 110 " +       
      "L22 110 " +                     
      "C24 84, 23 64, 20 44 " +        
      "L4 42 L7 20 " +                 
      "C14 15, 22 12, 32 11 Z",        
    bottom:
      "M25 6 L75 6 " +                 
      "C80 18, 82 40, 80 60 " +        
      "L79 130 L52 130 " +             
      "L50 49 " +                      
      "L48 130 L21 130 " +             
      "C18 40, 20 18, 25 6 Z"          
  }
};

export const GarmentSvg: React.FC<GarmentSvgProps> = ({
  type,
  svgType,
  colorHex,
  fitting,
  modelId,
  maskId,
  className = "",
  style = {},
}) => {
  // Determine width multiplier based on fitting choice
  let widthFactor = 1.0;
  if (fitting === "slim") widthFactor = 0.88;
  if (fitting === "loose") widthFactor = 1.15;

  // Posture-matching dimensional deformation matrices
  let transformStr = `scaleX(${widthFactor})`;
  if (modelId) {
    if (modelId === "model-sophia") {
      // Sophia stands with offset tilted hips. Custom skew and rotation to mold the outline perfectly.
      transformStr += " skewX(-2deg) rotate(-0.5deg) scaleY(1.02)";
    } else if (modelId === "model-marcus") {
      // Marcus stands with highly squared muscular shoulders.
      transformStr += " scaleX(1.03) translateY(-1px)";
    } else if (modelId === "model-aria") {
      // Aria has a relaxed urban lean posture.
      transformStr += " skewX(1deg) rotate(0.4deg)";
    } else if (modelId === "model-rohan") {
      // Rohan stands in high corporate upright style.
      transformStr += " scaleY(1.02) scaleX(0.99) translateY(-2px)";
    }
  }

  const strokeColor = "#111827"; // deep charcoal borders
  const shadowColor = "rgba(0,0,0,0.15)";
  const highlightedColor = "rgba(255,255,255,0.15)";

  const activeClipPathId = `clip-${svgType}-${type}`;

  const isPresetModel = !!modelId && modelId !== "custom";
  const modelKey = modelId && MODEL_SILHOUETTES[modelId] ? modelId : "model-sophia";
  const modelSilhouetteData = MODEL_SILHOUETTES[modelKey];
  const activeSilhouettePath = type === "top" ? modelSilhouetteData.top : modelSilhouetteData.bottom;
  const modelMaskId = `silhouette-mask-${type}-${svgType}-${modelKey}`;

  // Dynamically resolve the active silhouette mask ID
  const activeMaskId = maskId || (isPresetModel ? modelMaskId : undefined);

  // CSS mask-image and browser-prefixed parameters for pristine silhouette bounds clipping
  const maskStyles: React.CSSProperties = activeMaskId
    ? {
        maskImage: `url(#${activeMaskId})`,
        WebkitMaskImage: `url(#${activeMaskId})`,
        mask: `url(#${activeMaskId})`,
        WebkitMask: `url(#${activeMaskId})`,
      }
    : {};

  const renderContourOverlay = () => {
    const activeModelId = modelId || "model-sophia";

    if (type === "top") {
      return (
        <g clipPath={`url(#${activeClipPathId})`}>
          {/* Universal 3D Cylindrical body-roundness shading */}
          <rect
            x="5"
            y="0"
            width="90"
            height="110"
            fill="url(#body-3d-cylindrical)"
            style={{ mixBlendMode: "multiply" }}
            className="opacity-40 pointer-events-none"
          />

          {/* Model-specific anatomy and posture contours */}
          {activeModelId === "model-sophia" && (
            <>
              {/* Sophia breast chest volume projections */}
              <circle cx="38" cy="35" r="22" fill="url(#bust-sophia-left)" style={{ mixBlendMode: "multiply" }} className="opacity-40" />
              <circle cx="62" cy="35" r="22" fill="url(#bust-sophia-right)" style={{ mixBlendMode: "multiply" }} className="opacity-40" />
              
              {/* Center chest split shadow */}
              <line x1="50" y1="20" x2="50" y2="70" stroke="rgba(0,0,0,0.20)" strokeWidth="1.5" style={{ mixBlendMode: "multiply" }} />

              {/* Waist hips asymmetry drapes */}
              <path d="M15 15 C26 35, 23 75, 27 105 L15 105 Z" fill="url(#sophia-waist-shadow)" style={{ mixBlendMode: "multiply" }} className="opacity-30" />
              <path d="M85 15 C74 35, 77 75, 73 105 L85 105 Z" fill="url(#sophia-waist-shadow)" style={{ mixBlendMode: "multiply" }} className="opacity-20" />
            </>
          )}

          {activeModelId === "model-marcus" && (
            <>
              {/* Broad pectorals musculature mapping */}
              <rect x="18" y="24" width="30" height="18" fill="url(#marcus-chest-bevel)" style={{ mixBlendMode: "overlay" }} className="opacity-30" />
              <rect x="52" y="24" width="30" height="18" fill="url(#marcus-chest-bevel)" style={{ mixBlendMode: "overlay" }} className="opacity-30" />

              <line x1="50" y1="20" x2="50" y2="95" stroke="rgba(0,0,0,0.25)" strokeWidth="2" style={{ mixBlendMode: "multiply" }} />
              
              {/* Lateral abdominal shadows */}
              <path d="M25 58 Q50 63, 75 58" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" fill="none" style={{ mixBlendMode: "multiply" }} />
              <path d="M25 72 Q50 77, 75 72" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" fill="none" style={{ mixBlendMode: "multiply" }} />
            </>
          )}

          {activeModelId === "model-aria" && (
            <>
              {/* Aria chest roundness projections */}
              <circle cx="37" cy="36" r="20" fill="url(#bust-aria-left)" style={{ mixBlendMode: "multiply" }} className="opacity-35" />
              <circle cx="63" cy="36" r="20" fill="url(#bust-aria-right)" style={{ mixBlendMode: "multiply" }} className="opacity-35" />

              {/* Natural organic drapery wrinkles */}
              <path d="M 20 48 Q 50 55, 80 48" stroke="rgba(0,0,0,0.12)" strokeWidth="2" fill="none" style={{ mixBlendMode: "multiply" }} />
              <path d="M 22 72 Q 50 79, 78 72" stroke="rgba(0,0,0,0.15)" strokeWidth="2" fill="none" style={{ mixBlendMode: "multiply" }} />
            </>
          )}

          {activeModelId === "model-rohan" && (
            <>
              {/* Rohan slender posture chest support */}
              <rect x="22" y="26" width="26" height="15" fill="url(#rohan-pec-shading)" style={{ mixBlendMode: "multiply" }} className="opacity-20" />
              <rect x="52" y="26" width="26" height="15" fill="url(#rohan-pec-shading)" style={{ mixBlendMode: "multiply" }} className="opacity-20" />

              <line x1="50" y1="22" x2="50" y2="85" stroke="rgba(0,0,0,0.20)" strokeWidth="1.5" style={{ mixBlendMode: "multiply" }} />
            </>
          )}
        </g>
      );
    } else {
      // Bottoms
      return (
        <g clipPath={`url(#${activeClipPathId})`}>
          {/* Default leg-cylinder lighting overlay */}
          <rect x="15" y="10" width="34" height="115" fill="url(#leg-3d-highlight-left)" style={{ mixBlendMode: "soft-light" }} className="opacity-55" />
          <rect x="51" y="10" width="34" height="115" fill="url(#leg-3d-highlight-right)" style={{ mixBlendMode: "soft-light" }} className="opacity-55" />

          {/* Crotch curve shadows */}
          <path d="M 45 20 L 50 52 L 55 20 Z" fill="rgba(0,0,0,0.18)" style={{ mixBlendMode: "multiply" }} />

          {/* Satin skirt shimmer override */}
          {svgType === "satin_skirt" && (
            <rect x="4" y="10" width="92" height="115" fill="url(#satin-shimmer)" style={{ mixBlendMode: "overlay" }} className="opacity-35" />
          )}

          {/* Model-specific leg contour contours */}
          {activeModelId === "model-sophia" && (
            <>
              <path d="M 22 25 Q 36 60, 32 110" stroke="rgba(255,255,255,0.10)" strokeWidth="3" fill="none" style={{ mixBlendMode: "screen" }} />
              <path d="M 78 25 Q 64 60, 68 110" stroke="rgba(255,255,255,0.08)" strokeWidth="3" fill="none" style={{ mixBlendMode: "screen" }} />
              
              {/* Soft lateral hips drapes */}
              <path d="M 4 20 C 18 50, 16 90, 8 120" stroke="rgba(0,0,0,0.15)" strokeWidth="3" fill="none" style={{ mixBlendMode: "multiply" }} />
              <path d="M 96 20 C 82 50, 84 90, 92 120" stroke="rgba(0,0,0,0.10)" strokeWidth="3" fill="none" style={{ mixBlendMode: "multiply" }} />
            </>
          )}

          {activeModelId === "model-marcus" && (
            <>
              {/* Broad athletic crease enhancements */}
              <ellipse cx="34" cy="48" rx="8" ry="18" fill="rgba(0,0,0,0.05)" style={{ mixBlendMode: "multiply" }} />
              <ellipse cx="66" cy="48" rx="8" ry="18" fill="rgba(0,0,0,0.05)" style={{ mixBlendMode: "multiply" }} />
            </>
          )}

          {activeModelId === "model-aria" && (
            <>
              {/* Casual soft knee creases */}
              <path d="M 18 65 Q 30 68, 42 65" stroke="rgba(0,0,0,0.10)" strokeWidth="1.2" fill="none" style={{ mixBlendMode: "multiply" }} />
              <path d="M 58 65 Q 70 68, 82 65" stroke="rgba(0,0,0,0.10)" strokeWidth="1.2" fill="none" style={{ mixBlendMode: "multiply" }} />
            </>
          )}

          {activeModelId === "model-rohan" && (
            <>
              {/* High precision crease alignment */}
              <path d="M 35 20 L 35 120" stroke="rgba(0,0,0,0.12)" strokeWidth="1" style={{ mixBlendMode: "multiply" }} />
              <path d="M 65 20 L 65 120" stroke="rgba(0,0,0,0.12)" strokeWidth="1" style={{ mixBlendMode: "multiply" }} />
            </>
          )}
        </g>
      );
    }
  };

  return (
    <div
      className={`relative select-none pointer-events-none transition-all duration-300 ${className}`}
      style={{
        transform: transformStr,
        transformOrigin: "center center",
        ...maskStyles,
        ...style,
      }}
    >
      <svg
        viewBox={type === "top" ? "0 0 100 110" : "0 0 100 130"}
        className="w-full h-full drop-shadow-lg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Dynamic automatic clipping region bound to the active garment */}
          <clipPath id={activeClipPathId}>
            {(GARMENT_PATHS[svgType] || []).map((pathD, idx) => (
              <path key={idx} d={pathD} />
            ))}
          </clipPath>

          {/* Model edge-shading gradient to dynamically blend edges with 3D wrap effects */}
          <linearGradient id="silhouette-mask-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#444444" />
            <stop offset="3%" stopColor="#888888" />
            <stop offset="9%" stopColor="#ffffff" />
            <stop offset="91%" stopColor="#ffffff" />
            <stop offset="97%" stopColor="#888888" />
            <stop offset="100%" stopColor="#444444" />
          </linearGradient>

          {isPresetModel && (
            <mask id={modelMaskId}>
              {/* White silhouette matches shape of the selected model exactly */}
              <path d={activeSilhouettePath} fill="#ffffff" />
              {/* Multiply shading to softly draw in fabric wrapping at horizons */}
              <path d={activeSilhouettePath} fill="url(#silhouette-mask-gradient)" style={{ mixBlendMode: 'multiply' }} />
            </mask>
          )}

          {/* Subtle cylindrical 3D highlight running vertically down the body */}
          <linearGradient id="body-3d-cylindrical" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.25" />
            <stop offset="25%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.20" />
            <stop offset="75%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.30" />
          </linearGradient>

          {/* S-Curve waist contour shadow for Sophia */}
          <linearGradient id="sophia-waist-shadow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.32" />
            <stop offset="15%" stopColor="#000000" stopOpacity="0.08" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.10" />
            <stop offset="85%" stopColor="#000000" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.22" />
          </linearGradient>

          {/* Broad, athletic chest/shoulder shading for Marcus */}
          <linearGradient id="marcus-chest-bevel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="35%" stopColor="#ffffff" stopOpacity="0.0" />
            <stop offset="65%" stopColor="#000000" stopOpacity="0.0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.18" />
          </linearGradient>

          {/* High specular lighting highlight for metallic/satin finishes */}
          <linearGradient id="satin-shimmer" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.30" />
            <stop offset="30%" stopColor="#ffffff" stopOpacity="0.05" />
            <stop offset="50%" stopColor="#000000" stopOpacity="0.12" />
            <stop offset="70%" stopColor="#ffffff" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
          </linearGradient>

          {/* Dual breast curves shading for Sophia */}
          <radialGradient id="bust-sophia-left" cx="38%" cy="32%" r="22%" fx="38%" fy="32%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.22" />
          </radialGradient>
          <radialGradient id="bust-sophia-right" cx="62%" cy="32%" r="22%" fx="62%" fy="32%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.22" />
          </radialGradient>

          {/* Dual breast curves shading for Aria */}
          <radialGradient id="bust-aria-left" cx="37%" cy="34%" r="20%" fx="37%" fy="34%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0.0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.18" />
          </radialGradient>
          <radialGradient id="bust-aria-right" cx="63%" cy="34%" r="20%" fx="63%" fy="34%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0.0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.18" />
          </radialGradient>

          {/* Athletic Pec shading block for Rohan */}
          <linearGradient id="rohan-pec-shading" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="40%" stopColor="#000000" stopOpacity="0.0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.15" />
          </linearGradient>

          {/* 3D Leg cylinder highlights */}
          <linearGradient id="leg-3d-highlight-left" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.20" />
            <stop offset="40%" stopColor="#ffffff" stopOpacity="0.15" />
            <stop offset="70%" stopColor="#ffffff" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.12" />
          </linearGradient>
          <linearGradient id="leg-3d-highlight-right" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.12" />
            <stop offset="30%" stopColor="#ffffff" stopOpacity="0.04" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.20" />
          </linearGradient>
        </defs>

        {/* Master model silhouette rendering group */}
        <g mask={isPresetModel ? `url(#${modelMaskId})` : undefined}>

        {/* --- TOPS --- */}
        {svgType === "tee" && (
          <g>
            {/* Sleeves background shadow */}
            <path d="M15 25 L8 38 L22 45 L25 35 Z" fill={shadowColor} />
            <path d="M85 25 L92 38 L78 45 L75 35 Z" fill={shadowColor} />
            {/* Direct T-Shirt body path */}
            <path
              d="M32 15 C42 18, 58 18, 68 15 L85 25 L92 38 L78 43 L76 102 C70 104, 30 104, 24 102 L22 43 L8 38 L15 25 Z"
              fill={colorHex}
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Crew collar decoration */}
            <path
              d="M32 15 C40 24, 60 24, 68 15"
              stroke={strokeColor}
              strokeWidth="2"
              fill="none"
            />
            {/* Seams & fold details */}
            <path d="M26 43 L74 43" stroke={strokeColor} strokeWidth="1" strokeDasharray="2 2" />
            <path d="M24 100 L76 100" stroke={strokeColor} strokeWidth="1" strokeDasharray="3 3" />
            <path d="M35 50 Q50 55, 65 50" stroke={highlightedColor} strokeWidth="2" />
            <path d="M38 75 Q50 80, 62 75" stroke={shadowColor} strokeWidth="1.5" />
          </g>
        )}

        {svgType === "blazer" && (
          <g>
            {/* Structured blazer backing */}
            <path
              d="M30 12 L70 12 L86 28 L90 45 L78 50 L78 106 L22 106 L22 50 L10 45 L14 28 Z"
              fill={colorHex}
              stroke={strokeColor}
              strokeWidth="2"
            />
            {/* Under-shirt / lapel cutout triangular window */}
            <path d="M40 12 L50 48 L60 12 Z" fill="#ffffff" stroke={strokeColor} strokeWidth="1.5" />
            <path d="M45 32 L50 36 L55 32" stroke="#ea580c" strokeWidth="1.5" /> {/* Tie / accent */}

            {/* Structured lapels */}
            <path
              d="M30 12 L43 38 L50 48 L32 25 Z"
              fill={colorHex}
              stroke={strokeColor}
              strokeWidth="1.5"
            />
            <path
              d="M70 12 L57 38 L50 48 L68 25 Z"
              fill={colorHex}
              stroke={strokeColor}
              strokeWidth="1.5"
            />

            {/* Blazer center split */}
            <path d="M50 48 L50 106" stroke={strokeColor} strokeWidth="2" />

            {/* Pockets */}
            <rect x="25" y="70" width="16" height="10" rx="1.5" fill={colorHex} stroke={strokeColor} strokeWidth="1.5" />
            <rect x="59" y="70" width="16" height="10" rx="1.5" fill={colorHex} stroke={strokeColor} strokeWidth="1.5" />
            <rect x="28" y="55" width="12" height="4" rx="1" fill={colorHex} stroke={strokeColor} strokeWidth="1" />

            {/* Buttons */}
            <circle cx="47" cy="58" r="2" fill="#d97706" stroke={strokeColor} strokeWidth="0.5" />
            <circle cx="47" cy="68" r="2" fill="#d97706" stroke={strokeColor} strokeWidth="0.5" />

            {/* Creams and specular highlights */}
            <path d="M18 32 L24 45" stroke={highlightedColor} strokeWidth="2.5" />
            <path d="M82 32 L76 45" stroke={highlightedColor} strokeWidth="2.5" />
          </g>
        )}

        {svgType === "hoodie" && (
          <g>
            {/* Massive pouch body */}
            <path
              d="M26 15 C36 12, 64 12, 74 15 L91 26 L94 48 L78 52 L78 105 L22 105 L22 52 L6 48 L9 26 Z"
              fill={colorHex}
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Bulky hood */}
            <path
              d="M32 15 C30 2, 70 2, 68 15 C58 19, 42 19, 32 15"
              fill={colorHex}
              stroke={strokeColor}
              strokeWidth="1.8"
            />
            {/* Hood opening */}
            <path
              d="M40 16 C38 6, 62 6, 60 16 C53 19, 47 19, 40 16"
              fill="#1e293b"
              stroke={strokeColor}
              strokeWidth="1"
            />
            {/* Suspended Drawstrings */}
            <path d="M46 17 L44 32" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M54 17 L56 34" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />

            {/* Kangaroo Pocket */}
            <path
              d="M34 72 L66 72 L70 94 L30 94 Z"
              fill={colorHex}
              stroke={strokeColor}
              strokeWidth="1.5"
            />
            <path d="M34 72 L30 94" stroke={strokeColor} strokeWidth="1" />
            <path d="M66 72 L70 94" stroke={strokeColor} strokeWidth="1" />

            {/* Slouchy Folds */}
            <path d="M24 55 Q35 59, 42 56" stroke={shadowColor} strokeWidth="1.5" fill="none" />
            <path d="M76 55 Q65 59, 58 56" stroke={shadowColor} strokeWidth="1.5" fill="none" />
            <path d="M26 101 L74 101" stroke={strokeColor} strokeWidth="2.5" />
          </g>
        )}

        {svgType === "blouse" && (
          <g>
            {/* Fluid flowing blouse shape */}
            <path
              d="M34 16 Q50 20, 66 16 L84 27 L93 50 L81 54 Q77 75, 75 103 C60 106, 40 106, 25 103 Q23 75, 19 54 L7 50 L16 27 Z"
              fill={colorHex}
              stroke={strokeColor}
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            {/* Graceful draped neckline */}
            <path
              d="M34 16 Q50 30, 66 16"
              stroke={strokeColor}
              strokeWidth="1.8"
              fill="none"
            />
            <path
              d="M36 21 Q50 34, 64 21"
              stroke={highlightedColor}
              strokeWidth="1"
              fill="none"
            />
            {/* Pleated soft vertical draperies */}
            <path d="M35 34 Q50 36, 65 34" stroke={shadowColor} strokeWidth="1" fill="none" />
            <path d="M42 45 C43 65, 45 85, 42 103" stroke={shadowColor} strokeWidth="1" fill="none" />
            <path d="M50 42 C51 68, 49 85, 50 104" stroke={highlightedColor} strokeWidth="1.5" fill="none" />
            <path d="M58 45 C57 65, 55 85, 58 103" stroke={shadowColor} strokeWidth="1" fill="none" />
            {/* Bell-shaped elastic wrist hems */}
            <path d="M12 40 L16 46" stroke={strokeColor} strokeWidth="1.2" />
            <path d="M88 40 L84 46" stroke={strokeColor} strokeWidth="1.2" />
          </g>
        )}

        {svgType === "kurta" && (
          <g>
            {/* Elegant long kurta body extending lower */}
            <path
              d="M35 15 C45 16, 55 16, 65 15 L86 26 L89 45 L76 48 L76 109 L24 109 L24 48 L14 45 L15 26 Z"
              fill={colorHex}
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Mandarin high-neck placket line */}
            <path d="M44 15 L44 9 L56 9 L56 15" fill={colorHex} stroke={strokeColor} strokeWidth="1.5" />
            <path d="M50 9 L50 38" stroke={strokeColor} strokeWidth="1.8" />
            {/* Traditional tiny button seeds */}
            <circle cx="50" cy="18" r="1.5" fill="#e2e8f0" stroke={strokeColor} strokeWidth="0.5" />
            <circle cx="50" cy="24" r="1.5" fill="#e2e8f0" stroke={strokeColor} strokeWidth="0.5" />
            <circle cx="50" cy="30" r="1.5" fill="#e2e8f0" stroke={strokeColor} strokeWidth="0.5" />

            {/* Side-slits cutaways */}
            <path d="M24 88 L24 109" stroke={strokeColor} strokeWidth="1.5" />
            <path d="M76 88 L76 109" stroke={strokeColor} strokeWidth="1.5" />

            {/* Classic ethnic design accent on sleeves */}
            <path d="M17 38 L23 41" stroke={shadowColor} strokeWidth="1" />
            <path d="M83 38 L77 41" stroke={shadowColor} strokeWidth="1" />
          </g>
        )}

        {svgType === "tuxedo_shirt" && (
          <g>
            {/* Spot white tuxedo core */}
            <path
              d="M34 14 C42 16, 58 16, 66 14 L84 25 L88 44 L76 48 L76 104 L24 104 L24 48 L12 44 L16 25 Z"
              fill={colorHex}
              stroke={strokeColor}
              strokeWidth="2"
            />
            {/* Pleated tuxedo front bib */}
            <path d="M41 15 L41 68 L59 68 L59 15 Z" fill="#f1f5f9" stroke={strokeColor} strokeWidth="1.5" />
            <path d="M45 15 L45 68" stroke={strokeColor} strokeWidth="0.8" strokeDasharray="1 1" />
            <path d="M55 15 L55 68" stroke={strokeColor} strokeWidth="0.8" strokeDasharray="1 1" />
            <path d="M50 15 L50 68" stroke={strokeColor} strokeWidth="1.2" />

            {/* Elegant Black Bowtie */}
            <path d="M44 14 L56 22 L44 22 L56 14 Z" fill="#0f172a" stroke={strokeColor} strokeWidth="1" />
            <circle cx="50" cy="18" r="3" fill="#0f172a" />

            {/* Shirt gold studs */}
            <circle cx="50" cy="29" r="1.5" fill="#eab308" />
            <circle cx="50" cy="40" r="1.5" fill="#eab308" />
            <circle cx="50" cy="52" r="1.5" fill="#eab308" />

            {/* Wingtips collars */}
            <path d="M34 14 L44 22 L50 18 Z" fill="#ffffff" stroke={strokeColor} strokeWidth="1.2" />
            <path d="M66 14 L56 22 L50 18 Z" fill="#ffffff" stroke={strokeColor} strokeWidth="1.2" />
          </g>
        )}

        {/* --- BOTTOMS --- */}
        {svgType === "chinos" && (
          <g>
            {/* Beltline waistband */}
            <path
              d="M26 10 L74 10 L74 20 L26 20 Z"
              fill={colorHex}
              stroke={strokeColor}
              strokeWidth="2"
            />
            {/* Loop lines */}
            <rect x="32" y="10" width="3" height="10" fill={strokeColor} />
            <rect x="50" y="10" width="3" height="10" fill={strokeColor} />
            <rect x="65" y="10" width="3" height="10" fill={strokeColor} />

            {/* Legs and crotch seam */}
            <path
              d="M26 20 L74 20 L78 120 L52 120 L50 50 L48 120 L22 120 Z"
              fill={colorHex}
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Pockets slit lines */}
            <path d="M28 25 L34 38" stroke={strokeColor} strokeWidth="1.5" />
            <path d="M72 25 L66 38" stroke={strokeColor} strokeWidth="1.5" />

            {/* Horizontal crease stitches */}
            <path d="M36 120 L36 30" stroke={shadowColor} strokeWidth="1.5" strokeDasharray="3 3" />
            <path d="M64 120 L64 30" stroke={shadowColor} strokeWidth="1.5" strokeDasharray="3 3" />

            {/* Fly zipper seam */}
            <path d="M50 20 L50 48 C49 48, 44 46, 44 42" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          </g>
        )}

        {svgType === "jeans" && (
          <g>
            {/* Waistband */}
            <path
              d="M24 10 L76 10 L76 21 L24 21 Z"
              fill={colorHex}
              stroke={strokeColor}
              strokeWidth="2"
            />
            {/* Dynamic denim leg panels */}
            <path
              d="M24 21 L76 21 L80 122 L54 122 L50 56 L46 122 L20 122 Z"
              fill={colorHex}
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Textured highlights */}
            <path d="M28 35 Q35 55, 33 80" stroke={highlightedColor} strokeWidth="3" fill="none" />
            <path d="M72 35 Q65 55, 67 80" stroke={highlightedColor} strokeWidth="3" fill="none" />

            {/* Dynamic folded cuffs bottom */}
            <rect x="20" y="116" width="34" height="6" fill="#cbd5e1" stroke={strokeColor} strokeWidth="1.5" />
            <rect x="46" y="116" width="34" height="6" fill="#cbd5e1" stroke={strokeColor} strokeWidth="1.5" />

            {/* Copper Rivets (yellowdots) */}
            <circle cx="28" cy="24" r="1.5" fill="#ea580c" />
            <circle cx="72" cy="24" r="1.5" fill="#ea580c" />
            <circle cx="43" cy="21" r="1.5" fill="#ea580c" />

            {/* Scooped jeans front pocket curves */}
            <path d="M24 21 C28 27, 36 27, 38 21" fill="none" stroke={strokeColor} strokeWidth="1.5" />
            <path d="M76 21 C72 27, 64 27, 62 21" fill="none" stroke={strokeColor} strokeWidth="1.5" />

            {/* Distressed whiskering details */}
            <path d="M29 45 L36 43" stroke={shadowColor} strokeWidth="1" />
            <path d="M31 52 L38 49" stroke={shadowColor} strokeWidth="1" />
            <path d="M71 45 L64 43" stroke={shadowColor} strokeWidth="1" />
            <path d="M69 52 L62 49" stroke={shadowColor} strokeWidth="1" />
          </g>
        )}

        {svgType === "satin_skirt" && (
          <g>
            {/* High-waist band */}
            <path
              d="M32 10 L68 10 L68 18 L32 18 Z"
              fill={colorHex}
              stroke={strokeColor}
              strokeWidth="2"
            />
            {/* Flowing flare visual cut extending down */}
            <path
              d="M32 18 L68 18 C78 70, 94 105, 96 122 C78 126, 22 126, 4 122 C6 105, 22 70, 32 18 Z"
              fill={colorHex}
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Soft shimmering drapes with glowing reflections */}
            <path d="M38 25 C45 60, 20 100, 16 122" stroke={highlightedColor} strokeWidth="4" fill="none" />
            <path d="M50 20 C50 60, 52 100, 50 123" stroke={shadowColor} strokeWidth="2.5" fill="none" />
            <path d="M62 25 C55 60, 80 100, 84 122" stroke={highlightedColor} strokeWidth="4" fill="none" />

            {/* Gentle curving ripples at base hemline */}
            <path
              d="M4 122 C18 125, 34 120, 50 123 C66 120, 82 125, 96 122"
              stroke={strokeColor}
              strokeWidth="1.5"
              fill="none"
            />
          </g>
        )}

        {svgType === "ethnic_pajama" && (
          <g>
            {/* Loose ethnic pajama pants */}
            <path
              d="M26 12 L74 12 Q76 30, 78 50 L84 120 L66 120 Q60 70, 50 62 Q40 70, 34 120 L16 120 Q24 30, 26 12 Z"
              fill={colorHex}
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Drawstring ties at top */}
            <circle cx="50" cy="18" r="2" fill="#cbd5e1" stroke={strokeColor} />
            <path d="M48 18 Q44 26, 42 30" stroke="#cbd5e1" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <path d="M52 18 Q56 26, 58 30" stroke="#cbd5e1" strokeWidth="1.8" fill="none" strokeLinecap="round" />

            {/* Soft gathers or folds near ankles */}
            <path d="M18 108 C24 105, 29 111, 33 108" stroke={shadowColor} strokeWidth="1.2" fill="none" />
            <path d="M82 108 C76 105, 71 111, 67 108" stroke={shadowColor} strokeWidth="1.2" fill="none" />
          </g>
        )}

        {svgType === "pleated_pants" && (
          <g>
            {/* Structured high rise belt area */}
            <path
              d="M28 8 L72 8 L72 19 L28 19 Z"
              fill={colorHex}
              stroke={strokeColor}
              strokeWidth="2"
            />
            {/* Legs with sharp double creases */}
            <path
              d="M28 19 L72 19 L76 121 L51 121 L50 51 L49 121 L24 121 Z"
              fill={colorHex}
              stroke={strokeColor}
              strokeWidth="2.2"
              strokeLinejoin="round"
            />

            {/* Double pleat folded lines at top */}
            <path d="M36 19 L36 34" stroke={strokeColor} strokeWidth="1.5" />
            <path d="M40 19 L40 28" stroke={strokeColor} strokeWidth="1" />

            <path d="M64 19 L64 34" stroke={strokeColor} strokeWidth="1.5" />
            <path d="M60 19 L60 28" stroke={strokeColor} strokeWidth="1" />

            {/* Razor-sharp central crease shadow line along each front leg */}
            <path d="M36 34 L36 121" stroke={shadowColor} strokeWidth="2" />
            <path d="M64 34 L64 121" stroke={shadowColor} strokeWidth="2" />

            {/* Sleek metallic clasps */}
            <rect x="48" y="10" width="4" height="6" rx="0.5" fill="#94a3b8" stroke={strokeColor} strokeWidth="0.5" />
          </g>
        )}
        </g>

        {/* --- MODEL-SPECIFIC 3D CONTOUR SHADING OVERLAY MESH --- */}
        {renderContourOverlay()}
      </svg>
    </div>
  );
};
