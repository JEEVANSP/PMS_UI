import { cn } from "@shared/lib/cn";

export interface StepItem {
  step: number;
  label: string;
  completed?: boolean;
  disabled?: boolean;
}

type StepperOrientation = "horizontal" | "vertical";

interface StepperProps {
  steps: StepItem[];
  currentStep: number;
  orientation?: StepperOrientation;
  className?: string;
}

export default function Stepper({
  steps,
  currentStep,
  orientation = "horizontal",
  className,
}: StepperProps) {
  const isVertical = orientation === "vertical";

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-gray-100 shadow-sm p-6",
        isVertical ? "flex flex-col" : "flex items-center justify-between",
        className
      )}
    >
      {steps.map((item, index) => (
        <div
          key={item.step}
          className={cn(
            "flex items-center",
            isVertical ? "mb-4 flex-col items-start" : "flex-1"
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                currentStep >= item.step
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-400",
                item.disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {item.step}
            </div>

            <div className="flex flex-col">
              <div
                className={cn(
                  "text-sm font-medium",
                  currentStep >= item.step ? "text-gray-900" : "text-gray-400"
                )}
              >
                {item.label}
              </div>
              {item.completed && (
                <div className="text-xs text-green-600">Completed</div>
              )}
            </div>
          </div>

          {/* Connector line */}
          {index < steps.length - 1 && (
            <div
              className={cn(
                "transition-colors",
                isVertical
                  ? "h-8 w-px ml-5 my-2"
                  : "h-px flex-1 mx-4",
                currentStep > item.step ? "bg-blue-600" : "bg-gray-200"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
