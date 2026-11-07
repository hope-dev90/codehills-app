import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { colors, radius } from '../theme';
import { useRootNav } from '../hooks/useRootNav';
import { useToast } from '../hooks/ToastContext';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type Group = 'Agriculture' | 'Minerals' | 'Water' | 'Biodiversity';

type Material = {
  id: string;
  name: string;
  group: Group;
  description: string;
};

const DARK_BROWN = '#5A2E14';

const filters: ('All' | Group)[] = ['All', 'Agriculture', 'Minerals', 'Water', 'Biodiversity'];

const groupIcon: Record<Group, IconName> = {
  Agriculture: 'leaf-outline',
  Minerals: 'diamond-outline',
  Water: 'water-outline',
  Biodiversity: 'flower-outline',
};

const materials: Material[] = [
  { id: 'coffee', name: 'Coffee', group: 'Agriculture', description: "High-quality coffee beans, grown in Rwanda's rich volcanic soils." },
  { id: 'tea', name: 'Tea', group: 'Agriculture', description: "Premium tea leaves from Rwanda's highlands." },
  { id: 'maize', name: 'Maize', group: 'Agriculture', description: 'Nutritious maize, a staple crop in many regions of Rwanda.' },
  { id: 'potatoes', name: 'Potatoes', group: 'Agriculture', description: 'Fresh, high-quality potatoes from local farms.' },
  { id: 'bananas', name: 'Bananas', group: 'Agriculture', description: 'Rich in nutrients, grown across the country.' },
  { id: 'gold', name: 'Gold', group: 'Minerals', description: 'Valuable mineral resources found in Rwanda.' },
  { id: 'coltan', name: 'Coltan', group: 'Minerals', description: 'Essential for modern technology and electronics.' },
  { id: 'water', name: 'Water Resources', group: 'Water', description: 'Lakes, rivers and groundwater for agriculture, energy and industry.' },
  { id: 'biodiversity', name: 'Biodiversity', group: 'Biodiversity', description: 'Unique flora and fauna for eco-tourism, research and sustainable products.' },
];

/** "Start Your Business" screen: pick the Rwandan raw materials you want to use, then continue. */
export default function StartBusinessScreen() {
  const navigation = useRootNav();
  const toast = useToast();
  const [filter, setFilter] = useState<'All' | Group>('All');
  const [selected, setSelected] = useState<string[]>([]);

  const visible = useMemo(
    () => (filter === 'All' ? materials : materials.filter((m) => m.group === filter)),
    [filter],
  );

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const next = () => {
    if (selected.length === 0) {
      toast('Select at least one raw material');
      return;
    }
    const selectedNames = materials
      .filter((m) => selected.includes(m.id))
      .map((m) => m.name);
    navigation.navigate('CreateBusiness', { materials: selectedNames });
  };

  return (
    <Screen padBottom>
      <ScreenHeader
        title="Start Your Business"
        subtitle="Select the raw materials from Rwanda you want to use for your product."
        showBack
        onBack={() => navigation.goBack()}
      />

      <View style={styles.filterWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {filters.map((f) => (
            <Chip key={f} label={f} selected={filter === f} onPress={() => setFilter(f)} />
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <View style={styles.introIcon}>
            <Ionicons name="leaf-outline" size={22} color={colors.white} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="subheading" color={DARK_BROWN}>
              Raw Materials in Rwanda
            </AppText>
            <AppText variant="small" color={colors.muted}>
              Choose the natural resources that match your business idea.
            </AppText>
          </View>
        </View>

        {visible.map((m) => {
          const isSelected = selected.includes(m.id);
          return (
            <Pressable
              key={m.id}
              onPress={() => toggle(m.id)}
              style={({ pressed }) => [styles.card, isSelected && styles.cardSelected, pressed && styles.pressed]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={`${m.name}, ${m.group}. ${m.description}`}
            >
              <View style={styles.iconCircle}>
                <Ionicons name={groupIcon[m.group]} size={20} color={colors.white} />
              </View>
              <View style={styles.textWrap}>
                <View style={styles.titleRow}>
                  <AppText variant="subheading">{m.name}</AppText>
                  <View style={styles.badge}>
                    <AppText variant="caption" color={DARK_BROWN}>
                      {m.group}
                    </AppText>
                  </View>
                </View>
                <AppText variant="small" color={colors.muted} style={styles.desc}>
                  {m.description}
                </AppText>
              </View>
              <Ionicons
                name={isSelected ? 'checkbox' : 'square-outline'}
                size={24}
                color={isSelected ? DARK_BROWN : colors.muted}
              />
            </Pressable>
          );
        })}

        <View style={styles.actions}>
          <Button title="Next" iconRight="arrow-forward" onPress={next} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  filterWrap: { marginBottom: 12 },
  filters: { paddingHorizontal: 20, gap: 8 },
  scroll: { paddingHorizontal: 20, paddingBottom: 24 },
  intro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.sandstone,
    borderRadius: radius.lg,
    padding: 12,
    marginBottom: 12,
  },
  introIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: DARK_BROWN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: 'transparent',
    padding: 14,
    marginBottom: 10,
  },
  cardSelected: { borderColor: DARK_BROWN },
  pressed: { opacity: 0.8 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DARK_BROWN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  badge: {
    backgroundColor: colors.sandstone,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  desc: { marginTop: 3 },
  actions: { marginTop: 14 },
});
