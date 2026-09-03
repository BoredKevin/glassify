import { useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@boredkevin/ui';
import { Upload, Camera, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface DropZoneProps {
  onFileSelected: (file: File) => void;
  selectedFile: File | null;
  onContinue: () => void;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFileSelected,
  selectedFile,
  onContinue
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setErrorMessage(null);
    const isJpg = file.type === 'image/jpeg' || /\.jpe?g$/i.test(file.name);

    if (!isJpg) {
      setErrorMessage('Please pick a JPG photo. If your photo is PNG or HEIC, save it as JPG first.');
      return;
    }

    onFileSelected(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-4">
      {/* Intro Header */}
      <div className="text-center space-y-1.5 px-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Make Any Photo Spin
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Stamp your photo with metadata so viewers can tilt their phone to explore it on Instagram.
        </p>
      </div>

      {/* Main Card */}
      <Card liquidGlass cornerLines telemetry="STEP.01">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Step 1: Choose Photo</CardTitle>
          <CardDescription>
            Select a photo from your gallery or take a new one.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Mobile Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => cameraInputRef.current?.click()}
              className="h-14 flex flex-col items-center justify-center gap-1 text-xs"
            >
              <Camera className="w-4 h-4 text-primary" />
              <span>Take Photo</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="h-14 flex flex-col items-center justify-center gap-1 text-xs"
            >
              <ImageIcon className="w-4 h-4 text-primary" />
              <span>Photo Library</span>
            </Button>
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`group relative rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 ${isDragging
              ? 'border-primary bg-primary/10 scale-[0.99]'
              : selectedFile
                ? 'border-primary/50 bg-card/60 hover:border-primary'
                : 'border-border bg-card/30 hover:border-primary/50 hover:bg-card/50'
              }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,.jpg,.jpeg"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/jpeg,.jpg,.jpeg"
              capture="environment"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
              className="hidden"
            />

            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Upload className="w-5 h-5" />
              </div>

              {selectedFile ? (
                <div>
                  <p className="font-semibold text-sm text-foreground">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatFileSize(selectedFile.size)} • Click to change photo
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-semibold text-sm text-foreground">
                    Tap to select or drag photo here
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Supports any standard JPG photo
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/15 border border-destructive/30 text-destructive text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Next Button if file chosen */}
          {selectedFile && (
            <Button
              variant="cyber"
              onClick={onContinue}
              className="w-full text-sm font-semibold h-11"
            >
              Continue to Preview Spin →
            </Button>
          )}

          <div className="pt-2 border-t border-border/50 text-[11px] text-muted-foreground text-center">
            Processed 100% locally in your browser
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
