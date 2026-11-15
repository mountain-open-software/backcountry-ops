import React from 'react';
import { Pressable, Text, TextInput, View, StyleSheet, type TextInputProps } from 'react-native';
export const colors = {
  green: '#173f36',
  paper: '#fffef9',
  background: '#f4f3ed',
  muted: '#687565',
  line: '#d6ddcf',
};
export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    padding: 20,
    gap: 14,
  },
  title: { fontSize: 24, fontWeight: '600', color: colors.green },
  label: { fontSize: 13, fontWeight: '600', color: colors.green, marginBottom: 7 },
  input: {
    borderWidth: 1,
    borderColor: '#c4cebd',
    borderRadius: 8,
    minHeight: 48,
    padding: 12,
    fontSize: 16,
    color: colors.green,
    backgroundColor: '#fffefa',
  },
  note: { fontSize: 13, lineHeight: 21, color: colors.muted },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  section: { gap: 18 },
  button: {
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#bfccba',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontWeight: '600', fontSize: 14 },
  small: { fontSize: 12, color: colors.muted, lineHeight: 19 },
});
export function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}
export function Heading({ children }: { children: React.ReactNode }) {
  return (
    <Text accessibilityRole="header" style={styles.title}>
      {children}
    </Text>
  );
}
export function Note({ children }: { children: React.ReactNode }) {
  return <Text style={styles.note}>{children}</Text>;
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
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: primary ? colors.green : colors.paper,
          opacity: disabled ? 0.45 : pressed ? 0.7 : 1,
        },
      ]}
    >
      <Text style={[styles.buttonText, { color: primary ? 'white' : colors.green }]}>{title}</Text>
    </Pressable>
  );
}
export function Field({ label, multiline = false, ...props }: TextInputProps & { label: string }) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        placeholderTextColor="#7a8575"
        style={[
          styles.input,
          multiline ? { minHeight: 100 } : null,
          props.editable === false ? { opacity: 0.6 } : null,
        ]}
        {...props}
      />
    </View>
  );
}
