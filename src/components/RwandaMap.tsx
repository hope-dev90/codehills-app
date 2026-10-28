import React, { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { colors, radius } from '../theme';
import type { Destination } from '../types';

interface Props {
  destinations: Destination[];
  selectedId?: string;
  onSelect: (id: string) => void;
  height?: number;
}

// Rough bounding box of Rwanda, used for placing markers in the simple fallback map.
const BOUNDS = { minLat: -2.9, maxLat: -1.0, minLng: 28.8, maxLng: 30.95 };
const RWANDA_REGION = { latitude: -1.95, longitude: 29.87, latitudeDelta: 1.9, longitudeDelta: 1.9 };

/**
 * Simple map drawn with plain views. It is used when the native map is unavailable
 * (web, missing Google Maps configuration, or any native map error). Marker positions
 * are approximate and no distances are shown.
 */
function FallbackMap({ destinations, selectedId, onSelect, height, note }: Props & { note: string }) {
  return (
    <View style={[styles.fallback, { height }]}>
      <View style={styles.grid} pointerEvents="none">
        {[0.25, 0.5, 0.75].map((p) => (
          <View key={`h${p}`} style={[styles.gridH, { top: `${p * 100}%` }]} />
        ))}
        {[0.25, 0.5, 0.75].map((p) => (
          <View key={`v${p}`} style={[styles.gridV, { left: `${p * 100}%` }]} />
        ))}
      </View>
      {destinations.map((d) => {
        const x = (d.longitude - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng);
        const y = (BOUNDS.maxLat - d.latitude) / (BOUNDS.maxLat - BOUNDS.minLat);
        const active = d.id === selectedId;
        return (
          <Pressable
            key={d.id}
            onPress={() => onSelect(d.id)}
            accessibilityRole="button"
            accessibilityLabel={`Show ${d.name}`}
            style={[styles.marker, { left: `${Math.min(92, Math.max(2, x * 100))}%`, top: `${Math.min(86, Math.max(4, y * 100))}%` }]}
          >
            <Ionicons name="location" size={active ? 34 : 26} color={active ? colors.chocolate : colors.caramel} />
            <AppText variant="caption" color={colors.chocolate} style={styles.markerLabel} numberOfLines={1}>
              {d.name}
            </AppText>
          </Pressable>
        );
      })}
      <View style={styles.note}>
        <AppText variant="caption" color={colors.muted}>
          {note}
        </AppText>
      </View>
    </View>
  );
}

class MapBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

type MapsModule = typeof import('react-native-maps');
let Maps: MapsModule | null = null;
if (Platform.OS !== 'web') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Maps = require('react-native-maps') as MapsModule;
  } catch {
    Maps = null;
  }
}

function NativeMap({ destinations, selectedId, onSelect, height }: Props) {
  const ref = useRef<InstanceType<MapsModule['default']> | null>(null);

  useEffect(() => {
    const d = destinations.find((x) => x.id === selectedId);
    if (d && ref.current) {
      ref.current.animateToRegion(
        { latitude: d.latitude, longitude: d.longitude, latitudeDelta: 0.8, longitudeDelta: 0.8 },
        400,
      );
    }
  }, [selectedId, destinations]);

  if (!Maps) return null;
  const MapView = Maps.default;
  const Marker = Maps.Marker;
  return (
    <View style={[styles.native, { height }]}>
      <MapView ref={ref} style={StyleSheet.absoluteFill} initialRegion={RWANDA_REGION} toolbarEnabled={false}>
        {destinations.map((d) => (
          <Marker
            key={d.id}
            coordinate={{ latitude: d.latitude, longitude: d.longitude }}
            title={d.name}
            description={d.category}
            pinColor={d.id === selectedId ? colors.chocolate : colors.caramel}
            onPress={() => onSelect(d.id)}
          />
        ))}
      </MapView>
    </View>
  );
}

/**
 * Native map (react-native-maps) with a safe fallback. Users can switch to the simple map at any
 * time, and a native failure (e.g. missing map configuration) switches automatically.
 */
export function RwandaMap(props: Props) {
  const height = props.height ?? 260;
  const [simple, setSimple] = useState(Maps === null);

  const fallback = (
    <FallbackMap
      {...props}
      height={height}
      note={Maps === null ? 'Simple map (approximate positions)' : 'Simple map (approximate positions). Tap the globe for the full map.'}
    />
  );

  return (
    <View>
      {simple ? fallback : (
        <MapBoundary fallback={fallback}>
          <NativeMap {...props} height={height} />
        </MapBoundary>
      )}
      {Maps !== null && (
        <Pressable
          onPress={() => setSimple((s) => !s)}
          style={styles.toggle}
          accessibilityRole="button"
          accessibilityLabel={simple ? 'Show full map' : 'Show simple map'}
        >
          <Ionicons name={simple ? 'globe-outline' : 'grid-outline'} size={18} color={colors.chocolate} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  native: { borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.sandstone },
  fallback: { borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.sandstone, borderWidth: 1, borderColor: colors.border },
  grid: StyleSheet.absoluteFill,
  gridH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(168,117,66,0.25)' },
  gridV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(168,117,66,0.25)' },
  marker: { position: 'absolute', alignItems: 'center', width: 96, marginLeft: -48, marginTop: -30 },
  markerLabel: { fontFamily: 'Manrope_700Bold', textAlign: 'center' },
  note: { position: 'absolute', left: 10, bottom: 8 },
  toggle: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(247,240,229,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
