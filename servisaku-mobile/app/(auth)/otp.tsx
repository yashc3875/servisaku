import React, { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { authApi, MOCK_OTP } from '@/services';
import { useAuthStore, useLocationStore } from '@/stores';
import { profileApi } from '@/services';
import { Button, IconButton, Screen, Text } from '@/components/ui';

const OTP_LENGTH = 6;

/** 6-digit OTP verification with auto-advancing boxes and a resend timer. */
export default function OtpScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { phone } = useLocalSearchParams<{ phone: string }>();

  const setAuth = useAuthStore((s) => s.setAuth);
  const setPending = useAuthStore((s) => s.setPending);
  const initLocation = useLocationStore((s) => s.initFromAddresses);

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [seconds, setSeconds] = useState(30);
  const inputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  const code = digits.join('');

  const handleChange = (text: string, index: number) => {
    setError(null);
    // Support paste of the full code.
    if (text.length > 1) {
      const chars = text.replace(/\D/g, '').slice(0, OTP_LENGTH).split('');
      const next = Array(OTP_LENGTH).fill('');
      chars.forEach((c, i) => (next[i] = c));
      setDigits(next);
      inputs.current[Math.min(chars.length, OTP_LENGTH - 1)]?.focus();
      return;
    }
    const next = [...digits];
    next[index] = text.replace(/\D/g, '');
    setDigits(next);
    if (text && index < OTP_LENGTH - 1) inputs.current[index + 1]?.focus();
  };

  const handleKey = (key: string, index: number) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const verify = async () => {
    if (code.length !== OTP_LENGTH) return;
    Keyboard.dismiss();
    setVerifying(true);
    setError(null);
    try {
      const { session, user, isNewUser } = await authApi.verifyOtp(
        String(phone),
        code,
      );
      if (isNewUser) {
        // Hold the session; finalize after the profile step.
        setPending(session, user);
        router.replace('/(auth)/profile-setup');
      } else {
        const addresses = await profileApi.listAddresses();
        initLocation(addresses);
        await setAuth(session, user); // gate routes to (tabs)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t('auth.wrongCode'));
    } finally {
      setVerifying(false);
    }
  };

  const resend = async () => {
    setDigits(Array(OTP_LENGTH).fill(''));
    setError(null);
    await authApi.requestOtp(String(phone));
    setSeconds(30);
    inputs.current[0]?.focus();
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <IconButton accessibilityLabel={t('common.back')} onPress={() => router.back()}>
        <ArrowLeft size={24} color={theme.colors.text} />
      </IconButton>

      <Text variant="h1" weight="700" style={styles.title}>
        {t('auth.otpTitle')}
      </Text>
      <Text variant="body" color="textSecondary" style={styles.subtitle}>
        {t('auth.otpSubtitle', { phone })}
      </Text>

      <View style={styles.boxes}>
        {digits.map((d, i) => (
          <TextInput
            key={i}
            ref={(r) => {
              inputs.current[i] = r;
            }}
            value={d}
            onChangeText={(text) => handleChange(text, i)}
            onKeyPress={({ nativeEvent }) => handleKey(nativeEvent.key, i)}
            keyboardType="number-pad"
            maxLength={OTP_LENGTH}
            autoFocus={i === 0}
            style={[
              styles.box,
              {
                color: theme.colors.text,
                borderColor: error
                  ? theme.colors.danger
                  : d
                    ? theme.colors.primary
                    : theme.colors.inputBorder,
                backgroundColor: theme.colors.inputBackground,
                borderRadius: theme.radii.md,
              },
            ]}
          />
        ))}
      </View>

      {error ? (
        <Text variant="caption" color="danger" center style={styles.error}>
          {error}
        </Text>
      ) : (
        <Text variant="caption" color="textMuted" center style={styles.error}>
          {t('auth.devHint', { code: MOCK_OTP })}
        </Text>
      )}

      <Button
        label={t('auth.verify')}
        fullWidth
        loading={verifying}
        disabled={code.length !== OTP_LENGTH}
        onPress={verify}
        style={styles.cta}
      />

      <View style={styles.resendRow}>
        {seconds > 0 ? (
          <Text variant="callout" color="textMuted">
            {t('auth.resendIn', { seconds })}
          </Text>
        ) : (
          <Pressable onPress={resend} hitSlop={8}>
            <Text variant="callout" weight="600" style={{ color: theme.colors.primary }}>
              {t('auth.resend')}
            </Text>
          </Pressable>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 16 },
  title: { marginTop: 24, marginBottom: 6 },
  subtitle: { marginBottom: 32 },
  boxes: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  box: {
    flex: 1,
    height: 60,
    borderWidth: 1.5,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
  },
  error: { marginTop: 16 },
  cta: { marginTop: 28 },
  resendRow: { alignItems: 'center', marginTop: 24 },
});
