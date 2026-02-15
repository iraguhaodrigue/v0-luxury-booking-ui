'use client'

import { Check } from 'lucide-react'

interface Step {
  id: number
  title: string
  description?: string
}

interface BookingStepsProps {
  steps: Step[]
  currentStep: number
}

export function BookingSteps({ steps, currentStep }: BookingStepsProps) {
  return (
    <div className="bg-card rounded-lg shadow-luxury p-6 mb-8">
      <div className="flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id
          const isCurrent = currentStep === step.id
          const isUpcoming = currentStep < step.id

          return (
            <div key={step.id} className="flex-1">
              <div className="flex items-center">
                {/* Step Circle */}
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                    isCompleted
                      ? 'bg-accent text-accent-foreground'
                      : isCurrent
                        ? 'bg-primary text-primary-foreground border-2 border-accent'
                        : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.id
                  )}
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-colors ${
                      isCompleted ? 'bg-accent' : 'bg-border'
                    }`}
                  />
                )}
              </div>

              {/* Label */}
              <div className="mt-3">
                <p
                  className={`text-xs font-semibold uppercase transition-colors ${
                    isCurrent
                      ? 'text-primary'
                      : isCompleted
                        ? 'text-accent'
                        : 'text-muted-foreground'
                  }`}
                >
                  {step.title}
                </p>
                {step.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
