import { useState, useEffect } from 'react';
import auth from '@react-native-firebase/auth';

// Admin Auth Hook – sadece e‑mail/şifre ile giriş yapar.
export function useAdminAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await auth().signInWithEmailAndPassword(email, password);
    } catch (e) {
      console.error('Admin giriş hatası:', e);
    }
  };

  const logout = async () => {
    await auth().signOut();
  };

  return { user, loading, login, logout };
}
