// src/components/questions/MatchQuestion.tsx
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { MatchQuestion as MatchQ } from '../../question';

type Props = {
  question: MatchQ;
  onAnswer: (pairs: { left: string; right: string }[]) => void;
};

export default function MatchQuestionComp({ question, onAnswer }: Props) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<{ left: string; right: string }[]>([]);

  const leftItems = question.pairs.map(p => p.left);
  const rightItems = question.pairs.map(p => p.right);

  const handleMatch = () => {
    if (selectedLeft && selectedRight) {
      const newPair = { left: selectedLeft, right: selectedRight };
      const updated = [...matchedPairs, newPair];
      setMatchedPairs(updated);
      setSelectedLeft(null);
      setSelectedRight(null);
      // If all pairs matched, call onAnswer
      if (updated.length === question.pairs.length) {
        onAnswer(updated);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{question.prompt}</Text>
      <View style={styles.columns}>
        <View style={styles.column}>
          <Text style={styles.columnTitle}>Sol</Text>
          {leftItems.map(item => (
            <Pressable
              key={item}
              style={[
                styles.item,
                selectedLeft === item && styles.selected,
                matchedPairs.find(p => p.left === item) && styles.matched,
              ]}
              onPress={() => setSelectedLeft(item)}
            >
              <Text>{item}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.column}>
          <Text style={styles.columnTitle}>Sağ</Text>
          {rightItems.map(item => (
            <Pressable
              key={item}
              style={[
                styles.item,
                selectedRight === item && styles.selected,
                matchedPairs.find(p => p.right === item) && styles.matched,
              ]}
              onPress={() => setSelectedRight(item)}
            >
              <Text>{item}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <Pressable style={styles.matchButton} onPress={handleMatch}>
        <Text style={styles.buttonText}>Eşleştir</Text>
      </Pressable>
      <Text style={styles.progress}>
        {matchedPairs.length}/{question.pairs.length} eşleşti
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 12, padding: 16, backgroundColor: '#fff', borderRadius: 8, elevation: 2 },
  prompt: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#333' },
  columns: { flexDirection: 'row', justifyContent: 'space-between' },
  column: { flex: 1, marginHorizontal: 4 },
  columnTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  item: { padding: 8, marginVertical: 4, backgroundColor: '#f0f0f0', borderRadius: 4, alignItems: 'center' },
  selected: { backgroundColor: '#cce5ff' },
  matched: { backgroundColor: '#d4edda', opacity: 0.6 },
  matchButton: { marginTop: 12, backgroundColor: '#4a90e2', padding: 10, borderRadius: 6, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  progress: { marginTop: 8, textAlign: 'center', fontSize: 12, color: '#666' },
});
