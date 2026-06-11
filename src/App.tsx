import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Camera,
  Upload,
  User,
  RefreshCw,
  Layers,
  Trash2,
  BookmarkPlus,
  Send,
  Sliders,
  CheckCircle2,
  Grid,
  Info,
  Calendar,
  Gift,
  Flame,
  Award,
  Sun,
  Palette,
  ShoppingBag,
  Cpu,
  ChevronRight,
  Eye,
  ScanFace,
  Lightbulb,
  DollarSign,
  Star,
  PartyPopper,
  X,
  HelpCircle,
} from "lucide-react";
import { PRESET_MODELS, GARMENTS, LIGHTING_ENVIRONMENTS } from "./data";
import { GarmentSvg } from "./components/GarmentSvg";
import {
  Garment,
  PresetModel,
  SavedOutfit,
  LightingMode,
  FittingType,
  ClothingSize,
  RecommendationsResponse,
  FashionReportCard,
} from "./types";

export default function App() {
  // --- STATE MANAGEMENT ---
  const [selectedModelId, setSelectedModelId] = useState<string>("model-sophia");
  const [currentTop, setCurrentTop] = useState<Garment | null>(
    GARMENTS.find((g) => g.id === "top-tee") || null
  );
  const [currentTopColor, setCurrentTopColor] = useState<{ name: string; hex: string }>({
    name: "Slate Grey",
    hex: "#4a5568",
  });
  const [currentBottom, setCurrentBottom] = useState<Garment | null>(
    GARMENTS.find((g) => g.id === "bottom-jeans") || null
  );
  const [currentBottomColor, setCurrentBottomColor] = useState<{ name: string; hex: string }>({
    name: "Aged Indigo",
    hex: "#3182ce",
  });

  const [fitting, setFitting] = useState<FittingType>("regular");
  const [size, setSize] = useState<ClothingSize>("M");
  const [lighting, setLighting] = useState<LightingMode>("daylight");
  const [material, setMaterial] = useState<"cotton" | "silk" | "wool">("cotton");

  // Custom User Photo / Webcam upload
  const [customModelImage, setCustomModelImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Manual overlay adjustments for custom uploads
  const [customTopX, setCustomTopX] = useState<number>(30);
  const [customTopY, setCustomTopY] = useState<number>(20);
  const [customTopWidth, setCustomTopWidth] = useState<number>(40);
  const [customTopHeight, setCustomTopHeight] = useState<number>(35);

  const [customBottomX, setCustomBottomX] = useState<number>(30);
  const [customBottomY, setCustomBottomY] = useState<number>(50);
  const [customBottomWidth, setCustomBottomWidth] = useState<number>(40);
  const [customBottomHeight, setCustomBottomHeight] = useState<number>(48);

  const [activeTab, setActiveTab] = useState<"tops" | "bottoms">("tops");

  // Saved combinations for Comparison Engine
  const [comparedOutfits, setComparedOutfits] = useState<SavedOutfit[]>([]);

  // AI Chat and Assistant State
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "model"; text: string }[]>([
    {
      role: "model",
      text: "Welcome to VYBES! I am your AI Wardrobe Concierge. Select any garment from the catalog on your left, configure your fit details, or ask me for expert styling tips on how to elevate your selected outfit!",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatSending, setIsChatSending] = useState(false);

  // Occasion Recommendation Engine
  const [recommendationQuery, setRecommendationQuery] = useState({
    occasion: "Casual Outing",
    stylePreference: "Calm Minimalism",
    targetVibe: "Confident & Understated",
    genderPreference: "female",
  });
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationsResponse | null>(null);

  // AI Fit Scan Assessment State
  const [isAnalyzingLook, setIsAnalyzingLook] = useState(false);
  const [fitReport, setFitReport] = useState<FashionReportCard | null>(null);

  // General Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isBuySuccess, setIsBuySuccess] = useState(false);

  // Active custom photo adjust panel visible
  const [showAdjustControls, setShowAdjustControls] = useState(false);

  // Recent History & Size Guide states
  const [recentHistory, setRecentHistory] = useState<any[]>([]);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Dynamic Scale factors helper based on Clothes Sizing to improve the virtual fit try-on
  const getSizeScale = (sz: ClothingSize) => {
    switch (sz) {
      case "XS": return 0.90;
      case "S": return 0.95;
      case "M": return 1.0;
      case "L": return 1.05;
      case "XL": return 1.10;
      case "XXL": return 1.15;
      default: return 1.0;
    }
  };

  // Setup sample compared outfits on load
  useEffect(() => {
    const initialCompare: SavedOutfit[] = [
      {
        id: "comp-1",
        name: "Casual Street Vibe",
        modelId: "model-sophia",
        modelName: "Sophia",
        topId: "top-tee",
        topColor: "Warm Terracotta",
        topColorHex: "#c53030",
        bottomId: "bottom-jeans",
        bottomColor: "Bleached Ice Blue",
        bottomColorHex: "#90cdf4",
        lighting: "daylight",
        size: "M",
        fitting: "loose",
        savedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
      {
        id: "comp-2",
        name: "Corporate Sharpness",
        modelId: "model-rohan",
        modelName: "Rohan",
        topId: "top-blazer",
        topColor: "Rich Navy",
        topColorHex: "#1a365d",
        bottomId: "bottom-chinos",
        bottomColor: "Classic Khaki",
        bottomColorHex: "#c0a080",
        lighting: "indoor",
        size: "L",
        fitting: "slim",
        savedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ];
    setComparedOutfits(initialCompare);
  }, []);

  // Track the last 5 outfit configurations tried on dynamically
  useEffect(() => {
    if (!currentTop && !currentBottom) return;

    // Check if configuration already matches the first item in the trail to avoid duplicate loops
    const lastHistory = recentHistory[0];
    if (
      lastHistory &&
      lastHistory.topId === (currentTop?.id || null) &&
      lastHistory.topColorName === (currentTopColor?.name || null) &&
      lastHistory.bottomId === (currentBottom?.id || null) &&
      lastHistory.bottomColorName === (currentBottomColor?.name || null) &&
      lastHistory.modelId === selectedModelId &&
      lastHistory.fitting === fitting &&
      lastHistory.size === size &&
      lastHistory.lighting === lighting
    ) {
      return;
    }

    const newHistoryItem = {
      id: `recent-${Date.now()}`,
      modelId: selectedModelId,
      topId: currentTop?.id || null,
      topColorName: currentTopColor?.name || null,
      topColorHex: currentTopColor?.hex || null,
      bottomId: currentBottom?.id || null,
      bottomColorName: currentBottomColor?.name || null,
      bottomColorHex: currentBottomColor?.hex || null,
      fitting,
      size,
      lighting,
      savedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    };

    setRecentHistory((prev) => {
      // Remove any previously saved items with identical details from the list
      const filtered = prev.filter(
        (item) =>
          !(
            item.topId === newHistoryItem.topId &&
            item.topColorName === newHistoryItem.topColorName &&
            item.bottomId === newHistoryItem.bottomId &&
            item.bottomColorName === newHistoryItem.bottomColorName &&
            item.modelId === newHistoryItem.modelId &&
            item.fitting === newHistoryItem.fitting &&
            item.size === newHistoryItem.size &&
            item.lighting === newHistoryItem.lighting
          )
      );
      return [newHistoryItem, ...filtered].slice(0, 5);
    });
  }, [currentTop, currentTopColor, currentBottom, currentBottomColor, selectedModelId, fitting, size, lighting, material]);

  // Show a temporary toast helper
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // --- ACTIONS ---

  // Handle Model Selection
  const handleModelChange = (modelId: string) => {
    setSelectedModelId(modelId);
    if (modelId !== "custom") {
      stopCamera();
    }
  };

  // Interactive Live Camera capturing
  const startCamera = async () => {
    setIsCameraActive(true);
    setSelectedModelId("custom");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 500, height: 600, facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera access failed", err);
      showToast("Webcam access restricted or not available. Reverting to photo upload.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const captureWebcamSnapshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 500;
      canvas.height = videoRef.current.videoHeight || 620;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const url = canvas.toDataURL("image/jpeg");
        setCustomModelImage(url);
        stopCamera();
        showToast("Selfie loaded into canvas dressing lounge! Align garments with sliders.");
        setShowAdjustControls(true);
      }
    }
  };

  // Custom photo upload processing
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setCustomModelImage(reader.result);
          setSelectedModelId("custom");
          stopCamera();
          showToast("Visual uploaded successfully to VYBES studio! Double check fits.");
          setShowAdjustControls(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset custom visual adjustments
  const resetCustomPositions = () => {
    setCustomTopX(30);
    setCustomTopY(20);
    setCustomTopWidth(40);
    setCustomTopHeight(35);
    setCustomBottomX(30);
    setCustomBottomY(50);
    setCustomBottomWidth(40);
    setCustomBottomHeight(48);
    showToast("Garment anchor weights reset back to initial grid coordinate.");
  };

  // Trigger Style analysis via Express Route calling Gemini 3.5 Flash server-side
  const runFitScanAnalysis = async () => {
    setIsAnalyzingLook(true);
    setFitReport(null);
    try {
      const payload = {
        topName: currentTop?.name || "None Selected",
        topColor: currentTopColor ? `${currentTopColor.name} (${currentTopColor.hex})` : "N/A",
        bottomName: currentBottom?.name || "None Selected",
        bottomColor: currentBottomColor ? `${currentBottomColor.name} (${currentBottomColor.hex})` : "N/A",
        lighting: LIGHTING_ENVIRONMENTS[lighting].name,
        size: size,
        fitting: fitting,
        customImage: selectedModelId === "custom",
      };

      const response = await fetch("/api/analyze-look", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Styling assessment server rejected");
      }

      const report: FashionReportCard = await response.json();
      setFitReport(report);
      showToast("Outfit validation completed by VYBES Chief Creative Editor!");
    } catch (err: any) {
      console.error(err);
      showToast(`AI Studio feedback offline: ${err.message}`);
    } finally {
      setIsAnalyzingLook(false);
    }
  };

  // Stylist Chatbot execution calling Gemini 3.5 Stylist agent
  const sendStylistMessage = async (prefilledMessage?: string) => {
    const textToSend = prefilledMessage || chatInput;
    if (!textToSend.trim()) return;

    const newMsgs = [...chatMessages, { role: "user" as const, text: textToSend }];
    setChatMessages(newMsgs);
    if (!prefilledMessage) setChatInput("");

    setIsChatSending(true);
    try {
      const context = {
        topName: currentTop?.name || "Bare Canvas text",
        topColor: currentTopColor?.name || "default",
        bottomName: currentBottom?.name || "Bare Canvas bottoms",
        bottomColor: currentBottomColor?.name || "default",
        lighting: LIGHTING_ENVIRONMENTS[lighting].name,
        modelName: selectedModelId === "custom" ? "Custom User Frame" : PRESET_MODELS.find(m => m.id === selectedModelId)?.name || "Sophia",
      };

      const response = await fetch("/api/stylist-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: chatMessages.slice(-6), // Send last 6 messages
          currentOutfit: context,
        }),
      });

      if (!response.ok) {
        throw new Error("Consultant connection error occurred.");
      }

      const resData = await response.json();
      setChatMessages((prev) => [...prev, { role: "model", text: resData.text }]);
    } catch (error: any) {
      console.error("Chat stylist error:", error);
      setChatMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: `VYBES Stylist is currently analyzing style indices. Error details: ${error.message}. Please configure your API secret keys if you haven't yet!`,
        },
      ]);
    } finally {
      setIsChatSending(false);
    }
  };

  // Generate customized recommended lookbook with occasion engine
  const fetchOccasionRecommendations = async () => {
    setIsGeneratingRecommendations(true);
    setRecommendations(null);
    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recommendationQuery),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Lookbook generator failed");
      }

      const resLookbook: RecommendationsResponse = await response.json();
      setRecommendations(resLookbook);
      showToast(`Vibrant ${recommendationQuery.occasion} wardrobe recommendations received!`);
    } catch (err: any) {
      console.error(err);
      showToast(`Unable to synthesize occasion files: ${err.message}`);
    } finally {
      setIsGeneratingRecommendations(false);
    }
  };

  // Save look to comparison list
  const addOutfitToComparison = () => {
    if (!currentTop && !currentBottom) {
      showToast("Please choose at least a top or a bottom layer to lock a design.");
      return;
    }

    const mName = selectedModelId === "custom" ? "Custom Persona" : PRESET_MODELS.find(m => m.id === selectedModelId)?.name || "Sophia";
    const newSaved: SavedOutfit = {
      id: `saved-${Date.now()}`,
      name: `${currentTop?.name?.split(" ")[1] || "Nude"} with ${currentBottom?.name?.split(" ")[1] || "Denim"}`,
      modelId: selectedModelId,
      modelName: mName,
      topId: currentTop?.id || "",
      topColor: currentTopColor?.name || "",
      topColorHex: currentTopColor?.hex || "",
      bottomId: currentBottom?.id || "",
      bottomColor: currentBottomColor?.name || "",
      bottomColorHex: currentBottomColor?.hex || "",
      lighting,
      size,
      fitting,
      material,
      customImageUrl: selectedModelId === "custom" ? customModelImage || undefined : undefined,
      savedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setComparedOutfits((prev) => [newSaved, ...prev]);
    showToast("Virtual snapshot compiled and locked in side-by-side comparison lookbook!");
  };

  // Apply a saved comparison state directly to live fitting model
  const applyComparedOutfit = (outfit: SavedOutfit) => {
    setSelectedModelId(outfit.modelId);
    if (outfit.customImageUrl) {
      setCustomModelImage(outfit.customImageUrl);
    }
    const matchingTop = GARMENTS.find((g) => g.id === outfit.topId);
    if (matchingTop) {
      setCurrentTop(matchingTop);
      const topCol = matchingTop.colors.find((c) => c.name === outfit.topColor) || matchingTop.colors[0];
      setCurrentTopColor(topCol);
    } else {
      setCurrentTop(null);
    }

    const matchingBottom = GARMENTS.find((g) => g.id === outfit.bottomId);
    if (matchingBottom) {
      setCurrentBottom(matchingBottom);
      const bottomCol = matchingBottom.colors.find((c) => c.name === outfit.bottomColor) || matchingBottom.colors[0];
      setCurrentBottomColor(bottomCol);
    } else {
      setCurrentBottom(null);
    }

    setLighting(outfit.lighting);
    setSize(outfit.size);
    setFitting(outfit.fitting);
    if (outfit.material) {
      setMaterial(outfit.material);
    }
    showToast(`Loaded "${outfit.name}" back onto dynamic fit stage!`);
  };

  // Remove comparison entry
  const removeComparedOutfit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setComparedOutfits((prev) => prev.filter((o) => o.id !== id));
    showToast("Fit frame disconnected from comparison list.");
  };

  // Fast set garment in catalog
  const selectGarment = (garment: Garment) => {
    if (garment.type === "top") {
      setCurrentTop(garment);
      setCurrentTopColor(garment.colors[0]);
    } else {
      setCurrentBottom(garment);
      setCurrentBottomColor(garment.colors[0]);
    }
  };

  // Restore configuration from recent history carousel
  const restoreRecentConfig = (item: any) => {
    setSelectedModelId(item.modelId);
    
    const matchingTop = GARMENTS.find((g) => g.id === item.topId);
    if (matchingTop) {
      setCurrentTop(matchingTop);
      const topCol = matchingTop.colors.find((c) => c.name === item.topColorName) || matchingTop.colors[0];
      setCurrentTopColor(topCol);
    } else {
      setCurrentTop(null);
    }

    const matchingBottom = GARMENTS.find((g) => g.id === item.bottomId);
    if (matchingBottom) {
      setCurrentBottom(matchingBottom);
      const bottomCol = matchingBottom.colors.find((c) => c.name === item.bottomColorName) || matchingBottom.colors[0];
      setCurrentBottomColor(bottomCol);
    } else {
      setCurrentBottom(null);
    }

    setFitting(item.fitting);
    setSize(item.size);
    setLighting(item.lighting);
    showToast(`Restored previous outfit from history!`);
  };

  // Dynamic values computation
  const totalPrice = (currentTop?.price || 0) + (currentBottom?.price || 0);
  const lightingEnv = LIGHTING_ENVIRONMENTS[lighting];

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white flex flex-col font-sans selection:bg-[#7C3AED] selection:text-white antialiased overflow-x-hidden">
      {/* Toast Alert overlay */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-black/80 backdrop-blur-md border-l-4 border-[#7C3AED] hover:border-[#A855F7] text-white p-4 rounded-r-xl shadow-2xl flex items-center gap-3 transition-all duration-300">
          <Sparkles className="w-5 h-5 text-[#A855F7] shrink-0 animate-pulse" />
          <p className="text-sm font-medium tracking-wide">{toastMessage}</p>
        </div>
      )}

      {/* --- PREMIUM BRAND HEADER --- */}
      <header className="relative border-b border-white/5 bg-[#0F0F0F]/80 backdrop-blur-md px-6 py-4 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-[#7C3AED] to-[#A855F7] p-2.5 rounded-xl shadow-lg ring-1 ring-white/10">
              <Layers className="w-6 h-6 text-white stroke-[2]" id="header-logo-icon" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-[#7C3AED] via-[#9F66FF] to-[#A855F7] uppercase font-sans ai-pulse-text">
                  VYBES
                </h1>
                <span className="text-[10px] px-2.5 py-0.5 bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-[#A855F7] font-mono rounded-full uppercase tracking-wider animate-pulse">
                  AI DIGITAL IMMERSION
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-widest uppercase">
                &quot;Try It Virtually. Wear It Confidently.&quot;
              </p>
            </div>
          </div>

          {/* Quick Stats Showcase of Vision & Mission */}
          <div className="flex flex-wrap items-center gap-3 text-xs bg-white/5 p-1.5 rounded-2xl border border-white/5">
            <span className="text-slate-400 px-2 font-medium">VYBES Engine:</span>
            <span className="bg-[#0F0F0F] px-3 py-1 rounded-xl text-[#7C3AED] font-mono hover:bg-[#7C3AED]/10 transition border border-[#7C3AED]/20">
              ● Low Return Ratios
            </span>
            <span className="bg-[#0F0F0F] px-3 py-1 rounded-xl text-[#A855F7] font-mono hover:bg-[#A855F7]/10 transition border border-[#A855F7]/20">
              ● Custom Lightscapes
            </span>
          </div>
        </div>
      </header>

      {/* --- HERO MISSION STRIP BRIEFING --- */}
      <div className="bg-[#0F0F0F] border-b border-white/5 px-6 py-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.08),transparent_50%)]" />
        <div className="max-w-3xl mx-auto relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#7C3AED]/10 text-[#A855F7] border border-[#7C3AED]/30 px-3.5 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-[#7C3AED]" />
            HIGH-FIDELITY DIGITAL LUXURY TRY-ON
          </div>
          <p className="text-sm md:text-base text-slate-300/95 font-light leading-relaxed max-w-2xl mx-auto tracking-wide">
            VYBES fuses ultra-fine clothing geometry, ambient lighting simulation, and a personal AI Stylist to eradicate sizing mismatch. Try it virtually, experience the vibe, custom-tailor the drape.
          </p>
        </div>
      </div>

      {/* --- MAIN INTERACTIVE WORKSPACE --- */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ================= COLUMN 1: INTERACTIVE try-on simulator arena (Center Left - 5 cols) ================= */}
        <section className="lg:col-span-5 flex flex-col gap-6" id="tryon-dressing-arena">
          <div className="glass-panel holographic-glow rounded-[32px] p-6 flex flex-col gap-6 relative overflow-hidden group">
            {/* Ambient Lighting Gradient Overlay layer */}
            <div className={`absolute inset-0 transition-opacity duration-700 pointer-events-none opacity-40 mix-blend-color-dodge ${lightingEnv.bgClass}`} />

            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <ScanFace className="w-5 h-5 text-[#A855F7]" />
                <h3 className="font-semibold text-slate-200 tracking-wider font-sans uppercase text-[13px]">Fitting Arena</h3>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] bg-black/60 px-3 py-1 rounded-xl border border-white/5 text-slate-400">
                <Sun className={`w-3.5 h-3.5 ${lightingEnv.accentColor}`} />
                <span className="font-mono uppercase tracking-wide">{lightingEnv.name}</span>
              </div>
            </div>

            {/* THE VISUAL STAGE INTERACTIVE FIELD */}
            <div
              className={`w-full aspect-[4/5] rounded-[24px] relative overflow-hidden border border-white/5 flex items-center justify-center transition-all duration-500 shadow-2xl bg-[#0F0F0F] ${
                isCameraActive ? "ring-2 ring-[#7C3AED]/40" : ""
              }`}
              style={{
                boxShadow: `0 25px 50px -12px ${lightingEnv.shadowColor || 'rgba(0,0,0,0.5)'}`,
              }}
            >
              {/* Dynamic Lens Light Overlay filter */}
              <div
                className="absolute inset-0 z-20 pointer-events-none mix-blend-overlay transition-all duration-500"
                style={{
                  backgroundColor: lightingEnv.filterHex,
                  backdropFilter: "none",
                  WebkitBackdropFilter: "none",
                }}
              />

              {/* Dynamic CSS filter layer on preview */}
              <div
                className="absolute inset-0 z-10 w-full h-full flex items-center justify-center transition-all duration-500"
                style={{ filter: lightingEnv.cssFilter }}
              >
                {/* --- LIVE CAMERA INTERFACE --- */}
                {selectedModelId === "custom" && isCameraActive ? (
                  <div className="absolute inset-0 z-30 bg-black flex flex-col justify-between p-4">
                    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                      <video
                        ref={videoRef}
                        className="w-full h-full object-cover rounded-2xl"
                        playsInline
                        muted
                      />
                    </div>
                    <div className="absolute inset-0 border-2 border-dashed border-[#7C3AED]/40 m-6 pointer-events-none rounded-2xl flex flex-col justify-between p-4">
                      <span className="text-[#A855F7] font-mono text-[10px] tracking-widest bg-black/80 px-3 py-1 rounded-full self-start">
                        ● LIVE CAMERA ACTIVE
                      </span>
                      <span className="text-slate-400/85 text-[10px] text-center mb-10 tracking-wide">
                        Pose centered inside guiding contours
                      </span>
                    </div>
                    <div className="z-40 w-full flex justify-center gap-3 mt-auto pb-4">
                      <button
                        onClick={captureWebcamSnapshot}
                        className="px-6 py-3.5 bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white font-semibold rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        Snap Fit Style
                      </button>
                      <button
                        onClick={stopCamera}
                        className="px-4 py-3.5 bg-white/5 border border-white/5 text-slate-300 font-medium rounded-xl text-xs hover:bg-white/10"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* --- MODEL BASE PHOTO --- */}
                {selectedModelId === "custom" ? (
                  customModelImage ? (
                    <img
                      src={customModelImage}
                      alt="Custom user portrait visual fit"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-[#0D0D0D] text-slate-400">
                      <Upload className="w-10 h-10 text-[#7C3AED] mb-3 animate-pulse" />
                      <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider mb-2">
                        No Portrait Avatar Loaded
                      </h4>
                      <p className="text-[11px] text-slate-500 max-w-xs mb-5 leading-relaxed font-light">
                        Upload your personal high-res portrait or initiate your live camera viewport to preview the luxury drapes dynamically.
                      </p>
                      <div className="flex flex-col gap-2 w-full max-w-xs">
                        <label className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-all active:scale-95">
                          <Upload className="w-4 h-4 text-[#A855F7]" />
                          Upload Portrait
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                        <button
                          onClick={startCamera}
                          className="px-4 py-3 bg-[#7C3AED] hover:bg-[#A855F7] text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md shadow-[#7C3AED]/10"
                        >
                          <Camera className="w-4 h-4" />
                          Launch Live Camera
                        </button>
                      </div>
                    </div>
                  )
                ) : (
                  // Map Presets
                  <div className="relative w-full h-full">
                    <img
                      src={PRESET_MODELS.find((m) => m.id === selectedModelId)?.photoUrl}
                      alt="Model visual showcase representation"
                      className="w-full h-full object-cover transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 pointer-events-none" />
                  </div>
                )}

                {/* --- GARMENT LAYERING OVERLAYS --- */}
                {selectedModelId !== "custom" ? (
                  // Preset positioning configuration
                  (() => {
                    const activeModel = PRESET_MODELS.find((m) => m.id === selectedModelId);
                    if (!activeModel) return null;
                    const scaleFactor = getSizeScale(size);
                    return (
                      <>
                        {/* BOTTOMS LAYER */}
                        {currentBottom && (
                          <div
                            className="absolute z-10 transition-all duration-300 animate-fade-in"
                            style={{
                              left: `${activeModel.bottomAnchor.x}%`,
                              top: `${activeModel.bottomAnchor.y}%`,
                              width: `${activeModel.bottomAnchor.width}%`,
                              height: `${activeModel.bottomAnchor.height}%`,
                              transform: `scale(${scaleFactor})`,
                              transformOrigin: "center top",
                              filter: "drop-shadow(0px 8px 16px rgba(0,0,0,0.45))",
                            }}
                          >
                            <GarmentSvg
                              type="bottom"
                              svgType={currentBottom.svgType}
                              colorHex={currentBottomColor?.hex || currentBottom.defaultColorHex}
                              fitting={fitting}
                              material={material}
                              modelId={selectedModelId}
                              className="w-full h-full"
                            />
                          </div>
                        )}

                        {/* TOPS LAYER */}
                        {currentTop && (
                          <div
                            className="absolute z-15 transition-all duration-300 animate-fade-in"
                            style={{
                              left: `${activeModel.topAnchor.x}%`,
                              top: `${activeModel.topAnchor.y}%`,
                              width: `${activeModel.topAnchor.width}%`,
                              height: `${activeModel.topAnchor.height}%`,
                              transform: `scale(${scaleFactor})`,
                              transformOrigin: "center top",
                              filter: "drop-shadow(0px 8px 18px rgba(0,0,0,0.5))",
                            }}
                          >
                            <GarmentSvg
                              type="top"
                              svgType={currentTop.svgType}
                              colorHex={currentTopColor?.hex || currentTop.defaultColorHex}
                              fitting={fitting}
                              material={material}
                              modelId={selectedModelId}
                              className="w-full h-full"
                            />
                          </div>
                        )}
                      </>
                    );
                  })()
                ) : (
                  // Custom Positioning configuration for Uploaded visual overlays
                  customModelImage && (
                    <>
                      {/* BOTTOM LAYER */}
                      {currentBottom && (
                        <div
                          className="absolute z-10"
                          style={{
                            left: `${customBottomX}%`,
                            top: `${customBottomY}%`,
                            width: `${customBottomWidth}%`,
                            height: `${customBottomHeight}%`,
                            transform: `scale(${getSizeScale(size)})`,
                            transformOrigin: "center top",
                            filter: "drop-shadow(0px 8px 16px rgba(0,0,0,0.45))",
                          }}
                        >
                          <GarmentSvg
                            type="bottom"
                            svgType={currentBottom.svgType}
                            colorHex={currentBottomColor?.hex || currentBottom.defaultColorHex}
                            fitting={fitting}
                            material={material}
                            modelId={selectedModelId}
                            className="w-full h-full"
                          />
                        </div>
                      )}

                      {/* TOP LAYER */}
                      {currentTop && (
                        <div
                          className="absolute z-15"
                          style={{
                            left: `${customTopX}%`,
                            top: `${customTopY}%`,
                            width: `${customTopWidth}%`,
                            height: `${customTopHeight}%`,
                            transform: `scale(${getSizeScale(size)})`,
                            transformOrigin: "center top",
                            filter: "drop-shadow(0px 8px 18px rgba(0,0,0,0.5))",
                          }}
                        >
                          <GarmentSvg
                            type="top"
                            svgType={currentTop.svgType}
                            colorHex={currentTopColor?.hex || currentTop.defaultColorHex}
                            fitting={fitting}
                            material={material}
                            modelId={selectedModelId}
                            className="w-full h-full"
                          />
                        </div>
                      )}
                    </>
                  )
                )}
              </div>

              {/* Dynamic Fit details badge watermark */}
              {selectedModelId !== "custom" && (
                <div className="absolute bottom-4 left-4 bg-black/75 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/5 text-[10px] text-slate-400 z-35 flex flex-col gap-0.5">
                  <span className="text-[9px] text-[#A855F7] uppercase tracking-widest font-bold font-sans">Silhouette Status</span>
                  <p className="text-slate-200">
                    {PRESET_MODELS.find((m) => m.id === selectedModelId)?.name} • Size {size} • (
                    {fitting})
                  </p>
                </div>
              )}
            </div>

            {/* LIGHT INTERACTIVE SIMULATOR DIAL */}
            <div className="flex flex-col gap-2.5 z-10" id="lighting-simulation">
              <span className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold font-sans">
                Environmental Lighting Simulator
              </span>
              <div className="grid grid-cols-5 gap-1.5 bg-black/45 p-1.5 rounded-2xl border border-white/5 font-sans">
                {(Object.keys(LIGHTING_ENVIRONMENTS) as LightingMode[]).map((key) => {
                  const isActive = lighting === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setLighting(key)}
                      className={`py-2 rounded-xl text-[10px] font-semibold tracking-wider uppercase transition-all flex flex-col items-center gap-1 ${
                        isActive
                          ? "bg-[#7C3AED]/20 text-[#A855F7] shadow-lg border border-[#7C3AED]/30"
                          : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                      }`}
                      title={LIGHTING_ENVIRONMENTS[key].description}
                    >
                      <Sun className={`w-3.5 h-3.5 ${isActive ? "text-[#A855F7]" : "text-slate-500"}`} />
                      <span>{key}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RECENT HISTORY CAROUSEL */}
            <div className="flex flex-col gap-2.5 z-10 border-t border-white/5 pt-4.5" id="recent-history-carousel">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-[#A855F7] animate-spin" style={{ animationDuration: '6s' }} />
                  <span className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold font-sans">
                    Recent History
                  </span>
                </div>
                <span className="text-[9px] px-2 py-0.5 bg-black/50 border border-white/5 rounded-full text-slate-500 font-mono">
                  Last 5 Configurations
                </span>
              </div>

              {recentHistory.length === 0 ? (
                <div className="bg-black/25 rounded-2xl border border-dashed border-white/5 p-4 text-center">
                  <p className="text-[11px] text-slate-500 font-sans italic font-light">
                    Tweak alignment, sizes, or garments to begin generating outfit states.
                  </p>
                </div>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-inner scrollbar-thumb-white/5">
                  {recentHistory.map((item, idx) => {
                    const isCurrentlyActive =
                      item.topId === (currentTop?.id || null) &&
                      item.topColorName === (currentTopColor?.name || null) &&
                      item.bottomId === (currentBottom?.id || null) &&
                      item.bottomColorName === (currentBottomColor?.name || null) &&
                      item.modelId === selectedModelId &&
                      item.fitting === fitting &&
                      item.size === size &&
                      item.lighting === lighting;

                    const matchModel = PRESET_MODELS.find(m => m.id === item.modelId);
                    const modelLabel = matchModel ? matchModel.name : "Custom";

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => restoreRecentConfig(item)}
                        className={`group/item flex-shrink-0 w-[140px] text-left p-2.5 rounded-2xl border transition-all text-[11px] ${
                          isCurrentlyActive
                            ? "bg-[#7C3AED]/20 border-[#7C3AED]/60 shadow-md shadow-[#7C3AED]/5"
                            : "bg-black/30 hover:bg-black/65 border-white/5 hover:border-white/10"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-[9px] font-mono font-bold tracking-wider uppercase ${isCurrentlyActive ? "text-[#A855F7]" : "text-slate-400"}`}>
                            #{idx + 1}
                          </span>
                          <span className="text-[8px] text-slate-500 font-mono">
                            {item.savedAt.split(" ")[0]}
                          </span>
                        </div>

                        <div className="space-y-1 font-sans">
                          <div className="truncate text-slate-200 font-semibold group-hover/item:text-white transition-colors">
                            {item.topId ? GARMENTS.find(g => g.id === item.topId)?.name.split(" ")[1] || "Top" : "Bare Top"}
                            <span className="text-slate-400 text-[9px] ml-1">
                              ({item.topColorName?.split(" ")[0] || "Default"})
                            </span>
                          </div>
                          
                          <div className="truncate text-slate-300 font-medium">
                            {item.bottomId ? GARMENTS.find(g => g.id === item.bottomId)?.name.split(" ")[1] || "Bottom" : "Bare Bottom"}
                            <span className="text-slate-400 text-[9px] ml-1">
                              ({item.bottomColorName?.split(" ")[0] || "Default"})
                            </span>
                          </div>

                          <div className="pt-1.5 mt-1.5 border-t border-white/5 flex flex-wrap items-center gap-1.5 text-[9px] text-slate-400 font-mono leading-none">
                            <span className="bg-white/5 px-1 rounded-md truncate max-w-[50px]">{modelLabel}</span>
                            <span className="bg-white/5 px-1.5 rounded-md uppercase font-bold text-[#A855F7]">{item.size}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* CUSTOM PHOTO FINE POSITION ADJUSTMENT PANEL */}
            {selectedModelId === "custom" && customModelImage && (
              <div className="z-10 bg-black/40 p-4 rounded-2xl border border-white/5 flex flex-col gap-2.5">
                <button
                  onClick={() => setShowAdjustControls(!showAdjustControls)}
                  className="w-full py-2.5 px-3.5 bg-white/5 hover:bg-white/10 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-between transition-all border border-white/5 font-sans"
                >
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#7C3AED] animate-pulse" />
                    Manually Align Garments On Photo
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {showAdjustControls ? "Hide Sliders" : "Show Alignment Sliders"}
                  </span>
                </button>

                {showAdjustControls && (
                  <div className="flex flex-col gap-3 py-1 text-xs">
                    <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
                      <span className="text-slate-400 font-medium">Coordinate Draggers</span>
                      <button
                        onClick={resetCustomPositions}
                        className="text-[10px] bg-white/5 hover:bg-white/10 px-2.5 py-0.5 rounded-lg text-[#A855F7] border border-white/5 flex items-center gap-1"
                      >
                        <RefreshCw className="w-2.5 h-2.5" /> Reset
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Top garment sliders */}
                      <div className="bg-[#0C0C0C] p-3 rounded-xl space-y-2 border border-white/5">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-[#7C3AED] font-bold uppercase tracking-wider">TOP LAYER:</span>
                          <span className="text-slate-500 font-mono">X: {customTopX} | Y: {customTopY}</span>
                        </div>
                        <div className="space-y-1.5 font-sans justify-center">
                          <label className="flex items-center gap-2 text-[10px] text-slate-500">
                            <span className="w-12 shrink-0 text-left">H-Offset</span>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={customTopX}
                              onChange={(e) => setCustomTopX(Number(e.target.value))}
                              className="w-full accent-[#7C3AED] h-1 bg-black rounded-lg"
                            />
                          </label>
                          <label className="flex items-center gap-2 text-[10px] text-slate-500">
                            <span className="w-12 shrink-0 text-left">V-Offset</span>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={customTopY}
                              onChange={(e) => setCustomTopY(Number(e.target.value))}
                              className="w-full accent-[#7C3AED] h-1 bg-black rounded-lg"
                            />
                          </label>
                          <label className="flex items-center gap-2 text-[10px] text-slate-500">
                            <span className="w-12 shrink-0 text-left">Width</span>
                            <input
                              type="range"
                              min="10"
                              max="90"
                              value={customTopWidth}
                              onChange={(e) => setCustomTopWidth(Number(e.target.value))}
                              className="w-full accent-[#7C3AED] h-1 bg-black rounded-lg"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Bottom garment sliders */}
                      <div className="bg-[#0C0C0C] p-3 rounded-xl space-y-2 border border-white/5">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-[#A855F7] font-bold uppercase tracking-wider">BOTTOMS LAYER:</span>
                          <span className="text-slate-500 font-mono">X: {customBottomX} | Y: {customBottomY}</span>
                        </div>
                        <div className="space-y-1.5 font-sans justify-center">
                          <label className="flex items-center gap-2 text-[10px] text-slate-500">
                            <span className="w-12 shrink-0 text-left">H-Offset</span>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={customBottomX}
                              onChange={(e) => setCustomBottomX(Number(e.target.value))}
                              className="w-full accent-[#A855F7] h-1 bg-black rounded-lg"
                            />
                          </label>
                          <label className="flex items-center gap-2 text-[10px] text-slate-500">
                            <span className="w-12 shrink-0 text-left">V-Offset</span>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={customBottomY}
                              onChange={(e) => setCustomBottomY(Number(e.target.value))}
                              className="w-full accent-[#A855F7] h-1 bg-black rounded-lg"
                            />
                          </label>
                          <label className="flex items-center gap-2 text-[10px] text-slate-500">
                            <span className="w-12 shrink-0 text-left">Width</span>
                            <input
                              type="range"
                              min="10"
                              max="90"
                              value={customBottomWidth}
                              onChange={(e) => setCustomBottomWidth(Number(e.target.value))}
                              className="w-full accent-[#A855F7] h-1 bg-black rounded-lg"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CHECKOUT WARDROBE CART (B2C Model Pricing Breakdown) */}
          <div className="glass-panel p-6 rounded-[32px] flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#A855F7]" />
              <h4 className="font-semibold text-slate-200 tracking-wider text-xs uppercase font-sans">Checked-In Wardrobe</h4>
            </div>

            <div className="divide-y divide-white/5 bg-black/40 rounded-2xl p-4.5 border border-white/5 text-xs flex flex-col gap-3">
              {currentTop ? (
                <div className="flex items-center justify-between pb-2.5 pt-1 gap-2">
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase font-mono text-[#7C3AED] font-bold tracking-wider">{currentTop.brand}</span>
                    <p className="font-semibold text-slate-200 truncate">{currentTop.name}</p>
                    <p className="text-slate-500 text-[10px]">
                      Selected Shade: <span className="text-slate-300 font-bold">{currentTopColor?.name || "Original"}</span>
                    </p>
                  </div>
                  <span className="font-mono text-slate-300 font-bold shrink-0">${currentTop.price}</span>
                </div>
              ) : (
                <p className="text-slate-600 italic py-1 font-light class-sans text-[11px]">No Top Layer selected</p>
              )}

              {currentBottom ? (
                <div className="flex items-center justify-between pt-2.5 pb-1 gap-2">
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase font-mono text-[#A855F7] font-bold tracking-wider">{currentBottom.brand}</span>
                    <p className="font-semibold text-slate-200 truncate">{currentBottom.name}</p>
                    <p className="text-slate-500 text-[10px]">
                      Selected Shade: <span className="text-slate-300 font-bold">{currentBottomColor?.name || "Original"}</span>
                    </p>
                  </div>
                  <span className="font-mono text-slate-300 font-bold shrink-0">${currentBottom.price}</span>
                </div>
              ) : (
                <p className="text-slate-600 italic py-1 font-light class-sans text-[11px]">No Bottom Layer selected</p>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-white/5 font-semibold text-slate-200 text-sm">
                <span>Estimated Value:</span>
                <span className="font-mono text-[#7C3AED] text-lg font-bold">${totalPrice}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={addOutfitToComparison}
                className="py-3.5 bg-black/40 hover:bg-black/90 text-slate-200 border border-white/5 hover:border-white/10 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 uppercase tracking-wider"
              >
                <BookmarkPlus className="w-4 h-4 text-[#A855F7]" />
                Snapshot Look
              </button>
              <button
                onClick={() => {
                  setIsBuySuccess(true);
                  setTimeout(() => setIsBuySuccess(false), 4500);
                }}
                className="py-3.5 bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white font-extrabold text-xs rounded-xl shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
              >
                <CheckCircle2 className="w-4 h-4" />
                Buy Confidently
              </button>
            </div>

            {/* Instant checkout feedback animation overlay */}
            {isBuySuccess && (
              <div className="bg-[#7C3AED]/10 border border-[#7C3AED]/20 rounded-2xl p-4 flex flex-col gap-2 items-center text-center animate-fade-in">
                <PartyPopper className="w-7 h-7 text-[#A855F7] animate-bounce" />
                <div>
                  <h5 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Simulated Order Dispatched!</h5>
                  <p className="text-[10px] text-slate-400 mt-1 font-light leading-relaxed">
                    With an online try-on confidence score of 98%, you have successfully skipped the return hassle! Order is processed via VYBES SaaS checkout interface.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ================= COLUMN 2: WARDROBE CATALOG & MODIFICATIONS (Middle Right - 4 cols) ================= */}
        <section className="lg:col-span-4 flex flex-col gap-6" id="wardrobe-catalog-and-controls">

          {/* MODEL SELECTION DECK */}
          <div className="glass-panel rounded-[32px] p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#A855F7]" />
                <h4 className="font-semibold text-slate-200 text-xs tracking-wider uppercase font-sans">Choose Model Frame</h4>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Preset or Upload</span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {PRESET_MODELS.map((model) => {
                const isSelected = selectedModelId === model.id;
                return (
                  <button
                    key={model.id}
                    onClick={() => handleModelChange(model.id)}
                    className={`relative aspect-square py-1 px-1 rounded-2xl flex flex-col items-center justify-center transition-all bg-black/60 ${
                      isSelected
                        ? "border-2 border-[#7C3AED] ring-4 ring-[#7C3AED]/20"
                        : "border border-white/5 hover:border-white/10 hover:bg-white/5"
                    }`}
                    title={model.description}
                  >
                    <img
                      src={model.avatarUrl}
                      alt={model.name}
                      className="w-10 h-10 rounded-xl object-cover shrink-0 select-none shadow-inner"
                    />
                    <span className="text-[9px] font-bold text-slate-400 mt-1 truncate w-full text-center">
                      {model.name}
                    </span>
                  </button>
                );
              })}

              {/* Uploaded User Photo Tab button */}
              <button
                onClick={() => handleModelChange("custom")}
                className={`relative aspect-square rounded-2xl bg-black/60 border flex flex-col items-center justify-center transition-all ${
                  selectedModelId === "custom"
                    ? "border-2 border-[#7C3AED] ring-4 ring-[#7C3AED]/20"
                    : "border-white/5 hover:border-white/10 hover:bg-white/5"
                }`}
                title="Use custom uploaded snapshot frame image"
              >
                {customModelImage ? (
                  <img
                    src={customModelImage}
                    alt="Custom file"
                    className="w-10 h-10 rounded-xl object-cover shrink-0"
                  />
                ) : (
                  <Camera className="w-5 h-5 text-[#A855F7]" />
                )}
                <span className="text-[9px] font-bold text-slate-400 mt-1">Me</span>
              </button>
            </div>
          </div>

          {/* WALK-IN WARDROBE CATALOG */}
          <div className="glass-panel rounded-[32px] p-6 flex flex-col gap-4 flex-1">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#A855F7] font-mono tracking-widest uppercase font-bold">
                  VYBES WARDROBE
                </span>
                <span className="text-[10px] text-slate-500 font-mono">11 Premium Curations</span>
              </div>
              <h4 className="font-semibold text-slate-200 text-xs tracking-wider uppercase font-sans">Dynamic Wardrobe Catalog</h4>
            </div>

            {/* Tops vs Bottoms Selection Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-black/45 p-1 rounded-2xl border border-white/5 text-xs">
              <button
                onClick={() => setActiveTab("tops")}
                className={`py-2.5 rounded-xl font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "tops"
                    ? "bg-[#7C3AED]/20 text-white border border-[#7C3AED]/30 shadow-md"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Tops (6)
              </button>
              <button
                onClick={() => setActiveTab("bottoms")}
                className={`py-2.5 rounded-xl font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "bottoms"
                    ? "bg-[#7C3AED]/20 text-white border border-[#7C3AED]/30 shadow-md"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                Bottoms (5)
              </button>
            </div>

            {/* List with curated items */}
            <div className="flex-1 overflow-y-auto space-y-3 max-h-[300px] scrollbar-thin pr-1">
              {GARMENTS.filter((g) => g.type === (activeTab === "tops" ? "top" : "bottom")).map(
                (garment) => {
                  const isCurrentlyTried =
                    activeTab === "tops"
                      ? currentTop?.id === garment.id
                      : currentBottom?.id === garment.id;

                  return (
                    <div
                      key={garment.id}
                      onClick={() => selectGarment(garment)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex gap-3 text-xs bg-black/50 relative ${
                        isCurrentlyTried
                          ? "border-[#7C3AED]/80 bg-[#7C3AED]/5 shadow-lg ring-1 ring-[#7C3AED]/20"
                          : "border-white/5 hover:border-white/10 hover:bg-white/5"
                      }`}
                    >
                      {/* Left icon badge representing item */}
                      <div className="w-12 h-12 rounded-xl bg-black border border-white/5 flex items-center justify-center shrink-0">
                        <Palette className="w-5 h-5 text-[#A855F7]" />
                      </div>

                      <div className="min-w-0 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-1">
                            <h5 className="font-semibold text-slate-200 truncate">{garment.name}</h5>
                            <span className="font-mono text-[#A855F7] font-bold shrink-0">
                              ${garment.price}
                            </span>
                          </div>
                          <p className="text-slate-500 text-[10px] line-clamp-2 mt-0.5 leading-relaxed font-light">
                            {garment.description}
                          </p>
                        </div>

                        {/* Badges showing features */}
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                          <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 bg-white/5 text-slate-400 rounded-lg">
                            {garment.category}
                          </span>
                          <span className="text-[9px] text-slate-400 text-right ml-auto">
                            {garment.colors.length} shades
                          </span>
                        </div>
                      </div>

                      {/* Accent Dot when active */}
                      {isCurrentlyTried && (
                        <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#7C3AED] rounded-full animate-ping" />
                      )}
                    </div>
                  );
                }
              )}
            </div>

            {/* GARMENT DETAILS MODIFICATION OPTIONS (Fitting profile, sizes, colors) */}
            <div className="bg-black/40 border border-white/5 p-4.5 rounded-[24px] flex flex-col gap-4 text-xs font-sans">
              {/* SHADE SELECTOR */}
              <div className="flex flex-col gap-2">
                <span className="font-bold text-slate-300">Curated Colors (Exclusive palettes)</span>
                {(() => {
                  const targetGarment = activeTab === "tops" ? currentTop : currentBottom;
                  const selectedShade = activeTab === "tops" ? currentTopColor : currentBottomColor;
                  const setShade = activeTab === "tops" ? setCurrentTopColor : setCurrentBottomColor;

                  if (!targetGarment) {
                    return <p className="text-xs text-slate-600 font-light italic">Select any clothes item first.</p>;
                  }

                  return (
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap gap-2">
                        {targetGarment.colors.map((color) => {
                          const isColorSelected = selectedShade?.hex === color.hex;
                          return (
                            <button
                              key={color.hex}
                              onClick={() => setShade(color)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-medium transition-all ${
                                isColorSelected
                                  ? "border-[#7C3AED] bg-[#7C3AED]/10 text-white"
                                  : "border-white/5 hover:border-white/10 text-slate-400 hover:text-slate-200"
                              }`}
                            >
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-black/80 block"
                                style={{ backgroundColor: color.hex }}
                              />
                              <span>{color.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* FITTING & SIZE ADJUSTOR */}
              <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-white/5">
                <div className="flex flex-col gap-1.5">
                  <span className="font-bold text-slate-300">Fitting Type</span>
                  <select
                    value={fitting}
                    onChange={(e) => setFitting(e.target.value as FittingType)}
                    className="bg-[#0D0D0D] border border-white/5 text-slate-300 rounded-xl px-2.5 py-1.5 text-[11px] focus:ring-1 focus:ring-[#7C3AED] focus:outline-none"
                  >
                    <option value="slim">Slim Profile</option>
                    <option value="regular">Regular Classic</option>
                    <option value="loose">Oversized Relaxed</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300">Size Selected</span>
                    <button
                      type="button"
                      onClick={() => setShowSizeGuide(true)}
                      className="text-[10px] text-[#A855F7] hover:text-white hover:underline transition font-semibold"
                    >
                      Size Guide
                    </button>
                  </div>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value as ClothingSize)}
                    className="bg-[#0D0D0D] border border-white/5 text-slate-300 rounded-xl px-2.5 py-1.5 text-[11px] focus:ring-1 focus:ring-[#7C3AED] focus:outline-none"
                  >
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </select>
                </div>
              </div>

              {/* FABRIC MATERIAL SELECTOR */}
              <div className="flex flex-col gap-2 pt-3 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400">Fabric Material</span>
                  <span className="text-[10px] text-purple-400 font-medium font-mono">
                    {material === "cotton" ? "Soft Canvas Matte" : material === "silk" ? "Highly Lustrous Silk" : "Heavy Textured Wool"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["cotton", "silk", "wool"] as const).map((m) => {
                    const isSelected = material === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMaterial(m)}
                        className={`py-2 px-1 rounded-xl border text-[10px] font-bold uppercase tracking-wider text-center transition-all duration-200 ${
                          isSelected
                            ? "bg-[#7C3AED]/20 border-[#7C3AED] text-slate-100 shadow-[0_0_8px_rgba(124,58,237,0.15)]"
                            : "bg-[#0A0A0A] border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-200"
                        }`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ASSESSMENT REPORT GENERATOR BUTTON */}
            <div className="pt-2">
              <button
                onClick={runFitScanAnalysis}
                disabled={isAnalyzingLook}
                className="w-full py-3.5 bg-black hover:bg-[#7C3AED]/10 text-slate-200 hover:text-white border border-[#7C3AED]/30 font-bold text-xs tracking-widest uppercase rounded-[18px] flex items-center justify-center gap-2 transition duration-300 disabled:opacity-50"
              >
                {isAnalyzingLook ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#7C3AED]" />
                    Scanning Wardrobe Harmony...
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4 text-[#A855F7]" />
                    Assess Look Cohesion with AI
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* ================= COLUMN 3: CONCIERGE & RECOMMENDATION SYSTEM (Right - 3 cols) ================= */}
        <section className="lg:col-span-3 flex flex-col gap-6" id="concierge-recommendations">

          {/* AI STYLING REPORT CARD OUTPUT PANEL */}
          {fitReport && (
            <div className="glass-panel rounded-[32px] p-6 border-l-4 border-l-[#7C3AED] shadow-2xl flex flex-col gap-3.5 relative animate-fade-in border-y border-r border-white/5">
              <button
                onClick={() => setFitReport(null)}
                className="absolute top-4.5 right-4.5 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#A855F7]" />
                <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-widest font-sans">
                  Fashion Studio Report Card
                </h4>
              </div>

              {/* Style score badge circles */}
              <div className="flex items-center gap-4 bg-black/40 p-3.5 rounded-2xl border border-white/5">
                <div className="relative shrink-0 flex items-center justify-center w-14 h-14 rounded-full border-4 border-[#7C3AED]/30 text-center">
                  <span className="font-mono text-lg font-black text-white">
                    {fitReport.styleScore}
                  </span>
                  <div className="absolute inset-0 rounded-full border-2 border-[#7C3AED] animate-pulse" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-100 text-sm leading-tight font-sans">
                    {fitReport.overallVerdict}
                  </h5>
                  <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Cohesion Index Score</p>
                </div>
              </div>

              <div className="text-[11px] space-y-3 leading-relaxed font-sans">
                <div className="space-y-1">
                  <span className="text-[#A855F7] font-semibold block">Color Pairings Check:</span>
                  <p className="text-slate-300 bg-black/40 p-2.5 rounded-lg border border-white/5 font-light">
                    {fitReport.colorCohesiveness}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[#7C3AED] font-semibold block">Environmental Vibe Fit:</span>
                  <p className="text-slate-300 bg-black/40 p-2.5 rounded-lg border border-white/5 font-light">
                    {fitReport.lightingFitCheck}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[#A855F7] font-semibold block">Stylist Pro Prescription:</span>
                  <ul className="list-disc list-inside space-y-1.5 pl-1 text-slate-300 font-light">
                    {fitReport.stylePrescription.map((tip, idx) => (
                      <li key={idx} className="leading-relaxed">{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* AI PERSONAL stylist bot CHAT */}
          <div className="glass-panel rounded-[32px] p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#A855F7]" />
              <h4 className="font-semibold text-slate-200 text-xs tracking-wider uppercase font-sans">VYBES AI Stylist Chat</h4>
            </div>

            {/* Chat Messages Frame */}
            <div className="h-[210px] overflow-y-auto rounded-2xl bg-black/40 p-4 border border-white/5 space-y-4 scrollbar-thin text-xs text-slate-300 font-sans">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col max-w-[85%] ${
                    msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                  }`}
                >
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider font-mono mb-1 font-bold">
                    {msg.role === "user" ? "You" : "Stylist AI Client"}
                  </span>
                  <p
                    className={`rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-lg text-[11px] ${
                      msg.role === "user"
                        ? "bg-[#7C3AED] text-white rounded-tr-none text-right"
                        : "bg-[#0D0D0D] border border-white/5 text-slate-200 rounded-tl-none text-left"
                    }`}
                  >
                    {msg.text}
                  </p>
                </div>
              ))}
              {isChatSending && (
                <div className="flex flex-col items-start gap-1 max-w-[85%]">
                  <span className="text-[9px] text-slate-500 uppercase font-mono animate-pulse">
                    Typing styling guides...
                  </span>
                  <div className="bg-[#0D0D0D] rounded-2xl px-3.5 py-2.5 rounded-tl-none border border-white/5 text-slate-500 italic text-[11px]">
                    Analyzing silhouettes and shades...
                  </div>
                </div>
              )}
            </div>

            {/* Quick Stylist Prompts Suggestions */}
            <div className="flex flex-wrap gap-1.5 py-1">
              <button
                onClick={() => sendStylistMessage("Is this outfit combination fitting together well?")}
                className="text-[9px] bg-black/40 hover:bg-[#7C3AED]/20 text-slate-300 border border-white/5 hover:border-[#7C3AED]/30 px-2.5 py-1 rounded-xl transition font-medium tracking-wide uppercase"
              >
                Review This Look
              </button>
              <button
                onClick={() => sendStylistMessage("What specific shoes/footwear suits this selected apparel?")}
                className="text-[9px] bg-black/40 hover:bg-[#7C3AED]/20 text-slate-300 border border-white/5 hover:border-[#7C3AED]/30 px-2.5 py-1 rounded-xl transition font-medium tracking-wide uppercase"
              >
                Shoe Suggestions
              </button>
              <button
                onClick={() => sendStylistMessage("What gold/silver accessories match this colors pattern?")}
                className="text-[9px] bg-black/40 hover:bg-[#7C3AED]/20 text-slate-300 border border-white/5 hover:border-[#7C3AED]/30 px-2.5 py-1 rounded-xl transition font-medium tracking-wide uppercase"
              >
                Accessory Tips
              </button>
            </div>

            {/* Chat Send Area */}
            <div className="flex gap-1.5 bg-[#0D0D0D] rounded-xl p-1 border border-white/5">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendStylistMessage()}
                placeholder="Talk to stylist agent..."
                className="bg-transparent text-slate-100 flex-1 px-3 py-1.5 focus:outline-none text-[11px] font-sans"
              />
              <button
                onClick={() => sendStylistMessage()}
                disabled={isChatSending || !chatInput.trim()}
                className="p-2 bg-[#7C3AED] hover:bg-[#A855F7] rounded-lg text-white shadow-md transition disabled:opacity-50 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* OCCASION RECOMMENDATIONS WARDROBE DECK */}
          <div className="glass-panel rounded-[32px] p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <PartyPopper className="w-4 h-4 text-[#A855F7]" />
              <h4 className="font-semibold text-slate-200 text-xs tracking-wider uppercase font-sans">
                Occasion Styling Lab
              </h4>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div className="flex flex-col gap-1.5">
                <span className="font-bold text-slate-300">Occasion Scene</span>
                <select
                  value={recommendationQuery.occasion}
                  onChange={(e) => setRecommendationQuery({ ...recommendationQuery, occasion: e.target.value })}
                  className="bg-[#0D0D0D] border border-white/5 text-[#A855F7] px-3 py-2 rounded-xl focus:ring-1 focus:ring-[#7C3AED] focus:outline-none"
                >
                  <option value="Wedding Cocktail Party">Wedding Cocktail Party</option>
                  <option value="Fashion Music Festival">Fashion Music Festival</option>
                  <option value="Executive Boardroom Pitch">Executive Boardroom Pitch</option>
                  <option value="Brunch Cozy Gathering">Brunch Cozy Gathering</option>
                  <option value="Traditional Ethnic Gathering">Traditional Ethnic Gathering</option>
                  <option value="Urban Hip-Hop Concert">Urban Hip-Hop Concert</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="font-bold text-slate-300">Desired Styling Vibe</span>
                <select
                  value={recommendationQuery.stylePreference}
                  onChange={(e) => setRecommendationQuery({ ...recommendationQuery, stylePreference: e.target.value })}
                  className="bg-[#0D0D0D] border border-white/5 text-[#A855F7] px-3 py-2 rounded-xl focus:ring-1 focus:ring-[#7C3AED] focus:outline-none"
                >
                  <option value="Calm Minimalism & Chic">Calm Minimalism & Chic</option>
                  <option value="Streetwear Bold Expression">Streetwear Bold Expression</option>
                  <option value="High-Society Royals">High-Society Royals</option>
                  <option value="Cozy Bohemian Arts">Cozy Bohemian Arts</option>
                </select>
              </div>

              <button
                onClick={fetchOccasionRecommendations}
                disabled={isGeneratingRecommendations}
                className="w-full py-3.5 bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white font-extrabold text-[10px] uppercase tracking-widest rounded-xl shadow-lg hover:brightness-115 transition disabled:opacity-50"
              >
                {isGeneratingRecommendations ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Synthesizing Looks...
                  </span>
                ) : (
                  "Synthesize Best Style Matches"
                )}
              </button>
            </div>

            {/* Recommendations Output Deck */}
            {recommendations && (
              <div className="border border-white/5 bg-black/60 p-4.5 rounded-[24px] space-y-4 animate-fade-in text-xs max-h-[300px] overflow-y-auto scrollbar-thin font-sans">
                <div className="space-y-1">
                  <span className="text-[9px] text-[#A855F7] uppercase tracking-widest font-bold">Recommended Vibe Statement</span>
                  <p className="text-slate-100 font-bold italic block leading-relaxed">
                    &quot;{recommendations.themeStatement}&quot;
                  </p>
                </div>

                <div className="space-y-2 border-t border-white/5 pt-2.5">
                  <span className="text-[9px] text-[#7C3AED] uppercase tracking-widest block font-bold">Recommended Colors Palette</span>
                  <div className="flex flex-wrap gap-1.5">
                    {recommendations.colorPalette.map((colName, idx) => (
                      <span key={idx} className="bg-[#0D0D0D] border border-white/5 text-[10px] px-2.5 py-1 rounded-xl text-slate-300 font-mono flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: colName.includes("#") ? colName : "#3b82f6" }} />
                        {colName}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Curated matches detailed boxes */}
                <div className="space-y-3.5 border-t border-white/5 pt-3">
                  <span className="text-[9px] text-[#A855F7] uppercase tracking-widest block font-bold">Recommended Looks (Curated variations)</span>
                  {recommendations.styles.map((look, i) => (
                    <div
                      key={i}
                      className="bg-[#0D0D0D] p-3.5 rounded-2xl border border-white/5 space-y-2.5 relative group hover:border-[#7C3AED]/40 transition"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-100 text-[11px] uppercase tracking-wider font-sans">
                          {look.lookName}
                        </span>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
                      </div>
                      <div className="text-[10px] space-y-2 text-slate-300 font-light leading-relaxed">
                        <p><span className="text-slate-500 font-medium font-sans">Top Choice:</span> {look.topChoice}</p>
                        <p><span className="text-slate-500 font-medium font-sans">Bottom Choice:</span> {look.bottomChoice}</p>
                        <p><span className="text-slate-500 font-medium font-sans">Footwear:</span> {look.footwear}</p>
                        <p><span className="text-slate-500 font-medium font-sans">Key Accents:</span> {look.accessories.join(", ")}</p>
                        <p className="text-white bg-[#7C3AED]/15 p-2.5 rounded-xl text-[10px] italic border border-[#7C3AED]/30 mt-2">
                          <span className="font-bold uppercase tracking-widest text-[9px] block text-[#A855F7] non-italic font-sans mb-1">PRO LUXURY STYLE MATCH:</span>
                          {look.stylingTip}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* --- OUTFIT COMPARISON ENGINE SIDE-BY-SIDE PANELS COLD STORAGE --- */}
      <section className="bg-black/40 border-t border-white/5 px-6 py-12" id="outfit-comparison-engine">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Grid className="w-5 h-5 text-[#A855F7]" />
              <h4 className="font-semibold text-slate-200 tracking-wider text-[14px] uppercase font-sans">
                Looks Comparison Wardrobe Lounge
              </h4>
            </div>
            <span className="text-xs text-slate-500 font-medium tracking-wide font-sans">
              Toggle snapshots side-by-side to review fitting changes
            </span>
          </div>

          {comparedOutfits.length === 0 ? (
            <div className="border border-dashed border-white/5 rounded-3xl p-10 text-center text-slate-500 text-xs font-sans font-light">
              <Info className="w-7 h-7 text-[#7C3AED] mx-auto mb-3 animate-pulse" />
              <p className="font-semibold text-slate-300 mb-1">No Looks Compiled In Comparison Deck Yet</p>
              <p className="text-[10px] text-slate-600">
                Configure customized layers on high-fidelity model frames and click &quot;Snapshot Look&quot; to review.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {comparedOutfits.map((outfit) => {
                const isSelectedOnStage =
                  selectedModelId === outfit.modelId &&
                  currentTop?.id === outfit.topId &&
                  currentBottom?.id === outfit.bottomId;

                const matchingTopObj = GARMENTS.find((g) => g.id === outfit.topId);
                const matchingBottomObj = GARMENTS.find((g) => g.id === outfit.bottomId);

                return (
                  <div
                    key={outfit.id}
                    onClick={() => applyComparedOutfit(outfit)}
                    className={`p-4.5 bg-black/40 rounded-3xl border cursor-pointer transition-all hover:bg-black/80 text-xs relative group flex flex-col justify-between gap-3.5 shadow-2xl ${
                      isSelectedOnStage
                        ? "border-[#7C3AED] ring-4 ring-[#7C3AED]/10"
                        : "border-white/5 hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between pointer-events-none">
                      <span className="text-[9px] font-mono text-[#A855F7] uppercase font-bold tracking-widest">
                        ● COMBINED LOOK
                      </span>
                      <button
                        onClick={(e) => removeComparedOutfit(outfit.id, e)}
                        className="pointer-events-auto p-1.5 hover:bg-white/5 text-slate-500 hover:text-red-400 rounded-lg transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Vector outline display micro-canvas preview */}
                    <div className="aspect-[4/5] bg-[#0A0A0A] rounded-2xl relative overflow-hidden border border-white/5 flex items-center justify-center p-2">
                      <div className="absolute inset-x-0 bottom-0 top-1/2 bg-[#0F0F0F]/40 backdrop-blur-[1px]" />

                      {/* Display Top vector in miniature preview */}
                      {matchingTopObj && (
                        <div className="absolute top-4 w-20 h-20 opacity-90">
                          <GarmentSvg
                            type="top"
                            svgType={matchingTopObj.svgType}
                            colorHex={outfit.topColorHex}
                            fitting={outfit.fitting}
                            material={outfit.material || "cotton"}
                            modelId={outfit.modelId}
                          />
                        </div>
                      )}

                      {/* Display Bottom vector in miniature preview */}
                      {matchingBottomObj && (
                        <div className="absolute bottom-2 w-20 h-22 opacity-90">
                          <GarmentSvg
                            type="bottom"
                            svgType={matchingBottomObj.svgType}
                            colorHex={outfit.bottomColorHex}
                            fitting={outfit.fitting}
                            material={outfit.material || "cotton"}
                            modelId={outfit.modelId}
                          />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent pointer-events-none opacity-50" />
                    </div>

                    <div className="space-y-1 font-sans">
                      <div className="flex justify-between items-start gap-1">
                        <p className="font-semibold text-slate-200 truncate">{outfit.name}</p>
                        <span className="text-[9px] bg-black px-2 py-0.5 rounded-lg text-slate-400 border border-white/5 uppercase font-mono tracking-wider">
                          {outfit.fitting}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-light truncate">
                        Model Frame: {outfit.modelName} &nbsp;({outfit.size})
                      </p>
                      <p className="text-[9px] text-slate-500 text-right mt-1.5 font-mono">
                        Captured {outfit.savedAt}
                      </p>
                    </div>

                    {isSelectedOnStage && (
                      <div className="absolute -top-1.5 -right-1.5 bg-[#7C3AED] text-white rounded-full p-1 border-2 border-[#0F0F0F] shadow-lg">
                        <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* --- REVOLUTION VISION STATEMENT CARDS --- */}
      <footer className="border-t border-white/5 px-6 py-12 bg-black mt-auto text-center text-xs text-slate-500 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(124,58,237,0.03),transparent_60%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto space-y-8 relative z-10 font-sans">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-5 bg-[#0D0D0D] rounded-3xl border border-white/5">
              <h5 className="font-semibold text-slate-300 mb-2 uppercase tracking-wider text-[11px]">Our Vision</h5>
              <p className="text-slate-500 leading-relaxed font-light">
                VYBES aims to revolutionize the online fashion industry by bridging the gap between physical and digital shopping experiences through real-time vector layering.
              </p>
            </div>
            <div className="p-5 bg-[#0D0D0D] rounded-3xl border border-white/5">
              <h5 className="font-semibold text-slate-300 mb-2 uppercase tracking-wider text-[11px]">Confidence Fit</h5>
              <p className="text-slate-500 leading-relaxed font-light">
                By allowing customers to compare multiple styles, view lighting ambient condition changes, and analyze fits with Gemini Stylist Agent, we terminate guessing returns.
              </p>
            </div>
            <div className="p-5 bg-[#0D0D0D] rounded-3xl border border-white/5">
              <h5 className="font-semibold text-slate-300 mb-2 uppercase tracking-wider text-[11px]">B2B SaaS Future</h5>
              <p className="text-slate-500 leading-relaxed font-light">
                VYBES will integrate seamlessly with modern boutique storefronts, Spotify brands, and large scale e-retail players via high fidelity dynamic widget integrations.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-6 border-t border-white/5 font-sans">
            <p className="font-bold tracking-widest text-[10px] text-[#A855F7] uppercase">
              VYBES FASHION TECH INC.
            </p>
            <p className="font-light text-slate-600">&copy; 2026 VYBES. Try It Virtually. Wear It Confidently.</p>
          </div>
        </div>
      </footer>

      {/* --- INSTRUCTIONAL PREMIUM SIZE GUIDE DIALOG MODAL --- */}
      {showSizeGuide && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="bg-[#121212] border border-white/15 rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl relative block">
            {/* Top header glow strip */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#7C3AED] via-[#9F66FF] to-[#A855F7]" />
            
            {/* Close button icon */}
            <button
              onClick={() => setShowSizeGuide(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition border border-white/5"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-6 md:p-8 space-y-6">
              <div className="space-y-1.5">
                <span className="text-[10px] px-2.5 py-0.5 bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-[#A855F7] font-mono rounded-full uppercase tracking-wider">
                  VYBES Fit Advisory Systems
                </span>
                <h3 className="text-xl font-extrabold text-slate-100 tracking-wide">
                  High-Fidelity Size Guide Chart
                </h3>
                <p className="text-xs text-slate-400 font-light">
                  Compare your direct measurements below. The active digital try-on simulator automatically adjusts the vector garment scale factors on the models.
                </p>
              </div>

              {/* Measurement System Specs */}
              <div className="overflow-x-auto rounded-2xl border border-white/5 bg-black/40">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 font-mono text-[10px] uppercase text-slate-400">
                      <th className="py-3 px-4">Size Code</th>
                      <th className="py-3 px-4">Chest (inches/cm)</th>
                      <th className="py-3 px-4">Waist (inches/cm)</th>
                      <th className="py-3 px-4">Hips (inches/cm)</th>
                      <th className="py-3 px-4">Inseam (inches/cm)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300 font-sans">
                    {[
                      { sizeCode: "XS", chest: '32-34" (81-86cm)', waist: '26-28" (66-71cm)', hips: '32-34" (81-86cm)', inseam: '30" (76cm)' },
                      { sizeCode: "S", chest: '35-37" (89-94cm)', waist: '29-31" (74-79cm)', hips: '35-37" (89-94cm)', inseam: '31" (79cm)' },
                      { sizeCode: "M", chest: '38-40" (96-101cm)', waist: '32-34" (81-86cm)', hips: '38-40" (96-101cm)', inseam: '32" (81cm)' },
                      { sizeCode: "L", chest: '41-43" (104-109cm)', waist: '35-37" (89-94cm)', hips: '41-43" (104-109cm)', inseam: '32" (81cm)' },
                      { sizeCode: "XL", chest: '44-46" (112-117cm)', waist: '38-40" (96-101cm)', hips: '44-46" (112-117cm)', inseam: '33" (84cm)' },
                      { sizeCode: "XXL", chest: '47-49" (119-124cm)', waist: '41-43" (104-109cm)', hips: '47-49" (119-124cm)', inseam: '33" (84cm)' },
                    ].map((row) => {
                      const isCurrentRowSelected = size === row.sizeCode;
                      return (
                        <tr
                          key={row.sizeCode}
                          className={`transition ${
                            isCurrentRowSelected
                              ? "bg-[#7C3AED]/15 text-[#A855F7] font-bold"
                              : "hover:bg-white/5"
                          }`}
                        >
                          <td className="py-3 px-4 flex items-center gap-2">
                            <span>{row.sizeCode}</span>
                            {isCurrentRowSelected && (
                              <span className="text-[9px] px-1.5 py-0.5 bg-[#7C3AED]/20 border border-[#7C3AED]/40 text-[#A855F7] uppercase font-bold rounded-md">
                                Active Model
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">{row.chest}</td>
                          <td className="py-3 px-4">{row.waist}</td>
                          <td className="py-3 px-4">{row.hips}</td>
                          <td className="py-3 px-4">{row.inseam}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Advisory info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                <div className="bg-[#0D0D0D] border border-white/5 p-4 rounded-2xl">
                  <h4 className="font-bold text-slate-200 mb-1.5 uppercase tracking-wider text-[10px] text-[#A855F7]">
                    Fitting Profile Calibration
                  </h4>
                  <ul className="space-y-1 text-slate-400 font-light list-disc pl-4 leading-relaxed">
                    <li><strong>Slim Profile:</strong> Fits closer to the chest/waist coordinates with a smaller visual footprint.</li>
                    <li><strong>Regular Classic:</strong> Matches standard measurements precisely with optimized drape heights.</li>
                    <li><strong>Oversized Relaxed:</strong> Folds and width coordinates expand slightly for a loose, streetwear aesthetic.</li>
                  </ul>
                </div>

                <div className="bg-[#0D0D0D] border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-200 mb-1.5 uppercase tracking-wider text-[10px] text-[#A855F7]">
                      Size Advisory Tip
                    </h4>
                    <p className="text-slate-400 leading-relaxed font-light">
                      If your body measurements fluctuate between sizes, choose your preferred style vibe. Slim profile outlines give elegant posture focus, while regular classic fits match physical retail sizes accurately.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowSizeGuide(false)}
                    className="mt-3 py-2.5 w-full bg-[#7C3AED] hover:bg-[#A855F7] text-white font-bold text-[11px] rounded-xl transition uppercase tracking-wider"
                  >
                    Apply & return to Arena
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
