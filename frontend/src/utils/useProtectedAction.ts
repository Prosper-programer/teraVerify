import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../store/AuthContext';
import { useLanguage } from '../store/LanguageContext';

export function useProtectedAction() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const requireAuth = (action: () => void) => {
    if (!currentUser) {
      Alert.alert(
        t('auth.requiredTitle'),
        t('auth.requiredDesc'),
        [
          { 
            text: t('profile.signInCreate'), 
            style: 'default',
            onPress: () => router.push('/(auth)/welcome') 
          },
          { text: t('profile.cancel'), style: 'cancel' }
        ]
      );
      return false; // Indicates action was blocked
    }
    
    action();
    return true; // Indicates action was executed
  };

  return { requireAuth, isAuthenticated: !!currentUser };
}
