import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, gradients, HIT } from '@/theme/tokens';
import { tap, type IconName } from './Buttons';
import { Glass } from './Glass';

export interface TabItem {
  key: string;
  label: string;
  icon: IconName;
  iconActive: IconName;
}

interface Props {
  tabs: TabItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  centerLabel: string;
  onCenter: () => void;
  bottomInset: number;
}

/** Floating glass pill tab bar with a glowing violet centre button (Tonight's story). */
export function GlassTabBar({ tabs, activeKey, onSelect, centerLabel, onCenter, bottomInset }: Props) {
  const mid = Math.ceil(tabs.length / 2);
  const renderTab = (tab: TabItem) => {
    const active = tab.key === activeKey;
    return (
      <Pressable
        key={tab.key}
        testID={`tab-${tab.key}`}
        accessibilityRole="tab"
        accessibilityLabel={tab.label}
        accessibilityState={{ selected: active }}
        onPress={() => {
          tap();
          onSelect(tab.key);
        }}
        style={styles.tab}
      >
        <Ionicons name={active ? tab.iconActive : tab.icon} size={24} color={active ? colors.pillText : 'rgba(20,24,56,0.55)'} />
        {active && <View style={styles.dot} />}
      </Pressable>
    );
  };
  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: Math.max(bottomInset, 12) + 6 }]}>
      <Glass radius={40} intensity={30} style={styles.bar}>
        <View style={styles.whiteFill} pointerEvents="none" />
        <View style={styles.row}>
          {tabs.slice(0, mid).map(renderTab)}
          <Pressable
            testID="tab-center"
            accessibilityRole="button"
            accessibilityLabel={centerLabel}
            onPress={() => {
              tap();
              onCenter();
            }}
            style={styles.centerWrap}
          >
            <LinearGradient colors={gradients.primary} style={styles.center}>
              <Ionicons name="moon" size={24} color="#fff" />
            </LinearGradient>
          </Pressable>
          {tabs.slice(mid).map(renderTab)}
        </View>
      </Glass>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  bar: {
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  whiteFill: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(255,255,255,0.88)' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, gap: 6 },
  tab: { width: 56, height: 52, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.violet, marginTop: 3 },
  centerWrap: { width: 60, height: 60, minWidth: HIT },
  center: {
    flex: 1,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.violet,
    shadowOpacity: 0.9,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
  },
});
