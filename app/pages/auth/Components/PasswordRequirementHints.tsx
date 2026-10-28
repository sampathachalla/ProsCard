import { View } from 'react-native';
import { Check } from 'lucide-react-native';
import { Text } from '@/common/ui/Text';

type Rule = { label: string; met: boolean };

export function getPasswordRules(password: string): Rule[] {
  return [{ label: 'At least 8 characters', met: password.length >= 8 }];
}

type Props = {
  password: string;
};

export function PasswordRequirementHints({ password }: Props) {
  const rules = getPasswordRules(password);
  return (
    <View className="mb-3 -mt-1 gap-1.5 px-0.5">
      {rules.map((rule) => (
        <View key={rule.label} className="flex-row items-center">
          <Check
            size={14}
            strokeWidth={2.8}
            color={rule.met ? '#16a34a' : '#94a3b8'}
          />
          <Text
            variant="none"
            className={`ml-2 text-xs ${rule.met ? 'text-green-700 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}`}
          >
            {rule.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
