import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge } from '@boredkevin/ui';
import { RotateCw, MoveHorizontal, Play, Pause, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';

interface SpinPreviewProps {
  imageSrc: string;
  fileName: string;
  onConvert: () => void;
  onBack: () => void;
  isConverting: boolean;
}

export const SpinPreview: React.FC<SpinPreviewProps> = ({
  imageSrc,
  fileName,
  onConvert,
  onBack,
  isConverting
}) => {
  // Tilt angle in degrees (-40 to +40)
  const [tiltAngle, setTiltAngle] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);

  const dragStartXRef = useRef<number>(0);
  const startAngleRef = useRef<number>(0);
  const autoPlayAnimRef = useRef<number | null>(null);

  // Handle pointer drag (works for mouse and touch)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isAutoPlaying) setIsAutoPlaying(false);
    setIsDragging(true);
    dragStartXRef.current = e.clientX;
    startAngleRef.current = tiltAngle;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartXRef.current;
    // Map pixels to degrees: ~3.5px per degree
    const newAngle = Math.max(-42, Math.min(42, startAngleRef.current + deltaX * 0.35));
    setTiltAngle(newAngle);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture already lost
    }
  };

  // Auto-play tilt animation toggle
  const toggleAutoPlay = useCallback(() => {
    setIsAutoPlaying((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) {
      if (autoPlayAnimRef.current) {
        cancelAnimationFrame(autoPlayAnimRef.current);
        autoPlayAnimRef.current = null;
      }
      return;
    }

    const startTime = performance.now();
    const animate = (time: number) => {
      const elapsed = (time - startTime) / 1000;
      // Oscillate smoothly between -32 and +32 degrees
      const angle = Math.sin(elapsed * 1.8) * 32;
      setTiltAngle(angle);
      autoPlayAnimRef.current = requestAnimationFrame(animate);
    };

    autoPlayAnimRef.current = requestAnimationFrame(animate);

    return () => {
      if (autoPlayAnimRef.current) {
        cancelAnimationFrame(autoPlayAnimRef.current);
      }
    };
  }, [isAutoPlaying]);

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-4">
      {/* Title & helper text */}
      <div className="text-center space-y-1.5 px-2">
        <Badge variant="outline" className="text-xs px-2.5 py-1 border-primary/40 text-primary mb-1">
          <RotateCw className="w-3 h-3 mr-1" />
          Interactive Preview
        </Badge>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          See How It Spins
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Drag left and right on the phone. When viewers tilt their phone on Instagram, the photo stays level while the screen turns!
        </p>
      </div>

      {/* Main Preview Card */}
      <Card liquidGlass cornerLines telemetry="STEP.02">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Step 2: Spin Preview</CardTitle>
              <CardDescription className="text-xs truncate max-w-[200px]">
                {fileName}
              </CardDescription>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                onClick={toggleAutoPlay}
                className="h-8 px-2.5 text-xs flex items-center gap-1 border-border"
              >
                {isAutoPlaying ? (
                  <>
                    <Pause className="w-3 h-3 text-primary" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 text-primary" />
                    <span>Auto-Spin</span>
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsAutoPlaying(false);
                  setTiltAngle(0);
                }}
                disabled={tiltAngle === 0}
                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Interactive Drag Stage */}
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`relative w-full h-[360px] sm:h-[400px] rounded-2xl bg-black/60 border border-border/80 flex items-center justify-center overflow-hidden touch-none select-none cursor-grab active:cursor-grabbing ${isDragging ? 'border-primary/60 shadow-[0_0_20px_rgba(56,189,248,0.2)]' : ''
              }`}
          >
            {/* Background horizon reference grid */}
            <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Simulated Horizon line (stays perfectly level behind phone) */}
            <div className="absolute left-4 right-4 h-[1px] bg-primary/20 pointer-events-none" />

            {/* Tilted Phone Container */}
            <div
              className="relative w-[184px] h-[330px] rounded-[38px] p-[6px] bg-gradient-to-b from-zinc-700 via-zinc-900 to-black shadow-2xl border border-white/20 transition-transform will-change-transform"
              style={{
                transform: `rotate(${tiltAngle}deg)`,
                transition: isDragging ? 'none' : 'transform 0.15s ease-out'
              }}
            >
              {/* Phone Inner Bezel */}
              <div className="relative w-full h-full rounded-[32px] overflow-hidden bg-black flex items-center justify-center border border-white/10">
                {/* Simulated Dynamic Island / Speaker Pill */}
                <div className="absolute top-2.5 z-30 w-16 h-3.5 bg-black rounded-full border border-white/10 flex items-center justify-end px-1.5 shadow-md">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" />
                </div>

                {/* Instagram Story Top UI Mockup */}
                <div className="absolute top-8 left-3 right-3 z-20 flex items-center justify-between text-[10px] text-white/90 drop-shadow-md pointer-events-none">
                  <div className="flex items-center gap-1.5 font-medium">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 p-[1px]">
                      <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[7px]">
                        🕶️
                      </div>
                    </div>
                    <span>Your Story</span>
                  </div>
                </div>

                {/* Image Inside: Counter-rotated to stay level with real world */}
                <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
                  <img
                    src={imageSrc}
                    alt="Spin View Preview"
                    className="absolute w-full h-full object-cover pointer-events-none will-change-transform"
                    style={{
                      // Zoom in 135% so edges are never exposed at extreme rotation angles
                      transform: `scale(1.35) rotate(${-tiltAngle}deg)`,
                      transition: isDragging ? 'none' : 'transform 0.15s ease-out'
                    }}
                  />
                </div>

                {/* Bottom Instagram Story Reply pill mockup */}
                <div className="absolute bottom-3 left-3 right-3 z-20 pointer-events-none">
                  <div className="w-full h-6 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center px-3 text-[9px] text-white/75">
                    Send message...
                  </div>
                </div>
              </div>
            </div>

            {/* Live Angle Indicator Overlay */}
            <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 pointer-events-none">
              <span className="bg-black/70 backdrop-blur-md text-foreground/80 font-mono text-[11px] px-2 py-0.5 rounded-full border border-white/10">
                Phone tilt: {tiltAngle.toFixed(0)}°
              </span>
            </div>

            {/* Drag hint overlay at center top */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center gap-1 text-[11px] font-medium bg-black/60 backdrop-blur-md text-foreground/80 px-2.5 py-1 rounded-full border border-white/10">
              <MoveHorizontal className="w-3.5 h-3.5 text-primary animate-pulse" />
              <span>Drag to tilt phone</span>
            </div>
          </div>

          {/* Quick Preset Buttons for easy mobile interaction */}
          <div className="flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAutoPlaying(false);
                setTiltAngle(-30);
              }}
              className="h-7 text-xs px-2"
            >
              Tilt Left (-30°)
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAutoPlaying(false);
                setTiltAngle(0);
              }}
              className="h-7 text-xs px-2"
            >
              Center (0°)
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAutoPlaying(false);
                setTiltAngle(30);
              }}
              className="h-7 text-xs px-2"
            >
              Tilt Right (+30°)
            </Button>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-col gap-2">
            <Button
              type="button"
              variant="cyber"
              disabled={isConverting}
              onClick={onConvert}
              className="w-full h-12 text-sm font-bold flex items-center justify-center gap-2"
            >
              {isConverting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" />
                  <span>Stamping Meta Glasses Tags (3024×4032)...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Convert & Finish →</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              disabled={isConverting}
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
