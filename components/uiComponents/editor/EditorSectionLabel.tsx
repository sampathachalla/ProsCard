import { Text } from '@/components/uiComponents/Text';

type EditorSectionLabelProps = {
  title: string;
  subtitle?: string;
};

export function EditorSectionLabel({ title, subtitle }: EditorSectionLabelProps) {
  return (
    <>
      <Text className="mb-2 text-xs font-bold uppercase text-textMuted dark:text-dark-textMuted">
        {title}
      </Text>
      {subtitle ? (
        <Text variant="muted" className="mb-3 text-xs">
          {subtitle}
        </Text>
      ) : null}
    </>
  );
}
