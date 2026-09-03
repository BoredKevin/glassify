import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge } from '@boredkevin/ui';
import { Download, Share2, Copy, Check, Sparkles, ArrowLeft, Smartphone, ShieldCheck } from 'lucide-react';
import { downloadBlob, shareBlob, copyTextToClipboard } from '../lib/shareOrDownload';
import type { ProcessedImageResult } from '../lib/processImage';

interface ResultPanelProps {
  result: ProcessedImageResult;
  onReset: () => void;
}

export const ResultPanel: React.FC<ResultPanelProps> = ({ result, onReset }) => {
  const [copiedBase64, setCopiedBase64] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const handleDownload = () => {
    downloadBlob(result.blob, `meta-glasses-${Date.now()}.jpg`);
  };

  const handleShare = async () => {
    setShareFeedback(null);
    const status = await shareBlob(result.blob, `meta-glasses-${Date.now()}.jpg`);
    if (status === 'shared') {
      setShareFeedback('Opened in your share sheet!');
    } else if (status === 'unsupported') {
      // Fallback directly to download if share sheet isn't supported on device
      handleDownload();
      setShareFeedback('Saved to your downloads!');
    }
  };

  const handleCopyBase64 = async () => {
    const success = await copyTextToClipboard(result.base64);
    if (success) {
      setCopiedBase64(true);
      setTimeout(() => setCopiedBase64(false), 2500);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-4">
      {/* Header Badge */}
      <div className="text-center space-y-1.5 px-2">
        <Badge variant="success" className="text-xs px-2.5 py-1">
          <Sparkles className="w-3 h-3 mr-1" />
          Ready for Instagram
        </Badge>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Your Photo is Ready!
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Download or share your photo now. When you upload it to your Instagram Story, Instagram will recognize it as Meta Glasses.
        </p>
      </div>

      {/* Main Download Card */}
      <Card liquidGlass cornerLines telemetry="STEP.03">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Step 3: Save Photo</CardTitle>
          <CardDescription className="text-xs">
            3024 × 4032 px • Ray-Ban Meta tags embedded
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Converted Image Thumbnail Preview */}
          <div className="relative rounded-xl overflow-hidden bg-black/50 border border-border/80 flex items-center justify-center max-h-56">
            <img
              src={result.dataUrl}
              alt="Converted photo ready for Instagram"
              className="max-h-56 w-auto object-contain rounded-lg"
            />
            <div className="absolute top-2.5 right-2.5">
              <Badge variant="default" className="text-[10px] bg-black/75 border border-white/20">
                3024 × 4032
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5">
            {/* Download Button */}
            <Button
              type="button"
              variant="cyber"
              onClick={handleDownload}
              className="w-full h-12 text-sm font-bold flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Photo</span>
            </Button>

            {/* Share / Save to Camera Roll Button */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleShare}
                className="h-10 text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5 text-primary" />
                <span>Share / Save</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={handleCopyBase64}
                className="h-10 text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 border border-border/50"
              >
                {copiedBase64 ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Base64</span>
                  </>
                )}
              </Button>
            </div>

            {shareFeedback && (
              <p className="text-xs text-center text-primary font-medium animate-fade-in">
                {shareFeedback}
              </p>
            )}
          </div>

          {/* Verification / Spec Summary Pills */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
            <div className="bg-card/40 border border-border/70 rounded-lg p-2.5">
              <div className="text-[10px] text-muted-foreground">Camera ID</div>
              <div className="text-xs font-semibold text-foreground truncate">
                Ray-Ban Meta 2
              </div>
            </div>
            <div className="bg-card/40 border border-border/70 rounded-lg p-2.5">
              <div className="text-[10px] text-muted-foreground">Format</div>
              <div className="text-xs font-semibold text-foreground">
                3024 × 4032 JPG
              </div>
            </div>
          </div>

          {/* ========================================================== */}
          {/* PLACEHOLDER: USER-EDITABLE INSTRUCTIONS SECTION          */}
          {/* You can replace this section, image, and text anytime!     */}
          {/* ========================================================== */}
          <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center text-primary">
                <Smartphone className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold text-foreground">
                How to post to Instagram Story
              </h3>
            </div>

            {/* Placeholder Illustration / Screenshot Box */}
            <div className="w-full h-32 rounded-lg border border-dashed border-primary/30 bg-black/40 flex flex-col items-center justify-center text-center p-3">
              <div className="text-2xl mb-1">📸</div>
              <span className="text-[11px] font-semibold text-foreground">
                [Placeholder: Guide Screenshot / Graphic]
              </span>
              <span className="text-[10px] text-muted-foreground mt-0.5">
                Replace this placeholder image in <code>src/components/ResultPanel.tsx</code>
              </span>
            </div>

            {/* Placeholder Steps Text */}
            <div className="text-[11px] text-muted-foreground space-y-1.5 leading-normal">
              <div className="flex items-start gap-1.5">
                <span className="font-bold text-primary">1.</span>
                <span>Open Instagram, swipe right to create a new Story.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="font-bold text-primary">2.</span>
                <span>Select this downloaded photo from your camera roll.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="font-bold text-primary">3.</span>
                <span>
                  Instagram will detect the Meta Glasses format and show the Spin View icon!
                </span>
              </div>
            </div>
          </div>
          {/* ========================================================== */}

          {/* Reset Button */}
          <div className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onReset}
              className="w-full h-9 text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Convert another photo</span>
            </Button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground pt-1 text-center">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Private & secure: processed 100% on your device</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
