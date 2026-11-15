import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Button as PaperButton,
  Card as PaperCard,
  Text as PaperText,
  TextInput as PaperInput,
} from 'react-native-paper';
import { tokens } from '@open-mountain/design-system';
export const colors = {
  green: tokens.color.primary,
  paper: tokens.color.surface,
  background: tokens.color.background,
  muted: tokens.color.muted,
  line: tokens.color.outlineVariant,
};
export const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.color.surface,
    borderWidth: 1,
    borderColor: tokens.color.outlineVariant,
    borderRadius: tokens.radius.large,
    padding: tokens.space.xl,
    gap: tokens.space.lg,
  },
  title: { fontSize: tokens.type.title, fontWeight: '600', color: tokens.color.text },
  label: {
    fontSize: tokens.type.label,
    fontWeight: '600',
    color: tokens.color.text,
    marginBottom: tokens.space.sm,
  },
  input: {
    minHeight: tokens.control.minHeight,
    fontSize: tokens.type.body,
    backgroundColor: tokens.color.field,
  },
  note: { fontSize: tokens.type.supporting, lineHeight: 22, color: tokens.color.muted },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.space.md },
  section: { gap: tokens.space.xl },
  button: { minHeight: tokens.control.minHeight, borderRadius: tokens.radius.small },
  buttonText: { fontWeight: '600', fontSize: tokens.type.supporting },
  small: { fontSize: tokens.type.caption, color: tokens.color.muted, lineHeight: 20 },
});
export function Card({ children }: { children: React.ReactNode }) {
  return (
    <PaperCard
      mode="outlined"
      style={{
        backgroundColor: tokens.color.surface,
        borderColor: tokens.color.outlineVariant,
        borderRadius: tokens.radius.large,
      }}
    >
      <PaperCard.Content style={{ gap: tokens.space.lg, paddingVertical: tokens.space.xl }}>
        {children}
      </PaperCard.Content>
    </PaperCard>
  );
}
export function Heading({ children }: { children: React.ReactNode }) {
  return (
    <PaperText accessibilityRole="header" variant="headlineSmall" style={styles.title}>
      {children}
    </PaperText>
  );
}
export function Note({ children }: { children: React.ReactNode }) {
  return (
    <PaperText variant="bodyMedium" style={styles.note}>
      {children}
    </PaperText>
  );
}
export function Button({
  title,
  onPress,
  disabled = false,
  primary = false,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  primary?: boolean;
}) {
  return (
    <PaperButton
      mode={primary ? 'contained' : 'outlined'}
      accessibilityLabel={title}
      disabled={disabled}
      onPress={onPress}
      style={styles.button}
      contentStyle={{ minHeight: tokens.control.minHeight }}
      labelStyle={styles.buttonText}
    >
      {title}
    </PaperButton>
  );
}
export function Field({
  label,
  multiline = false,
  ...props
}: Omit<React.ComponentProps<typeof PaperInput>, 'label'> & { label: string }) {
  return (
    <View>
      <PaperInput
        mode="outlined"
        label={label}
        accessibilityLabel={label}
        multiline={multiline}
        disabled={props.editable === false}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[styles.input, multiline ? { minHeight: 104 } : undefined]}
        {...props}
      />
    </View>
  );
}
