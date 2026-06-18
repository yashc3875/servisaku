import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { UserRound, Mail } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { authApi, profileApi } from '@/services';
import { useAuthStore, useLocationStore } from '@/stores';
import { Button, Input, Screen, Text } from '@/components/ui';

const schema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  email: z.string().email('Enter a valid email').or(z.literal('')).optional(),
});
type FormValues = z.infer<typeof schema>;

/** Profile completion for new users. Finalizes the held session on submit. */
export default function ProfileSetupScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();

  const pending = useAuthStore((s) => s.pending);
  const setAuth = useAuthStore((s) => s.setAuth);
  const initLocation = useLocationStore((s) => s.initFromAddresses);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { name: '', email: '' } });

  const onSubmit = async (values: FormValues) => {
    const parsed = schema.safeParse(values);
    if (!parsed.success || !pending) return;
    setSubmitting(true);
    try {
      const user = await authApi.completeProfile({
        name: values.name.trim(),
        email: values.email?.trim() || undefined,
      });
      const addresses = await profileApi.listAddresses();
      initLocation(addresses);
      await setAuth(pending.session, { ...pending.user, ...user });
      // Gate routes to (tabs) once authenticated.
    } catch {
      setSubmitting(false);
    }
  };

  // Guard: if there's no pending session, send the user back to login.
  if (!pending) {
    router.replace('/(auth)/login');
    return null;
  }

  return (
    <Screen scroll contentStyle={styles.content}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.primarySoft }]}>
          <UserRound size={48} color={theme.colors.primary} strokeWidth={1.8} />
        </View>

        <Text variant="h1" weight="700" center style={styles.title}>
          {t('auth.profileTitle')}
        </Text>
        <Text variant="body" color="textSecondary" center style={styles.subtitle}>
          {t('auth.profileSubtitle')}
        </Text>

        <View style={styles.fields}>
          <Controller
            control={control}
            name="name"
            rules={{ validate: (v) => schema.shape.name.safeParse(v).success || 'Please enter your name' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t('auth.nameLabel')}
                placeholder={t('auth.namePlaceholder')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.name?.message}
                leftSlot={<UserRound size={18} color={theme.colors.textMuted} style={{ marginRight: 8 }} />}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t('auth.emailLabel')}
                placeholder={t('auth.emailPlaceholder')}
                keyboardType="email-address"
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
                leftSlot={<Mail size={18} color={theme.colors.textMuted} style={{ marginRight: 8 }} />}
              />
            )}
          />
        </View>

        <Button
          label={t('auth.finish')}
          fullWidth
          loading={submitting}
          onPress={handleSubmit(onSubmit)}
          style={styles.cta}
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 32 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: { marginBottom: 6 },
  subtitle: { marginBottom: 32 },
  fields: { gap: 18 },
  cta: { marginTop: 32 },
});
