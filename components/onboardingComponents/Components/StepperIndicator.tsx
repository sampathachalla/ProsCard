import React from 'react';
import { View, Text, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Check } from 'lucide-react-native';
import { ONBOARDING_STEPS_META, type StepMetadata } from '../types/onboardingStepper.types';

export interface StepperIndicatorProps {
  currentStep: number;
  totalSteps: number;
  onStepPress?: (step: number) => void;
}

export function StepperIndicator({
  currentStep,
  totalSteps,
  onStepPress,
}: StepperIndicatorProps) {
  const steps: StepMetadata[] = ONBOARDING_STEPS_META.slice(0, totalSteps);
  const activeMeta = steps[currentStep - 1] || steps[0];
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentStep / totalSteps) * 100)));

  const handleStepPress = (stepNum: number) => {
    if (!onStepPress) return;
    Haptics.selectionAsync().catch(() => {});
    onStepPress(stepNum);
  };

  return (
    <View className="px-6 pt-2 pb-4 bg-background dark:bg-dark-background border-b border-slate-100 dark:border-slate-800/80">
      {/* Step counter and progress percent */}
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-xs font-bold uppercase tracking-wider text-primary dark:text-dark-primary">
          Step {currentStep} of {totalSteps}
        </Text>
        <Text className="text-xs font-semibold text-textMuted dark:text-dark-textMuted">
          {progressPercent}% Complete
        </Text>
      </View>

      {/* Continuous progress bar */}
      <View className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mb-4">
        <View
          className="h-full bg-primary dark:bg-dark-primary rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </View>

      {/* Numbered step nodes with connecting lines */}
      <View className="flex-row items-center justify-between px-1">
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;
          const isUpcoming = stepNum > currentStep;
          const isTappable = Boolean(onStepPress);

          return (
            <React.Fragment key={step.index || stepNum}>
              {/* Step node */}
              <Pressable
                onPress={() => isTappable && handleStepPress(stepNum)}
                disabled={!isTappable}
                accessibilityRole="button"
                accessibilityLabel={`Step ${stepNum}: ${step.title}${isActive ? ' (Current)' : isCompleted ? ' (Completed)' : ''}`}
                className="items-center justify-center"
              >
                <View
                  className={`w-8 h-8 rounded-full items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-primary dark:bg-dark-primary shadow-sm shadow-blue-500/20'
                      : isActive
                      ? 'bg-primary/15 dark:bg-dark-primary/20 border-2 border-primary dark:border-dark-primary'
                      : 'bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {isCompleted ? (
                    <Check size={16} strokeWidth={2.6} color="#FFFFFF" />
                  ) : (
                    <Text
                      className={`text-xs font-bold ${
                        isActive
                          ? 'text-primary dark:text-dark-primary'
                          : isUpcoming
                          ? 'text-textMuted dark:text-dark-textMuted'
                          : 'text-textPrimary dark:text-dark-textPrimary'
                      }`}
                    >
                      {stepNum}
                    </Text>
                  )}
                </View>

                {/* Step short label */}
                <Text
                  numberOfLines={1}
                  className={`text-[10px] mt-1 font-medium ${
                    isActive
                      ? 'font-bold text-primary dark:text-dark-primary'
                      : isCompleted
                      ? 'text-textPrimary dark:text-dark-textPrimary'
                      : 'text-textMuted dark:text-dark-textMuted'
                  }`}
                >
                  {step.title}
                </Text>
              </Pressable>

              {/* Connector line between nodes */}
              {idx < steps.length - 1 && (
                <View
                  className={`flex-1 h-[2px] mx-1.5 -mt-3.5 rounded-full ${
                    stepNum < currentStep
                      ? 'bg-primary dark:bg-dark-primary'
                      : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>

      {/* Active step title and subtitle */}
      {activeMeta && (
        <View className="mt-4 pt-1">
          <Text className="text-xl font-extrabold text-textPrimary dark:text-dark-textPrimary tracking-tight">
            {activeMeta.title}
          </Text>
          <Text className="text-xs text-textMuted dark:text-dark-textMuted mt-0.5 leading-4">
            {activeMeta.subtitle}
          </Text>
        </View>
      )}
    </View>
  );
}
