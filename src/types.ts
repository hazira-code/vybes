export type GarmentType = "top" | "bottom";

export type StyleCategory = "casual" | "office" | "sporty" | "evening" | "wedding" | "festive";

export interface Garment {
  id: string;
  name: string;
  type: GarmentType;
  category: StyleCategory;
  description: string;
  colors: { name: string; hex: string }[];
  defaultColorHex: string;
  svgType: "tee" | "blazer" | "hoodie" | "blouse" | "kurta" | "tuxedo_shirt" | "chinos" | "jeans" | "satin_skirt" | "ethnic_pajama" | "pleated_pants";
  chestOffsetY?: number; // relative to model's default chest location
  hipsOffsetY?: number;  // relative to model's default hip location
  scale?: number;        // custom scaling factor
  price: number;
  brand: string;
}

export interface PresetModel {
  id: string;
  name: string;
  gender: "male" | "female" | "unisex";
  photoUrl: string;
  avatarUrl: string;
  heightCm: number;
  description: string;
  // Precise anchor box for garments (percentages or absolute coordinates)
  topAnchor: {
    x: number;      // % from left
    y: number;      // % from top
    width: number;  // % width of canvas
    height: number; // % height of canvas
  };
  bottomAnchor: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export type LightingMode = "daylight" | "indoor" | "evening" | "bright" | "lowlight";

export type FittingType = "slim" | "regular" | "loose";

export type ClothingSize = "XS" | "S" | "M" | "L" | "XL" | "XXL";

export interface SavedOutfit {
  id: string;
  name: string;
  modelId: string;
  modelName: string;
  topId: string;
  topColor: string;
  topColorHex: string;
  bottomId: string;
  bottomColor: string;
  bottomColorHex: string;
  lighting: LightingMode;
  size: ClothingSize;
  fitting: FittingType;
  material?: "cotton" | "silk" | "wool";
  customImageUrl?: string;
  grade?: number;
  verdict?: string;
  savedAt: string;
}

export interface RecommendationsResponse {
  themeStatement: string;
  colorPalette: string[];
  styles: {
    lookName: string;
    topChoice: string;
    bottomChoice: string;
    layering?: string;
    footwear: string;
    accessories: string[];
    stylingTip: string;
  }[];
}

export interface FashionReportCard {
  styleScore: number;
  overallVerdict: string;
  colorCohesiveness: string;
  lightingFitCheck: string;
  stylePrescription: string[];
}
