import { Badge } from '@boredkevin/ui';
import { Check } from 'lucide-react';

export type Step = 1 | 2 | 3;

interface StepBarProps {
  currentStep: Step;
  onStepClick?: (step: Step) => void;
  canNavigateToStep2: boolean;
  canNavigateToStep3: boolean;
}

const STEPS = [
  { step: 1 as Step, title: 'Pick Photo' },
  { step: 2 as Step, title: 'Preview Spin' },
  { step: 3 as Step, title: 'Save' }
];

export const StepBar: React.FC<StepBarProps> = ({
  currentStep,
  onStepClick,
  canNavigateToStep2,
  canNavigateToStep3
}) => {
  const isAccessible = (step: Step) => {
    if (step === 1) return true;
    if (step === 2) return canNavigateToStep2;
    if (step === 3) return canNavigateToStep3;
    return false;
  };

  return (
    <div className="w-full max-w-md mx-auto py-2">
      <div className="relative flex items-center justify-between">
        {/* Background track line */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-[2px] bg-border z-0" />

        {/* Highlight track line */}
        <div
          className="absolute left-6 top-1/2 -translate-y-1/2 h-[2px] bg-primary transition-all duration-300 z-0"
          style={{
            width:
              currentStep === 1
                ? '0%'
                : currentStep === 2
                ? '50%'
                : 'calc(100% - 3rem)'
          }}
        />

        {/* Steps */}
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
              className={`relative z-10 flex flex-col items-center gap-1.5 focus:outline-none transition-transform ${
                clickable ? 'cursor-pointer active:scale-95' : 'cursor-default'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all border ${
                  isPassed
                    ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_12px_rgba(56,189,248,0.35)]'
                    : isCurrent
                    ? 'bg-card text-foreground border-primary shadow-[0_0_14px_rgba(56,189,248,0.45)] ring-2 ring-primary/40'
                    : 'bg-card text-muted-foreground border-border'
                }`}
              >
                {isPassed ? <Check className="w-4 h-4 stroke-[3]" /> : s.step}
              </div>

              <div className="flex flex-col items-center">
                <span
                  className={`text-xs font-semibold whitespace-nowrap transition-colors ${
                    isCurrent
                      ? 'text-foreground'
                      : isPassed
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  {s.title}
                </span>

                {isCurrent && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 mt-0.5 border-primary/40 text-primary">
                    Active
                  </Badge>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
