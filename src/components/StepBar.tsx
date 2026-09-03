import { Check } from 'lucide-react';

export type Step = 1 | 2 | 3 | 4;

interface StepBarProps {
  currentStep: Step;
  onStepClick?: (step: Step) => void;
  canNavigateToStep2: boolean;
  canNavigateToStep3: boolean;
  canNavigateToStep4: boolean;
}

const STEPS = [
  { step: 1 as Step, title: 'Pick' },
  { step: 2 as Step, title: 'Edit' },
  { step: 3 as Step, title: 'Spin' },
  { step: 4 as Step, title: 'Save' }
];

export const StepBar: React.FC<StepBarProps> = ({
  currentStep,
  onStepClick,
  canNavigateToStep2,
  canNavigateToStep3,
  canNavigateToStep4
}) => {
  const isAccessible = (step: Step) => {
    if (step === 1) return true;
    if (step === 2) return canNavigateToStep2;
    if (step === 3) return canNavigateToStep3;
    if (step === 4) return canNavigateToStep4;
    return false;
  };

  const getProgressWidth = (step: Step) => {
    switch (step) {
      case 1:
        return '0%';
      case 2:
        return '33.333%';
      case 3:
        return '66.666%';
      case 4:
        return '100%';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto py-2 px-1">
      <div className="relative">
        {/* Track lines container: perfectly centered vertically on the 36px (h-9) circles */}
        <div className="absolute left-[18px] right-[18px] top-[18px] -translate-y-1/2 h-[2px] z-0 pointer-events-none">
          {/* Background track line */}
          <div className="w-full h-full bg-white/25 rounded-full" />

          {/* Highlight active track line */}
          <div
            className="absolute left-0 top-0 h-full bg-primary shadow-[0_0_8px_rgba(56,189,248,0.7)] rounded-full transition-all duration-300"
            style={{ width: getProgressWidth(currentStep) }}
          />
        </div>

        {/* Steps */}
        <div className="relative z-10 flex items-start justify-between">
          {STEPS.map((s) => {
            const isCurrent = currentStep === s.step;
            const isPassed = currentStep > s.step;
            const clickable = isAccessible(s.step) && onStepClick;

            return (
              <button
                key={s.step}
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onStepClick(s.step)}
                className={`flex flex-col items-center gap-1.5 focus:outline-none transition-transform ${
                  clickable ? 'cursor-pointer active:scale-95' : 'cursor-default'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all border-2 ${
                    isPassed
                      ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_12px_rgba(56,189,248,0.4)]'
                      : isCurrent
                        ? 'bg-background text-white border-white ring-4 ring-primary/30 shadow-[0_0_14px_rgba(56,189,248,0.5)]'
                        : 'bg-background text-white/80 border-white/50 hover:border-white/80'
                  }`}
                >
                  {isPassed ? <Check className="w-4 h-4 stroke-[3]" /> : s.step}
                </div>

                <div className="flex flex-col items-center">
                  <span
                    className={`text-xs font-semibold whitespace-nowrap transition-colors ${
                      isCurrent
                        ? 'text-white font-bold'
                        : isPassed
                          ? 'text-primary'
                          : 'text-white/60'
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
