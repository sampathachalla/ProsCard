// components/authComponents/Components/TypewriterText.tsx
import { useEffect, useState } from 'react';
import { Text, type TextStyle } from 'react-native';

type TypewriterTextProps = {
  text: string;
  speed?: number;
  style?: TextStyle;
};

export function TypewriterText({ text, speed = 100, style }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i));
      i++;
      if (i > text.length) {
        i = 0;
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return <Text style={style}>{displayedText}</Text>;
}
