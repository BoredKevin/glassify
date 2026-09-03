import { useState } from 'react';
import { StepBar, type Step } from '../components/StepBar';
import { DropZone } from '../components/DropZone';
import { ImageEditor } from '../components/ImageEditor';
import { SpinPreview } from '../components/SpinPreview';
import { ResultPanel } from '../components/ResultPanel';
import {
  processImage,
  fileToDataUrl,
  type ProcessedImageResult,
  type EditConfig,
  DEFAULT_EDIT_CONFIG
} from '../lib/processImage';

export const HomePage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [editConfig, setEditConfig] = useState<EditConfig>(DEFAULT_EDIT_CONFIG);
  const [processedResult, setProcessedResult] = useState<ProcessedImageResult | null>(null);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [convertError, setConvertError] = useState<string | null>(null);

  const handleFileSelected = async (file: File) => {
    setSelectedFile(file);
    try {
      const dataUrl = await fileToDataUrl(file);
      setPreviewDataUrl(dataUrl);
      setEditConfig(DEFAULT_EDIT_CONFIG);
      setCurrentStep(2);
    } catch {
      setConvertError('Failed to read photo. Please try another JPG file.');
    }
  };

  const handleEditorContinue = (newConfig: EditConfig) => {
    setEditConfig(newConfig);
    setCurrentStep(3);
  };

  const handleConvert = async () => {
    if (!selectedFile) return;

    setIsConverting(true);
    setConvertError(null);

    try {
      const result = await processImage(selectedFile, editConfig);
      setProcessedResult(result);
      setCurrentStep(4);
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
    setEditConfig(DEFAULT_EDIT_CONFIG);
    setProcessedResult(null);
    setConvertError(null);
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-5 py-4 pb-12">
      {/* Top Step Progress Bar (4 steps) */}
      <StepBar
        currentStep={currentStep}
        onStepClick={(step) => setCurrentStep(step)}
        canNavigateToStep2={!!selectedFile && !!previewDataUrl}
        canNavigateToStep3={!!selectedFile && !!previewDataUrl}
        canNavigateToStep4={!!processedResult}
      />

      {/* Conversion error notice if any */}
      {convertError && (
        <div className="p-3 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs text-center font-medium">
          {convertError}
        </div>
      )}

      {/* Step 1: Pick Photo */}
      {currentStep === 1 && (
        <DropZone
          selectedFile={selectedFile}
          onFileSelected={handleFileSelected}
          onContinue={() => setCurrentStep(2)}
        />
      )}

      {/* Step 2: Edit Photo (Crop, Stretch, Rotate, Flip) */}
      {currentStep === 2 && previewDataUrl && selectedFile && (
        <ImageEditor
          imageSrc={previewDataUrl}
          fileName={selectedFile.name}
          initialConfig={editConfig}
          onContinue={handleEditorContinue}
          onBack={() => setCurrentStep(1)}
        />
      )}

      {/* Step 3: Spin Preview */}
      {currentStep === 3 && previewDataUrl && selectedFile && (
        <SpinPreview
          imageSrc={previewDataUrl}
          fileName={selectedFile.name}
          editConfig={editConfig}
          onConvert={handleConvert}
          onBack={() => setCurrentStep(2)}
          isConverting={isConverting}
        />
      )}

      {/* Step 4: Save & Download */}
      {currentStep === 4 && processedResult && (
        <ResultPanel
          result={processedResult}
          onReset={handleReset}
        />
      )}
    </div>
  );
};
