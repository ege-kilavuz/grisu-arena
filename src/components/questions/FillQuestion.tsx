// src/components/questions/FillQuestion.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { FillQuestion } from '../../question';

type Props = {
  question: FillQuestion;
  onAnswer: (value: string) => void;
};

export default function FillQuestionComp({ question, onAnswer }: Props) {
  const [value, setValue] = useState('');
  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{question.prompt}</Text>
      <TextInput
        style={styles.input}
        placeholder="Cevabınızı girin..."
        value={value}
        onChangeText={setValue}
      />
      <Pressable style={styles.button} onPress={() => onAnswer(value)}>
        <Text style={styles.buttonText}>Gönder</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
  },
  prompt: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  button: {
    backgroundColor: '#4a90e2',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
