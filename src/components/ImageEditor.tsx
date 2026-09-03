import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@boredkevin/ui';
import { RotateCw, FlipHorizontal, ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import type { EditConfig } from '../lib/processImage';

interface ImageEditorProps {
  imageSrc: string;
  fileName: string;
  initialConfig?: EditConfig;
  onContinue: (config: EditConfig) => void;
  onBack: () => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({
  imageSrc,
  fileName,
  initialConfig,
  onContinue,
  onBack
}) => {
  const [fitMode, setFitMode] = useState<'fill' | 'fit' | 'stretch'>(
    initialConfig?.fitMode || 'fill'
  );
  const [zoom, setZoom] = useState<number>(initialConfig?.zoom || 1);
  const [panX, setPanX] = useState<number>(initialConfig?.panX || 0);
  const [panY, setPanY] = useState<number>(initialConfig?.panY || 0);
  const [cw90Count, setCw90Count] = useState<number>(initialConfig?.cw90Count || 0);
  const [freeRotation, setFreeRotation] = useState<number>(initialConfig?.freeRotation || 0);
  const [flipH, setFlipH] = useState<boolean>(initialConfig?.flipH || false);

  const [isPanning, setIsPanning] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; startPanX: number; startPanY: number }>({
    x: 0,
    y: 0,
    startPanX: 0,
    startPanY: 0
  });

  // Ruler scrubber drag tracking
  const rulerRef = useRef<HTMLDivElement>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const scrubberStartRef = useRef<{ x: number; startRot: number }>({ x: 0, startRot: 0 });

  // Reset function
  const handleReset = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
    setCw90Count(0);
    setFreeRotation(0);
    setFlipH(false);
  };

  // Flip 90° CW
  const handleRotate90CW = () => {
    setCw90Count((prev) => (prev + 1) % 4);
  };

  // Flip Horizontal
  const handleFlipHorizontal = () => {
    setFlipH((prev) => !prev);
  };

  // Image pan handling
  const handlePanStart = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsPanning(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startPanX: panX,
      startPanY: panY
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePanMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPanning) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    // Map to percentage offsets (~0.25% per pixel)
    const newPanX = dragStartRef.current.startPanX + deltaX * 0.25;
    const newPanY = dragStartRef.current.startPanY + deltaY * 0.25;
    setPanX(newPanX);
    setPanY(newPanY);
  };

  const handlePanEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPanning) return;
    setIsPanning(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    // In Fill mode, clamp pan so image doesn't expose empty edges
    if (fitMode === 'fill') {
      const maxPan = Math.max(0, (zoom - 1) * 35);
      setPanX((prev) => Math.max(-maxPan, Math.min(maxPan, prev)));
      setPanY((prev) => Math.max(-maxPan, Math.min(maxPan, prev)));
    }
  };

  // Zoom via scroll wheel
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY * -0.002;
    setZoom((prev) => Math.max(1, Math.min(5, Number((prev + delta).toFixed(2)))));
  };

  // Ruler scrubber handling (-180° to +180°)
  const handleRulerPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsScrubbing(true);
    scrubberStartRef.current = {
      x: e.clientX,
      startRot: freeRotation
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleRulerPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isScrubbing) return;
    const deltaX = e.clientX - scrubberStartRef.current.x;
    // ~0.35 degrees per px drag
    let newRot = scrubberStartRef.current.startRot + deltaX * 0.4;
    // Clamp to -180 to 180
    newRot = Math.max(-180, Math.min(180, newRot));
    // Snap to 0° within +/- 2°
    if (Math.abs(newRot) < 2) {
      newRot = 0;
    }
    setFreeRotation(Number(newRot.toFixed(1)));
  };

  const handleRulerPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isScrubbing) return;
    setIsScrubbing(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleContinue = () => {
    onContinue({
      freeRotation,
      cw90Count,
      flipH,
      panX,
      panY,
      zoom,
      fitMode
    });
  };

  const totalRotation = freeRotation + cw90Count * 90;

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-4">
      {/* Title */}
      <div className="text-center space-y-1 px-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Frame Your Photo
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Adjust crop, framing, and rotation before creating your Instagram story.
        </p>
      </div>

      <Card liquidGlass cornerLines telemetry="STEP.02">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold truncate">
                Step 2: Edit Photo
              </CardTitle>
              <CardDescription className="text-xs truncate">
                {fileName}
              </CardDescription>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Button
                type="button"
                variant="ghost"
                onClick={handleReset}
                className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 border border-border/40"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 3-Way Mode Pill: Fill | Fit | Stretch */}
          <div className="flex p-1 bg-black/50 rounded-xl border border-border/80">
            <button
              type="button"
              onClick={() => setFitMode('fill')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                fitMode === 'fill'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Fill (Crop)
            </button>
            <button
              type="button"
              onClick={() => setFitMode('fit')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                fitMode === 'fit'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Fit (Blur BG)
            </button>
            <button
              type="button"
              onClick={() => setFitMode('stretch')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                fitMode === 'stretch'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Stretch
            </button>
          </div>

          {/* 3:4 Interactive Crop/Frame Stage */}
          <div
            onPointerDown={handlePanStart}
            onPointerMove={handlePanMove}
            onPointerUp={handlePanEnd}
            onPointerCancel={handlePanEnd}
            onWheel={handleWheel}
            className={`relative w-full h-[360px] sm:h-[390px] rounded-2xl bg-black border border-border/80 overflow-hidden flex items-center justify-center touch-none select-none cursor-grab active:cursor-grabbing ${
              isPanning ? 'border-primary/60' : ''
            }`}
          >
            {/* Fit mode: Blurred background copy of image */}
            {fitMode === 'fit' && (
              <img
                src={imageSrc}
                alt="Blurred background"
                className="absolute inset-0 w-full h-full object-cover scale-125 filter blur-xl opacity-60 pointer-events-none"
              />
            )}

            {/* 3:4 Guide Frame Overlay */}
            <div className="absolute inset-2 sm:inset-4 border border-white/20 rounded-xl pointer-events-none z-20">
              <div className="absolute top-2 left-2 text-[10px] text-white/60 font-mono bg-black/50 px-1.5 py-0.5 rounded">
                3:4 Frame
              </div>
              <div className="absolute top-2 right-2 text-[10px] text-white/60 font-mono bg-black/50 px-1.5 py-0.5 rounded">
                {zoom.toFixed(1)}× Zoom
              </div>
            </div>

            {/* Main Manipulated Image */}
            <div
              className="relative w-full h-full flex items-center justify-center overflow-hidden pointer-events-none"
              style={{
                transform: `translate(${panX}%, ${panY}%) scale(${zoom})`
              }}
            >
              <img
                src={imageSrc}
                alt="Edited"
                className="max-w-none transition-transform will-change-transform pointer-events-none"
                style={{
                  width: fitMode === 'stretch' ? '100%' : fitMode === 'fill' ? '100%' : 'auto',
                  height: fitMode === 'stretch' ? '100%' : fitMode === 'fill' ? '100%' : 'auto',
                  maxHeight: fitMode === 'fit' ? '88%' : undefined,
                  maxWidth: fitMode === 'fit' ? '88%' : undefined,
                  objectFit: fitMode === 'stretch' ? 'fill' : fitMode === 'fill' ? 'cover' : 'contain',
                  transform: `scaleX(${flipH ? -1 : 1}) rotate(${totalRotation}deg)`
                }}
              />
            </div>

            {/* Pan & Zoom Hint */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none bg-black/75 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] text-white/70 border border-white/10">
              Drag to pan • Scroll to zoom
            </div>
          </div>

          {/* Rotation Ruler Scrubber (-180° to +180°) */}
          <div className="space-y-1.5 bg-black/40 p-3 rounded-xl border border-border/70">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">Fine Rotation</span>
              <span className="font-mono text-white font-semibold bg-white/10 px-2 py-0.5 rounded">
                {freeRotation > 0 ? `+${freeRotation.toFixed(1)}°` : `${freeRotation.toFixed(1)}°`}
              </span>
            </div>

            {/* Ruler Track */}
            <div
              ref={rulerRef}
              onPointerDown={handleRulerPointerDown}
              onPointerMove={handleRulerPointerMove}
              onPointerUp={handleRulerPointerUp}
              onPointerCancel={handleRulerPointerUp}
              className="relative h-9 rounded-lg bg-zinc-950 border border-border/60 overflow-hidden flex items-center justify-center cursor-ew-resize select-none touch-none"
            >
              {/* Central Needle indicator */}
              <div className="absolute z-20 w-[2px] h-6 bg-primary shadow-[0_0_8px_rgba(56,189,248,0.8)] pointer-events-none" />

              {/* Ruler Ticks sliding based on freeRotation */}
              <div
                className="flex items-center gap-[6px] transition-transform will-change-transform"
                style={{
                  transform: `translateX(${-freeRotation * 4}px)`
                }}
              >
                {Array.from({ length: 73 }).map((_, i) => {
                  const deg = (i - 36) * 5; // -180 to +180 every 5 deg
                  const isMajor = deg % 45 === 0;
                  const isCenter = deg === 0;
                  return (
                    <div key={deg} className="flex flex-col items-center w-[1px]">
                      <div
                        className={`w-[1px] transition-colors ${
                          isCenter
                            ? 'h-5 bg-primary'
                            : isMajor
                            ? 'h-4 bg-white/70'
                            : 'h-2 bg-white/25'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Flip Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleRotate90CW}
              className="h-10 text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5 text-primary" />
              <span>Rotate 90° CW</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleFlipHorizontal}
              className="h-10 text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <FlipHorizontal className="w-3.5 h-3.5 text-primary" />
              <span>Flip Horizontal</span>
            </Button>
          </div>

          {/* Navigation CTA */}
          <div className="pt-2 flex flex-col gap-2">
            <Button
              type="button"
              variant="cyber"
              onClick={handleContinue}
              className="w-full h-12 text-sm font-bold flex items-center justify-center gap-2"
            >
              <span>Continue to Spin Preview</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              className="w-full h-9 text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Pick a different photo</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
