import { useState } from 'react';
import { StepBar, type Step } from '../components/StepBar';
import { DropZone } from '../components/DropZone';
import { SpinPreview } from '../components/SpinPreview';
import { ResultPanel } from '../components/ResultPanel';
import { processImage, fileToDataUrl, type ProcessedImageResult } from '../lib/processImage';

export const HomePage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [processedResult, setProcessedResult] = useState<ProcessedImageResult | null>(null);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [convertError, setConvertError] = useState<string | null>(null);

  const handleFileSelected = async (file: File) => {
    setSelectedFile(file);
    try {
      const dataUrl = await fileToDataUrl(file);
      setPreviewDataUrl(dataUrl);
      setCurrentStep(2);
    } catch {
      setConvertError('Failed to read photo. Please try another JPG file.');
    }
  };

  const handleConvert = async () => {
    if (!selectedFile) return;

    setIsConverting(true);
    setConvertError(null);

    try {
      const result = await processImage(selectedFile);
      setProcessedResult(result);
      setCurrentStep(3);
    } catch (err) {
      console.error(err);
      setConvertError('Could not convert this photo. Please ensure it is a valid JPG file.');
    } finally {
      setIsConverting(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setSelectedFile(null);
    setPreviewDataUrl(null);
    setProcessedResult(null);
    setConvertError(null);
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-5 py-4 pb-12">
      {/* Top Step Progress Bar */}
      <StepBar
        currentStep={currentStep}
        onStepClick={(step) => setCurrentStep(step)}
        canNavigateToStep2={!!selectedFile && !!previewDataUrl}
        canNavigateToStep3={!!processedResult}
      />

      {/* Conversion error notice if any */}
      {convertError && (
        <div className="p-3 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs text-center font-medium">
          {convertError}
        </div>
      )}

      {/* Step Content */}
      {currentStep === 1 && (
        <DropZone
          selectedFile={selectedFile}
          onFileSelected={handleFileSelected}
          onContinue={() => setCurrentStep(2)}
        />
      )}

      {currentStep === 2 && previewDataUrl && selectedFile && (
        <SpinPreview
          imageSrc={previewDataUrl}
          fileName={selectedFile.name}
          onConvert={handleConvert}
          onBack={() => setCurrentStep(1)}
          isConverting={isConverting}
        />
      )}

      {currentStep === 3 && processedResult && (
        <ResultPanel
          result={processedResult}
          onReset={handleReset}
        />
      )}
    </div>
  );
};
