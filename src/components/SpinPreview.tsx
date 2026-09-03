import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@boredkevin/ui';
import { MoveHorizontal, Play, Pause, ArrowLeft, CheckCircle2, Loader2, RotateCcw } from 'lucide-react';
import type { EditConfig } from '../lib/processImage';

interface SpinPreviewProps {
  imageSrc: string;
  fileName: string;
  editConfig?: EditConfig;
  onConvert: () => void;
  onBack: () => void;
  isConverting: boolean;
}

export const SpinPreview: React.FC<SpinPreviewProps> = ({
  imageSrc,
  fileName,
  editConfig,
  onConvert,
  onBack,
  isConverting
}) => {
  // Free 360-degree rotation angle
  const [tiltAngle, setTiltAngle] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);

  const dragStartXRef = useRef<number>(0);
  const startAngleRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const lastAngleRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);

  const inertiaAnimRef = useRef<number | null>(null);
  const autoPlayAnimRef = useRef<number | null>(null);

  // Stop any ongoing inertia animation
  const stopInertia = () => {
    if (inertiaAnimRef.current) {
      cancelAnimationFrame(inertiaAnimRef.current);
      inertiaAnimRef.current = null;
    }
  };

  // Pointer drag controls (full 360 continuous rotation)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isAutoPlaying) setIsAutoPlaying(false);
    stopInertia();

    setIsDragging(true);
    dragStartXRef.current = e.clientX;
    startAngleRef.current = tiltAngle;
    lastTimeRef.current = performance.now();
    lastAngleRef.current = tiltAngle;
    velocityRef.current = 0;

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const now = performance.now();
    const dt = Math.max(1, now - lastTimeRef.current);

    const deltaX = e.clientX - dragStartXRef.current;
    // Map drag pixels to degrees (~0.65 degrees per pixel)
    const newAngle = startAngleRef.current + deltaX * 0.65;

    velocityRef.current = (newAngle - lastAngleRef.current) / dt;
    lastTimeRef.current = now;
    lastAngleRef.current = newAngle;

    setTiltAngle(newAngle);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    // Launch inertia coasting loop if flick velocity is noticeable
    let currentVel = velocityRef.current * 16; // speed per frame (~16ms)
    if (Math.abs(currentVel) > 0.4) {
      const stepInertia = () => {
        currentVel *= 0.93; // smooth decay
        if (Math.abs(currentVel) < 0.08) {
          stopInertia();
          return;
        }
        setTiltAngle((prev) => prev + currentVel);
        inertiaAnimRef.current = requestAnimationFrame(stepInertia);
      };
      inertiaAnimRef.current = requestAnimationFrame(stepInertia);
    }
  };

  // Auto-play animation toggle
  const toggleAutoPlay = useCallback(() => {
    stopInertia();
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
    const initialAngle = tiltAngle;

    const animate = (time: number) => {
      const elapsed = (time - startTime) / 1000;
      // Oscillate smoothly across +/- 120 degrees
      const angle = initialAngle + Math.sin(elapsed * 1.6) * 120;
      setTiltAngle(angle);
      autoPlayAnimRef.current = requestAnimationFrame(animate);
    };

    autoPlayAnimRef.current = requestAnimationFrame(animate);

    return () => {
      if (autoPlayAnimRef.current) {
        cancelAnimationFrame(autoPlayAnimRef.current);
      }
    };
  }, [isAutoPlaying, tiltAngle]);

  // Clean up animation frames
  useEffect(() => {
    return () => {
      stopInertia();
      if (autoPlayAnimRef.current) cancelAnimationFrame(autoPlayAnimRef.current);
    };
  }, []);

  // Normalized display angle (-180 to 180)
  const normalizedDeg = Math.round(((tiltAngle % 360) + 360) % 360);
  const displayDeg = normalizedDeg > 180 ? normalizedDeg - 360 : normalizedDeg;

  // User edit configuration — applied as-is from the edit step, no override
  const userRotation = (editConfig?.freeRotation || 0) + (editConfig?.cw90Count || 0) * 90;
  const flipH = editConfig?.flipH || false;
  const fitMode = editConfig?.fitMode || 'fill';
  const userZoom = editConfig?.zoom || 1;
  // panX/panY stored as % offset by ImageEditor (0.25 * dragPx), re-used here as translate %
  const userPanX = editConfig?.panX || 0;
  const userPanY = editConfig?.panY || 0;

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-4">
      {/* Title */}
      <div className="text-center space-y-1.5 px-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          See How It Spins
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Drag left and right to tilt the phone 360°. The photo stays level with the horizon, exactly like Instagram Spin View!
        </p>
      </div>

      {/* Main Preview Card */}
      <Card liquidGlass cornerLines telemetry="STEP.03">
        <CardHeader className="pb-2">
          {/* Header layout: flex-1 min-w-0 prevents button overflow on long filenames */}
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold truncate">
                Step 3: Spin Preview
              </CardTitle>
              <CardDescription className="text-xs truncate">
                {fileName}
              </CardDescription>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
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
                  stopInertia();
                  setIsAutoPlaying(false);
                  setTiltAngle(0);
                }}
                disabled={tiltAngle === 0}
                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground border border-border/40"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
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
            className={`relative w-full h-[380px] sm:h-[420px] rounded-2xl bg-black/70 border border-border/80 flex items-center justify-center overflow-hidden touch-none select-none cursor-grab active:cursor-grabbing ${
              isDragging ? 'border-primary/60 shadow-[0_0_24px_rgba(56,189,248,0.25)]' : ''
            }`}
          >
            {/* Horizon reference grid */}
            <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Level horizon indicator behind phone */}
            <div className="absolute left-3 right-3 h-[1px] bg-primary/20 pointer-events-none" />

            {/* ======================================================== */}
            {/* ACCURATE IPHONE 15 PRO MOCKUP (433 x 882 PROPORTIONS)   */}
            {/* ======================================================== */}
            <div
              className="relative w-[190px] h-[386px] transition-transform will-change-transform flex items-center justify-center"
              style={{
                transform: `rotate(${tiltAngle}deg)`,
                transition: isDragging ? 'none' : 'transform 0.08s ease-out'
              }}
            >
              {/* LAYER A: COUNTER-ROTATING SCREEN IMAGE LAYER (Underneath SVG frame) */}
              <div
                className="absolute overflow-hidden bg-black flex items-center justify-center"
                style={{
                  top: '2.18%',
                  left: '4.91%',
                  width: '89.95%',
                  height: '95.64%',
                  borderRadius: '24px',
                  zIndex: 5
                }}
              >
                {/* Fit Mode: Blurred Ambient Background */}
                {fitMode === 'fit' && (
                  <img
                    src={imageSrc}
                    alt="Background Blur"
                    className="absolute inset-0 w-full h-full object-cover scale-150 filter blur-xl opacity-60 pointer-events-none"
                  />
                )}

                {/*
                  Counter-rotating image container.
                  Size: 500×500px — a fixed square large enough that at any rotation angle,
                  all four corners of the phone screen (171×369px, farthest corner ≈ 203px from
                  center) are always covered. No angle-dependent scale is needed or wanted:
                  the Edit step already framed the image correctly.
                  userZoom and userPanX/Y are applied exactly as set in the Editor.
                */}
                <div
                  className="absolute flex items-center justify-center pointer-events-none will-change-transform"
                  style={{
                    width: '420px',
                    height: '560px',
                    transform: `rotate(${-tiltAngle}deg) scale(${userZoom}) translate(${userPanX}%, ${userPanY}%)`
                  }}
                >
                  <img
                    src={imageSrc}
                    alt="Spin View Live"
                    className="w-full h-full pointer-events-none"
                    style={{
                      objectFit: fitMode === 'stretch' ? 'fill' : fitMode === 'fit' ? 'contain' : 'cover',
                      transform: `scaleX(${flipH ? -1 : 1}) rotate(${userRotation}deg)`
                    }}
                  />
                </div>

                {/* Instagram Story Top Header Overlay */}
                <div className="absolute top-7 left-3 right-3 z-20 flex items-center justify-between text-[10px] text-white drop-shadow-md pointer-events-none">
                  <div className="flex items-center gap-1.5 font-medium">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 p-[1px]">
                      <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[7px]">
                        🕶️
                      </div>
                    </div>
                    <span>Your Story</span>
                  </div>
                </div>

                {/* Instagram Story Bottom Reply Mockup */}
                <div className="absolute bottom-3 left-3 right-3 z-20 pointer-events-none">
                  <div className="w-full h-6 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center px-3 text-[9px] text-white/80">
                    Send message...
                  </div>
                </div>
              </div>

              {/* LAYER B: ACCURATE IPHONE 15 PRO SVG FRAME (Positioned above image with screen cutout) */}
              <svg
                viewBox="0 0 433 882"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-2xl z-10"
              >
                <defs>
                  {/* Screen Cutout Mask: white preserves outer chassis, black cuts out transparent screen */}
                  <mask id="iphone-screen-cutout">
                    <rect x="-20" y="-20" width="473" height="922" fill="white" />
                    <rect x="21.25" y="19.25" width="389.5" height="843.5" rx="55.75" fill="black" />
                  </mask>
                </defs>

                {/* Chassis body masked to cut out the screen area */}
                <g mask="url(#iphone-screen-cutout)">
                  {/* Outer Titanium Chassis */}
                  <path
                    d="M2 73C2 32.6832 34.6832 0 75 0H357C397.317 0 430 32.6832 430 73V809C430 849.317 397.317 882 357 882H75C34.6832 882 2 849.317 2 809V73Z"
                    className="fill-[#262626] stroke-[#525252] stroke-[1.5]"
                  />
                  {/* Inner Screen Bezel Border */}
                  <path
                    d="M6 74C6 35.3401 37.3401 4 76 4H356C394.66 4 426 35.3401 426 74V808C426 846.66 394.66 878 356 878H76C37.3401 878 6 846.66 6 808V74Z"
                    className="stroke-[#171717] stroke-[3]"
                  />
                </g>

                {/* External Side Buttons (not masked) */}
                <path
                  d="M0 171C0 170.448 0.447715 170 1 170H3V204H1C0.447715 204 0 203.552 0 203V171Z"
                  className="fill-[#525252]"
                />
                <path
                  d="M1 234C1 233.448 1.44772 233 2 233H3.5V300H2C1.44772 300 1 299.552 1 299V234Z"
                  className="fill-[#525252]"
                />
                <path
                  d="M1 319C1 318.448 1.44772 318 2 318H3.5V385H2C1.44772 385 1 384.552 1 384V319Z"
                  className="fill-[#525252]"
                />
                <path
                  d="M430 279H432C432.552 279 433 279.448 433 280V384C433 384.552 432.552 385 432 385H430V279Z"
                  className="fill-[#525252]"
                />

                {/* Speaker Earpiece Slit */}
                <path
                  opacity="0.6"
                  d="M174 5H258V5.5C258 6.60457 257.105 7.5 256 7.5H176C174.895 7.5 174 6.60457 174 5.5V5Z"
                  className="fill-[#737373]"
                />

                {/* Screen Outline / Subtle Glass Reflection Ring */}
                <rect
                  x="21.25"
                  y="19.25"
                  width="389.5"
                  height="843.5"
                  rx="55.75"
                  fill="none"
                  className="stroke-white/10 stroke-[1.5]"
                />

                {/* Dynamic Island Pill Cutout (above screen) */}
                <path
                  d="M154 48.5C154 38.2827 162.283 30 172.5 30H259.5C269.717 30 278 38.2827 278 48.5C278 58.7173 269.717 67 259.5 67H172.5C162.283 67 154 58.7173 154 48.5Z"
                  className="fill-black"
                />
                {/* Front Camera Lens Accent */}
                <circle cx="258" cy="48.5" r="7.5" className="fill-[#1e293b]" />
                <circle cx="258" cy="48.5" r="3.5" className="fill-[#0f172a]" />
              </svg>
            </div>

            {/* Live Angle Indicator Overlay */}
            <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 pointer-events-none">
              <span className="bg-black/75 backdrop-blur-md text-foreground font-mono text-[11px] px-2 py-0.5 rounded-full border border-white/15">
                Tilt: {displayDeg > 0 ? `+${displayDeg}°` : `${displayDeg}°`}
              </span>
            </div>

            {/* Drag hint overlay at center top */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center gap-1 text-[11px] font-medium bg-black/70 backdrop-blur-md text-foreground px-2.5 py-1 rounded-full border border-white/15">
              <MoveHorizontal className="w-3.5 h-3.5 text-primary animate-pulse" />
              <span>Drag to tilt 360°</span>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="grid grid-cols-4 gap-1.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                stopInertia();
                setIsAutoPlaying(false);
                setTiltAngle(-90);
              }}
              className="h-8 text-xs px-1"
            >
              -90°
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                stopInertia();
                setIsAutoPlaying(false);
                setTiltAngle(0);
              }}
              className="h-8 text-xs px-1"
            >
              Center (0°)
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                stopInertia();
                setIsAutoPlaying(false);
                setTiltAngle(90);
              }}
              className="h-8 text-xs px-1"
            >
              +90°
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                stopInertia();
                setIsAutoPlaying(false);
                setTiltAngle(180);
              }}
              className="h-8 text-xs px-1"
            >
              180°
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
              <span>Back to Edit Photo</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
