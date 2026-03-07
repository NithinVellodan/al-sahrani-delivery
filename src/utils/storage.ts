import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  appLanguage: 'alz_app_language',
  onboardingDone: 'alz_onboarding_done',
  authToken: 'alz_auth_token',
} as const;

export const getAppLanguage = () => AsyncStorage.getItem(KEYS.appLanguage);

export const setAppLanguage = (language: 'en' | 'ar') =>
  AsyncStorage.setItem(KEYS.appLanguage, language);

export const isOnboardingDone = async () => {
  const value = await AsyncStorage.getItem(KEYS.onboardingDone);
  return value === 'true';
};

export const setOnboardingDone = () =>
  AsyncStorage.setItem(KEYS.onboardingDone, 'true');

export const getAuthToken = () => AsyncStorage.getItem(KEYS.authToken);

export const setAuthToken = (token: string) =>
  AsyncStorage.setItem(KEYS.authToken, token);

export const clearAuthToken = () => AsyncStorage.removeItem(KEYS.authToken);
