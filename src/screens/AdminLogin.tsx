import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useAdminAuth } from '../hooks/useAdminAuth';

export default function AdminLogin({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAdminAuth();

  const handleLogin = () => {
    login(email, password);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Girişi</Text>
      <TextInput
        style={styles.input}
        placeholder="E‑posta"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Giriş Yap</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.buttonText}>Geri</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#0f172a' },
  title: { color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: 'white', padding: 12, borderRadius: 8, marginBottom: 12 },
  button: { backgroundColor: '#14b8a6', padding: 14, borderRadius: 8, alignItems: 'center' },
  backButton: { backgroundColor: '#64748b', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: 'white', fontWeight: 'bold' },
});
