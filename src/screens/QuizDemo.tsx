// src/screens/QuizDemo.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MCQQuestion, FillQuestion, MatchQuestion } from '../components/questions';
import { MCQQuestion as MCQType, FillQuestion as FillType, MatchQuestion as MatchType, evaluateAnswers } from '../question';

const DEMO_QUESTIONS: (MCQType | FillType | MatchType)[] = [
  {
    id: 'demo-mcq-1',
    type: 'mcq',
    prompt: 'Gri su aşağıdakilerden hangisini içerir?',
    options: [
      { label: 'Tuvalet sifonu', value: 'toilet', correct: false },
      { label: 'Duş ve lavabo suları', value: 'shower-sink', correct: true },
      { label: 'İçme suyu', value: 'drinking', correct: false },
      { label: 'Kimyasal atık', value: 'chemical', correct: false },
    ],
  },
  {
    id: 'demo-fill-1',
    type: 'fill',
    prompt: 'Gri suyun bahçe sulamada kullanılması için en az kaç derece filtrasyon önerilir? (Sayı yazınız)',
    answer: '20',
  },
  {
    id: 'demo-match-1',
    type: 'match',
    prompt: 'Aşağıdaki gri su kaynaklarını uygun kullanım alanlarıyla eşleştirin.',
    pairs: [
      { left: 'Duş suyu', right: 'Bahçe sulama' },
      { left: 'Çamaşır suyu', right: 'Tuvalet rezervuarı' },
      { left: 'Mutfak evyesi', right: 'Temizlik (yer silme)' },
    ],
  },
];

export default function QuizDemo({ onBack }: { onBack: () => void }) {
  const [current, setCurrent] = useState(0);
  const [results, setResults] = useState<{ questionId: string; correct: boolean }[]>([]);
  const [finished, setFinished] = useState(false);

  const question = DEMO_QUESTIONS[current];

  const handleAnswer = (payload: any) => {
    const evalResult = evaluateAnswers([question], [{ questionId: question.id, payload }]);
    const correct = evalResult[0]?.correct ?? false;
    const newResults = [...results, { questionId: question.id, correct }];
    setResults(newResults);

    if (current + 1 < DEMO_QUESTIONS.length) {
      setCurrent(current + 1);
    } else {
      setFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrent(0);
    setResults([]);
    setFinished(false);
  };

  const correctCount = results.filter(r => r.correct).length;

  if (finished) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Demo Tamamlandı!</Text>
        <Text style={styles.score}>{correctCount}/{DEMO_QUESTIONS.length} doğru</Text>
        <TouchableOpacity style={styles.button} onPress={handleRestart}>
          <Text style={styles.buttonText}>Tekrar Dene</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.backButton]} onPress={onBack}>
          <Text style={styles.buttonText}>Ana Menü</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.progress}>Soru {current + 1}/{DEMO_QUESTIONS.length}</Text>
      {question.type === 'mcq' && (
        <MCQQuestion question={question} onAnswer={handleAnswer} />
      )}
      {question.type === 'fill' && (
        <FillQuestion question={question} onAnswer={handleAnswer} />
      )}
      {question.type === 'match' && (
        <MatchQuestion question={question} onAnswer={handleAnswer} />
      )}
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.buttonText}>İptal</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  score: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  progress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4a90e2',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 6,
  },
  backButton: {
    backgroundColor: '#888',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
