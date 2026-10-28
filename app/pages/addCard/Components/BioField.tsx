import { Switch } from 'react-native';
import { BIO_MAX_LENGTH } from '../Config/addCardFields';
import { FormField } from './FormField';

type Props = {
  value: string;
  enabled: boolean;
  onChangeText: (value: string) => void;
  onToggle: (enabled: boolean) => void;
  onFocus?: () => void;
  onEndEditing?: () => void;
};

/** Biography input; the switch controls whether the bio is shown on the card. */
export function BioField({ value, enabled, onChangeText, onToggle, onFocus, onEndEditing }: Props) {
  return (
    <FormField
      label={enabled ? 'Bio · shown on card' : 'Bio · hidden'}
      value={value}
      placeholder="Your background, mission, and achievements…"
      maxLength={BIO_MAX_LENGTH}
      multiline
      showCount
      onChangeText={onChangeText}
      onFocus={onFocus}
      onEndEditing={onEndEditing}
      accessory={
        <Switch
          accessibilityLabel="Show bio on card"
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ false: '#cbd5e1', true: '#2563eb' }}
          thumbColor="#ffffff"
          style={{ transform: [{ scale: 0.85 }] }}
        />
      }
    />
  );
}
