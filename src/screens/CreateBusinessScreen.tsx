import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { AppText } from '../components/AppText';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { SmartImage } from '../components/SmartImage';
import { colors, radius } from '../theme';
import { businessCategories } from '../data/business';
import { useRootNav } from '../hooks/useRootNav';
import { useApp } from '../hooks/AppContext';
import { useToast } from '../hooks/ToastContext';
import { validateRequired } from '../utils/validation';
import { generateBusinessDescription } from '../services/gemini';
import type { RootStackParamList } from '../navigation/types';

const TOTAL = 3;

/** Screen 14: three-step business creation with validation and a progress indicator. */
export default function CreateBusinessScreen() {
  const navigation = useRootNav();
  const toast = useToast();
  const { params } = useRoute<RouteProp<RootStackParamList, 'CreateBusiness'>>();
  const { data, saveBusiness } = useApp();
  const editing = params?.mode === 'edit' && !!data.business;
  const incomingMaterials = params?.materials ?? [];

  const [step, setStep] = useState(1);
  const [name, setName] = useState(editing ? data.business!.name : '');
  const [category, setCategory] = useState(editing ? data.business!.category : '');
  const [description, setDescription] = useState(editing ? data.business!.description : '');
  const [imageUri, setImageUri] = useState<string | undefined>(editing ? data.business!.imageUri : undefined);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleGenerate = async () => {
    if (!category) {
      toast('Choose a category first so the AI can tailor the description');
      return;
    }
    setGenerating(true);
    try {
      const result = await generateBusinessDescription(
        incomingMaterials.length > 0 ? incomingMaterials : ['local materials'],
        category,
        name,
      );
      setDescription(result);
    } catch (e: unknown) {
      Alert.alert(
        'Could not generate description',
        e instanceof Error ? e.message : 'Please check your internet connection and try again.',
      );
    } finally {
      setGenerating(false);
    }
  };

  const validateStep1 = (desc: string = description) => {
    const fieldErrors = {
      name: validateRequired(name, 'a business name', 2),
      category: category ? undefined : 'Choose a category',
      description: validateRequired(desc, 'a short description', 10),
    };
    setErrors(fieldErrors);
    return !Object.values(fieldErrors).some(Boolean);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });
      if (!result.canceled && result.assets[0]?.uri) setImageUri(result.assets[0].uri);
    } catch {
      Alert.alert('Could not open photos', 'You can skip this step and add an image later.');
    }
  };

  const next = async () => {
    if (step === 1) {
      const base = {
        name: validateRequired(name, 'a business name', 2),
        category: category ? undefined : 'Choose a category',
      };
      if (Object.values(base).some(Boolean)) {
        setErrors(base);
        return;
      }

      // Next calls the AI immediately: if the owner has not written a description yet,
      // generate one now so the business plan can be built as soon as they continue.
      let desc = description;
      if (!desc.trim()) {
        setGenerating(true);
        try {
          desc = await generateBusinessDescription(
            incomingMaterials.length > 0 ? incomingMaterials : ['local materials'],
            category,
            name,
          );
          setDescription(desc);
        } catch (e: unknown) {
          setGenerating(false);
          Alert.alert(
            'Could not generate your business plan',
            e instanceof Error ? e.message : 'Please check your internet connection and try again.',
          );
          return;
        }
        setGenerating(false);
      }

      if (!validateStep1(desc)) return;
    }
    setStep((s) => Math.min(TOTAL, s + 1));
  };

  const save = async () => {
    if (!validateStep1()) {
      setStep(1);
      return;
    }
    // Wait for the server to persist the business before navigating, otherwise the
    // dashboard mounts before the save finishes and shows the empty state.
    setSaving(true);
    try {
      await saveBusiness({ name, category, description, imageUri });
      toast(editing ? 'Business updated' : 'Generating your business plan…');
      navigation.replace('BusinessDashboard');
    } catch (e: unknown) {
      Alert.alert(
        'Could not save your business',
        e instanceof Error ? e.message : 'Please check your internet connection and try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen padBottom>
      <ScreenHeader
        title={editing ? 'Edit Business' : 'Create Your Business'}
        subtitle={step === 1 ? 'Tell us about your idea' : step === 2 ? 'Add an image (optional)' : 'Review and generate your plan'}
        showBack
        onBack={() => (step > 1 ? setStep((s) => s - 1) : navigation.goBack())}
      />
      <View style={styles.progressWrap} accessibilityLabel={`Step ${step} of ${TOTAL}`}>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${(step / TOTAL) * 100}%` }]} />
        </View>
        <AppText variant="caption" color={colors.muted}>
          {step}/{TOTAL}
        </AppText>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {step === 1 && (
            <>
              <TextField label="Business name" placeholder="e.g. Rwandan Crafts" value={name} onChangeText={setName} error={errors.name} />
              <AppText variant="caption" color={colors.muted} style={styles.label}>
                Business category
              </AppText>
              <View style={styles.cats}>
                {businessCategories.map((c) => (
                  <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />
                ))}
              </View>
              {errors.category ? (
                <AppText variant="caption" color={colors.danger} style={{ marginBottom: 10, marginLeft: 4 }}>
                  {errors.category}
                </AppText>
              ) : null}
              {incomingMaterials.length > 0 && (
                <View style={styles.materialsRow}>
                  <Ionicons name="leaf-outline" size={14} color={colors.caramel} />
                  <AppText variant="caption" color={colors.muted} style={styles.materialsText}>
                    Using: {incomingMaterials.join(', ')}
                  </AppText>
                </View>
              )}
              <View style={styles.descHeader}>
                <AppText variant="caption" color={colors.muted}>
                  Brief description
                </AppText>
                <Pressable
                  onPress={handleGenerate}
                  disabled={generating}
                  accessibilityRole="button"
                  accessibilityLabel="Generate description with AI"
                  style={[styles.aiBtn, generating && styles.aiBtnDisabled]}
                >
                  <Ionicons name="sparkles-outline" size={14} color={generating ? colors.muted : colors.caramel} />
                  <AppText variant="caption" color={generating ? colors.muted : colors.caramel} style={styles.aiBtnText}>
                    {generating ? 'Generating…' : 'Generate with AI'}
                  </AppText>
                </Pressable>
              </View>
              <TextField placeholder="What do you make or offer?" value={description} onChangeText={setDescription} multiline error={errors.description} />
            </>
          )}

          {step === 2 && (
            <>
              <Pressable onPress={pickImage} style={styles.picker} accessibilityRole="button" accessibilityLabel="Choose a business image">
                {imageUri ? (
                  <SmartImage uri={imageUri} style={StyleSheet.absoluteFill} />
                ) : (
                  <View style={styles.pickerEmpty}>
                    <Ionicons name="image-outline" size={34} color={colors.caramel} />
                    <AppText variant="subheading" style={{ marginTop: 8 }}>
                      Choose an image
                    </AppText>
                    <AppText variant="small" color={colors.muted}>
                      Optional. You can add one later.
                    </AppText>
                  </View>
                )}
              </Pressable>
              {imageUri && <Button title="Remove image" variant="ghost" onPress={() => setImageUri(undefined)} />}
            </>
          )}

          {step === 3 && (
            <View style={styles.review}>
              {imageUri ? <SmartImage uri={imageUri} style={styles.reviewImg} /> : null}
              <AppText variant="heading">{name.trim()}</AppText>
              <AppText variant="caption" color={colors.caramel} style={{ marginVertical: 4, fontFamily: 'Outfit_700Bold' }}>
                {category}
              </AppText>
              <AppText variant="body" color={colors.muted}>
                {description.trim()}
              </AppText>
            </View>
          )}

          <View style={styles.actions}>
            {step < TOTAL ? (
              <Button
                title={step === 2 && !imageUri ? 'Skip for now' : 'Next'}
                iconRight="arrow-forward"
                loading={step === 1 && generating}
                onPress={next}
              />
            ) : (
              <Button title={editing ? 'Save changes' : 'Generate business plan'} icon="sparkles" loading={saving} onPress={save} />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  progressWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, marginBottom: 14 },
  track: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.sandstone, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3, backgroundColor: colors.caramel },
  scroll: { paddingHorizontal: 20, paddingBottom: 24 },
  label: { marginBottom: 8, marginLeft: 4 },
  cats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  materialsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12, marginLeft: 2 },
  materialsText: { flex: 1 },
  descHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, marginHorizontal: 4 },
  aiBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: colors.caramel, backgroundColor: 'rgba(168,117,66,0.08)' },
  aiBtnDisabled: { borderColor: colors.border, backgroundColor: 'transparent' },
  aiBtnText: { fontFamily: 'Outfit_600SemiBold' },
  picker: { height: 220, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.caramel, backgroundColor: colors.white, marginBottom: 10 },
  pickerEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  review: { backgroundColor: colors.white, borderRadius: radius.lg, padding: 16 },
  reviewImg: { height: 160, borderRadius: radius.md, marginBottom: 12 },
  actions: { marginTop: 22 },
});