import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Check } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeContext';
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
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';
  const tint = isDark ? Colors.dark.tint : Colors.light.tint;
  const muted = isDark ? Colors.dark.mutedText : Colors.light.mutedText;
  const text = isDark ? Colors.dark.text : Colors.light.text;
  const track = isDark ? '#1e293b' : '#e2e8f0';
  const nodeIdle = isDark ? '#1e293b' : '#f1f5f9';

  const steps: StepMetadata[] = ONBOARDING_STEPS_META.slice(0, totalSteps);
  const activeMeta = steps[currentStep - 1] || steps[0];
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((currentStep / Math.max(totalSteps, 1)) * 100))
  );

  const handleStepPress = (stepNum: number) => {
    if (!onStepPress) return;
    Haptics.selectionAsync().catch(() => {});
    onStepPress(stepNum);
  };

  return (
    <View
      className="border-b border-slate-100 bg-background px-6 pb-4 pt-2 dark:border-slate-800/80 dark:bg-dark-background"
    >
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-xs font-bold uppercase tracking-wider text-primary dark:text-dark-primary">
          Step {currentStep} of {totalSteps}
        </Text>
        <Text className="text-xs font-semibold text-textMuted dark:text-dark-textMuted">
          {progressPercent}%
        </Text>
      </View>

      <View
        className="mb-4 h-1.5 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: track }}
      >
        <View
          style={{
            height: '100%',
            width: `${progressPercent}%`,
            borderRadius: 999,
            backgroundColor: tint,
          }}
        />
      </View>

      <View style={styles.nodesRow}>
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;
          const isTappable = Boolean(onStepPress);

          return (
            <React.Fragment key={`step-${step.index ?? stepNum}`}>
              <Pressable
                onPress={() => {
                  if (isTappable) handleStepPress(stepNum);
                }}
                disabled={!isTappable}
                accessibilityRole="button"
                accessibilityLabel={`Step ${stepNum}: ${step.title}${
                  isActive ? ' (Current)' : isCompleted ? ' (Completed)' : ''
                }`}
                style={styles.nodePressable}
              >
                <View
                  style={[
                    styles.node,
                    isCompleted
                      ? { backgroundColor: tint }
                      : isActive
                      ? {
                          backgroundColor: isDark ? 'rgba(56,189,248,0.15)' : 'rgba(37,99,235,0.12)',
                          borderWidth: 2,
                          borderColor: tint,
                        }
                      : {
                          backgroundColor: nodeIdle,
                          borderWidth: 1,
                          borderColor: track,
                        },
                  ]}
                >
                  {isCompleted ? (
                    <Check size={14} strokeWidth={2.8} color="#FFFFFF" />
                  ) : (
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: '700',
                        color: isActive ? tint : muted,
                      }}
                    >
                      {stepNum}
                    </Text>
                  )}
                </View>
                <Text
                  numberOfLines={1}
                  style={{
                    marginTop: 4,
                    maxWidth: 56,
                    fontSize: 9,
                    fontWeight: isActive ? '700' : '500',
                    color: isActive ? tint : isCompleted ? text : muted,
                    textAlign: 'center',
                  }}
                >
                  {step.title}
                </Text>
              </Pressable>

              {idx < steps.length - 1 ? (
                <View
                  style={[
                    styles.connector,
                    {
                      backgroundColor: stepNum < currentStep ? tint : track,
                    },
                  ]}
                />
              ) : null}
            </React.Fragment>
          );
        })}
      </View>

      {activeMeta ? (
        <View className="mt-4 pt-1">
          <Text className="text-xl font-extrabold tracking-tight text-textPrimary dark:text-dark-textPrimary">
            {activeMeta.title}
          </Text>
          <Text className="mt-0.5 text-xs leading-4 text-textMuted dark:text-dark-textMuted">
            {activeMeta.subtitle}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  nodesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  nodePressable: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
  },
  node: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connector: {
    flex: 1,
    height: 2,
    marginHorizontal: 4,
    marginTop: 13,
    borderRadius: 1,
  },
});
