import { useEffect, useState } from 'react';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Text } from '@/components/uiComponents/Text';

const WORD_INTERVAL_MS = 2400;

export interface OnboardingRotatingWordProps {
  words: string[];
}

export function OnboardingRotatingWord({ words }: OnboardingRotatingWordProps) {
  const [index, setIndex] = useState(0);
  const safeWords = words.filter((w) => w.trim().length > 0);

  useEffect(() => {
    if (safeWords.length <= 1) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % safeWords.length);
    }, WORD_INTERVAL_MS);
    return () => clearInterval(id);
  }, [safeWords.length]);

  if (safeWords.length === 0) return null;

  const word = safeWords[index] ?? safeWords[0];

  return (
    <Animated.View
      key={word}
      entering={FadeIn.duration(450)}
      exiting={FadeOut.duration(320)}
      className="mt-16 min-h-11 items-center justify-center"
    >
      <Text
        variant="none"
        className="text-center text-2xl font-semibold leading-snug tracking-wide text-primary dark:text-dark-primary"
      >
        {word}
      </Text>
    </Animated.View>
  );
}
