import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTheme } from '@/theme';
import { authApi } from '@/services';
import { Button, Input, Screen, Text } from '@/components/ui';
import { Logo } from '@/components/brand/Logo';

const schema = z.object({
  phone: z
    .string()
    .min(9, 'Enter a valid phone number')
    .max(11, 'Enter a valid phone number')
    .regex(/^[0-9\s-]+$/, 'Digits only'),
});
type FormValues = z.infer<typeof schema>;

/** Phone-number entry. Sends a (mock) OTP then advances to verification. */
export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { phone: '' } });

  const onSubmit = async (values: FormValues) => {
    const parsed = schema.safeParse(values);
    if (!parsed.success) return;
    setApiError(null);
    setSubmitting(true);
    const fullPhone = `+60 ${values.phone.trim()}`;
    try {
      await authApi.requestOtp(fullPhone);
      router.push({ pathname: '/(auth)/otp', params: { phone: fullPhone } });
    } catch (e) {
      setApiError(e instanceof Error ? e.message : 'Failed to send code');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Logo size={52} showWordmark />
        </View>

        <Text variant="h1" weight="700" style={styles.title}>
          {t('auth.loginTitle')}
        </Text>
        <Text variant="body" color="textSecondary" style={styles.subtitle}>
          {t('auth.loginSubtitle')}
        </Text>

        <Controller
          control={control}
          name="phone"
          rules={{
            validate: (v) => schema.shape.phone.safeParse(v).success || 'Enter a valid phone number',
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t('auth.phoneLabel')}
              placeholder={t('auth.phonePlaceholder')}
              keyboardType="phone-pad"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.phone?.message ?? apiError ?? undefined}
              leftSlot={
                <View style={styles.prefix}>
                  <Text variant="body" weight="600">
                    🇲🇾 +60
                  </Text>
                  <View style={[styles.prefixDivider, { backgroundColor: theme.colors.border }]} />
                </View>
              }
            />
          )}
        />

        <Button
          label={t('auth.sendCode')}
          fullWidth
          loading={submitting}
          onPress={handleSubmit(onSubmit)}
          style={styles.cta}
        />

        <Text variant="caption" color="textMuted" center style={styles.terms}>
          {t('auth.termsNote')}
        </Text>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 32 },
  header: { marginBottom: 40 },
  title: { marginBottom: 6 },
  subtitle: { marginBottom: 28 },
  prefix: { flexDirection: 'row', alignItems: 'center', marginRight: 10 },
  prefixDivider: { width: 1, height: 22, marginLeft: 10 },
  cta: { marginTop: 28 },
  terms: { marginTop: 20, paddingHorizontal: 16 },
});
