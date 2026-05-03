import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { getQuestions, deleteQuestion } from '../services/firestore';

type QuestionDoc = {
  id: string;
  prompt: string;
  type: string;
  // Diğer alanlar isteğe bağlı
};

export default function AdminPanel({ onBack}: {onBack: () => void}) {
  const [questions, setQuestions] = useState<QuestionDoc[]>([]);

  useEffect(() => {
    loadQuestions();
  }, []);

  async function loadQuestions() {
    try {
      const data = await getQuestions();
      setQuestions(data);
    } catch (e) {
      console.log('Sorular yüklenemedi', e);
    }
  }

  async function handleDelete(id: string) {
    await deleteQuestion(id);
    loadQuestions();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Soru Yönetimi</Text>
      <FlatList
        data={questions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText} numberOfLines={2}>{item.prompt}</Text>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Text style={styles.delete}>Sil</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Henüz soru yok</Text>}
      />
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.buttonText}>Geri</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#0f172a' },
  title: { color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  item: { backgroundColor: '#1e293b', padding: 12, borderRadius: 8, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemText: { color: 'white', flex: 1, marginRight: 8 },
  delete: { color: '#ef4444', fontWeight: 'bold' },
  backButton: { backgroundColor: '#64748b', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: 'white', fontWeight: 'bold' },
  empty: { color: '#94a3b8', textAlign: 'center', marginTop: 20 },
});