import React from 'react';
import { View, StyleSheet } from 'react-native';
import { dailyScreens, type DailyScreen, tokens } from '@open-mountain/design-system';
import { Button } from './Controls';
export function DailyNavigation({
  active,
  busy,
  onChange,
}: {
  active: DailyScreen;
  busy: boolean;
  onChange: (screen: DailyScreen) => void;
}) {
  return (
    <View accessibilityLabel="Daily workflow" style={styles.navigation}>
      {dailyScreens.map(({ id, label }) => (
        <View key={id} style={styles.item}>
          <Button
            title={label}
            primary={active === id}
            selected={active === id}
            disabled={busy}
            onPress={() => onChange(id)}
          />
        </View>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  navigation: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.space.sm },
  item: { flexBasis: '47%', flexGrow: 1, minWidth: 0 },
});
