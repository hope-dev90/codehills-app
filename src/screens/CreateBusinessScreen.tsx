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
import type { RootStackParamList } from '../navigation/types';

const TOTAL = 3;

/** Screen 14: three-step business creation with validation and a progress indicator. */
export default function CreateBusinessScreen() {
  const navigation = useRootNav();
  const toast = useToast();
  const { params } = useRoute<RouteProp<RootStackParamList, 'CreateBusiness'>>();
  const { data, saveBusiness } = useApp();
  const editing = params?.mode === 'edit' && !!data.business;

  const [step, setStep] = useState(1);
  const [name, setName] = useState(editing ? data.business!.name : '');
  const [category, setCategory] = useState(editing ? data.business!.category : '');
  const [description, setDescription] = useState(editing ? data.business!.description : '');
  const [imageUri, setImageUri] = useState<string | undefined>(editing ? data.business!.imageUri : undefined);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const validateStep1 = () => {
    const next = {
      name: validateRequired(name, 'a business name', 2),
      category: category ? undefined : 'Choose a category',
      description: validateRequired(description, 'a short description', 10),
    };
    setErrors(next);
    return !Object.values(next).some(Boolean);
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

  const next = () => {
    if (step === 1 && !validateStep1()) return;
    setStep((s) => Math.min(TOTAL, s + 1));
  };

  const save = () => {
    if (!validateStep1()) {
      setStep(1);
      return;
    }
    saveBusiness({ name, category, description, imageUri });
    toast(editing ? 'Business updated' : 'Business saved');
    navigation.replace('BusinessDashboard');
  };

  return (
    <Screen padBottom>
      <ScreenHeader
        title={editing ? 'Edit Business' : 'Create Your Business'}
        subtitle={step === 1 ? 'Tell us about your idea' : step === 2 ? 'Add an image (optional)' : 'Review and save'}
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
              <TextField label="Brief description" placeholder="What do you make or offer?" value={description} onChangeText={setDescription} multiline error={errors.description} />
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
              <AppText variant="caption" color={colors.caramel} style={{ marginVertical: 4, fontFamily: 'Manrope_700Bold' }}>
                {category}
              </AppText>
              <AppText variant="body" color={colors.muted}>
                {description.trim()}
              </AppText>
              <AppText variant="caption" color={colors.muted} style={{ marginTop: 14 }}>
                Saved on this device only. Publishing to CodeHills needs the business backend, which is not connected yet.
              </AppText>
            </View>
          )}

          <View style={styles.actions}>
            {step < TOTAL ? (
              <Button title={step === 2 && !imageUri ? 'Skip for now' : 'Next'} iconRight="arrow-forward" onPress={next} />
            ) : (
              <Button title={editing ? 'Save changes' : 'Save business'} icon="checkmark" onPress={save} />
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
  picker: { height: 220, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.caramel, backgroundColor: colors.white, marginBottom: 10 },
  pickerEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  review: { backgroundColor: colors.white, borderRadius: radius.lg, padding: 16 },
  reviewImg: { height: 160, borderRadius: radius.md, marginBottom: 12 },
  actions: { marginTop: 22 },
});
