import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { getLeaderboard } from '../services/firestore';

type Rank = {
  name: string;
  score: number;
};

export default function LeaderboardScreen({ onBack }: { onBack: () => void }) {
  const [ranks, setRanks] = useState<Rank[]>([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await getLeaderboard();
      setRanks(data);
    } catch (e) {
      console.log('Leaderboard yüklenemedi', e);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Skor Tablosu</Text>
      <FlatList
        data={ranks}
        keyExtractor={(item, idx) => idx.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>#{index + 1} {item.name}</Text>
            <Text style={styles.itemScore}>{item.score}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Veri yok</Text>}
      />
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.buttonText}>Geri</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#0f172a' },
  title: { color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  item: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomColor: '#374151', borderBottomWidth: 1 },
  itemText: { color: 'white' },
  itemScore: { color: '#fbbf24', fontWeight: 'bold' },
  empty: { color: '#94a3b8', textAlign: 'center' },
  backButton: { backgroundColor: '#64748b', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  buttonText: { color: 'white', fontWeight: 'bold' },
});
