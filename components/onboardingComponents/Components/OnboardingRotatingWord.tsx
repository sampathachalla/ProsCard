import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/uiComponents/Text';

const TYPE_MS = 88;
const HOLD_MS = 2000;
const DELETE_MS = 48;

export interface OnboardingRotatingWordProps {
  words: string[];
  className?: string;
}

export function OnboardingRotatingWord({ words, className = 'mt-3' }: OnboardingRotatingWordProps) {
  const safeWords = useMemo(() => words.filter((w) => w.trim().length > 0), [words]);
  const [wordIndex, setWordIndex] = useState(0);
  const [visibleLength, setVisibleLength] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const activeWord = safeWords[wordIndex] ?? '';
  const displayed = activeWord.slice(0, visibleLength);

  useEffect(() => {
    if (safeWords.length === 0) return;

    if (safeWords.length === 1) {
      if (visibleLength >= activeWord.length) return;
      const id = setTimeout(() => setVisibleLength((n) => n + 1), TYPE_MS);
      return () => clearTimeout(id);
    }

    if (!isDeleting) {
      if (visibleLength < activeWord.length) {
        const id = setTimeout(() => setVisibleLength((n) => n + 1), TYPE_MS);
        return () => clearTimeout(id);
      }
      const id = setTimeout(() => setIsDeleting(true), HOLD_MS);
      return () => clearTimeout(id);
    }

    if (visibleLength > 0) {
      const id = setTimeout(() => setVisibleLength((n) => n - 1), DELETE_MS);
      return () => clearTimeout(id);
    }

    setIsDeleting(false);
    setWordIndex((prev) => (prev + 1) % safeWords.length);
  }, [activeWord, isDeleting, safeWords.length, visibleLength]);

  useEffect(() => {
    setWordIndex(0);
    setVisibleLength(0);
    setIsDeleting(false);
  }, [safeWords.join('\u0000')]);

  useEffect(() => {
    setVisibleLength(0);
    setIsDeleting(false);
  }, [wordIndex]);

  if (safeWords.length === 0) return null;

  return (
    <View className={`min-h-11 items-center justify-center ${className}`}>
      <Text
        variant="none"
        className="text-center text-2xl font-semibold leading-snug tracking-wide text-primary dark:text-dark-primary"
      >
        {displayed}
        <Text variant="none" className="text-primary/70 dark:text-dark-primary/70">
          |
        </Text>
      </Text>
    </View>
  );
}
