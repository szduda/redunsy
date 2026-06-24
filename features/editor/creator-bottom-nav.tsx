'use client'

import { CreatorStepMonitor } from '@/features/editor/creator-step-monitor'
import { Button } from '@/features/theme/button'

type CreatorBottomNavProps = {
  currentStep: 1 | 2 | 3
  continueDisabled?: boolean
  onBack: () => void
  onContinue: () => void
}

export const CreatorBottomNav = ({
  currentStep,
  continueDisabled = false,
  onBack,
  onContinue,
}: CreatorBottomNavProps) => (
  <div className="mx-auto flex h-full w-full max-w-4xl items-center justify-between gap-3 px-4">
    <CreatorStepMonitor compact currentStep={currentStep} />
    <div className="flex shrink-0 items-center gap-2">
      <Button onClick={onBack} variant="outlined">
        Back
      </Button>
      <Button disabled={continueDisabled} onClick={onContinue}>
        Continue
      </Button>
    </div>
  </div>
)
