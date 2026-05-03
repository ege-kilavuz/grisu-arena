// src/components/questions/MCQQuestion.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MCQQuestion } from '../../question';

type Props = {
  question: MCQQuestion;
  onAnswer: (value: string) => void;
};

export default function MCQQuestion({ question, onAnswer }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{question.prompt}</Text>
      {question.options.map((opt) => (
        <Pressable
          key={opt.value}
          style={({ pressed }) => [
            styles.option,
            pressed && styles.optionPressed,
          ]}
          onPress={() => onAnswer(opt.value)}
        >
          <Text style={styles.optionText}>{opt.label}</Text>
        </Pressable>
      ))}
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
  prompt: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  option: {
    padding: 12,
    marginVertical: 4,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  optionPressed: {
    backgroundColor: '#d0e8ff',
  },
  optionText: {
    fontSize: 16,
    color: '#222',
  },
});
