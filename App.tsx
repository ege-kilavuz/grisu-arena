import React from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { pickQuestions, type Question } from './src/data/questions';

const BALL_SIZE = 156;
const GAME_LENGTH = 12;

type Basket = 'yes' | 'no';
type Screen = 'home' | 'game' | 'result' | 'learn';

type AnswerRecord = {
  question: Question;
  choice: Basket;
  isCorrect: boolean;
};

const LEARNING_CARDS = [
  {
    emoji: '💧',
    title: 'Gri su nedir?',
    body: 'Tuvalet dışındaki duş, lavabo ve bazı çamaşır suları gri su olabilir. İçme suyu değildir; kullanım alanı dikkatle seçilir.',
  },
  {
    emoji: '⚠️',
    title: 'Ne zaman risklidir?',
    body: 'Çamaşır suyu, ağır kimyasal, boya, yağ, ilaç, dışkı veya idrar karışmış su güvenli gri su kabul edilmez.',
  },
  {
    emoji: '🌱',
    title: 'Nerede kullanılabilir?',
    body: 'Doğru filtreleme ve hijyenle süs bitkileri, bahçe sulama, rezervuar veya temizlik gibi içme dışı işlerde değerlendirilebilir.',
  },
  {
    emoji: '🧠',
    title: 'Amaç yarış değil, öğrenmek',
    body: 'Puan sadece geri bildirimdir. Asıl hedef güvenli su kullanımı, tasarruf alışkanlığı ve yanlış bilinenleri düzeltmektir.',
  },
];

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar barStyle="light-content" />
      <ExpoStatusBar style="light" />
      <GameApp />
    </GestureHandlerRootView>
  );
}

function GameApp() {
  const [screen, setScreen] = React.useState<Screen>('home');
  const [questions, setQuestions] = React.useState<Question[]>(() => pickQuestions(GAME_LENGTH));
  const [index, setIndex] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [streak, setStreak] = React.useState(0);
  const [bestStreak, setBestStreak] = React.useState(0);
  const [feedback, setFeedback] = React.useState('Topu doğru potaya sürükle.');
  const [answers, setAnswers] = React.useState<AnswerRecord[]>([]);

  const question = questions[index];

  function startGame() {
    setQuestions(pickQuestions(GAME_LENGTH));
    setIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setAnswers([]);
    setFeedback('Topu doğru potaya sürükle.');
    setScreen('game');
  }

  function answerQuestion(choice: Basket) {
    const current = questions[index];
    if (!current) {return;}
    const isCorrect = (choice === 'yes') === current.answer;
    setAnswers((items) => [...items, { question: current, choice, isCorrect }]);
    if (isCorrect) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setBestStreak((b) => Math.max(b, nextStreak));
      setScore((s) => s + 10 + Math.min(nextStreak * 2, 10));
      setFeedback(`✅ Doğru! ${current.explanation}`);
    } else {
      setStreak(0);
      setFeedback(`❌ Yanlış. ${current.explanation}`);
    }

    setTimeout(() => {
      if (index + 1 >= questions.length) {setScreen('result');}
      else {setIndex((i) => i + 1);}
    }, 1050);
  }

  if (screen === 'home') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.hero}>
          <Text style={styles.logo}>🏀💧</Text>
          <Text style={styles.title}>GriSu Arena</Text>
          <Text style={styles.subtitle}>Soru topunu EVET veya HAYIR potasına at, gri suyu güvenli ve doğru kullanmayı öğren.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={startGame}>
            <Text style={styles.primaryButtonText}>Oyuna Başla</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => setScreen('learn')}>
            <Text style={styles.secondaryButtonText}>Gri su nedir?</Text>
          </TouchableOpacity>
          <Text style={styles.smallNote}>Eğitim odaklıdır: 50 soruluk havuzdan her oyunda {GAME_LENGTH} farklı soru seçilir.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (screen === 'learn') {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.learnContent}>
          <Text style={styles.panelTitle}>Gri su nedir?</Text>
          {LEARNING_CARDS.map((card) => (
            <View key={card.title} style={styles.lessonCard}>
              <Text style={styles.lessonEmoji}>{card.emoji}</Text>
              <View style={styles.lessonBody}>
                <Text style={styles.lessonTitle}>{card.title}</Text>
                <Text style={styles.infoText}>{card.body}</Text>
              </View>
            </View>
          ))}
          <Text style={styles.warningBox}>Güvenlik notu: Gri su hiçbir zaman içme suyu gibi düşünülmez. Yerel yönetmelikler ve hijyen kuralları önceliklidir.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={startGame}>
            <Text style={styles.primaryButtonText}>Anladım, oynayalım</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => setScreen('home')}>
            <Text style={styles.secondaryButtonText}>Geri</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === 'result') {
    const correctCount = answers.filter((item) => item.isCorrect).length;
    const missed = answers.filter((item) => !item.isCorrect).slice(0, 3);

    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.resultContent}>
          <Text style={styles.logo}>🏆</Text>
          <Text style={styles.title}>Öğrenme turu bitti!</Text>
          <Text style={styles.resultScore}>{score} puan</Text>
          <Text style={styles.subtitle}>{correctCount}/{answers.length} doğru · En iyi seri: {bestStreak}</Text>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Bugünkü öğrenme özeti</Text>
            <Text style={styles.summaryText}>Gri su içilmez, tuvalet suyu gri su değildir ve kimyasal karışmış sular güvenli kullanım dışıdır.</Text>
          </View>
          {missed.length > 0 ? (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Tekrar bakılacak konular</Text>
              {missed.map((item) => (
                <Text key={item.question.id} style={styles.reviewItem}>• {item.question.explanation}</Text>
              ))}
            </View>
          ) : (
            <Text style={styles.smallNote}>Harika! Bu turda yanlış cevap yok. Yine de güvenlik notlarını tekrar etmek öğrenmeyi pekiştirir.</Text>
          )}
          <TouchableOpacity style={styles.primaryButton} onPress={startGame}>
            <Text style={styles.primaryButtonText}>Yeni Eğitim Turu</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => setScreen('learn')}>
            <Text style={styles.secondaryButtonText}>Bilgi Kartlarına Dön</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => setScreen('home')}>
            <Text style={styles.secondaryButtonText}>Ana Menü</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.score}>Skor: {score}</Text>
        <Text style={styles.score}>Seri: {streak}</Text>
        <Text style={styles.score}>{index + 1}/{questions.length}</Text>
      </View>
      <Text style={styles.feedback} numberOfLines={3}>{feedback}</Text>
      {question ? <Court question={question} onAnswer={answerQuestion} /> : null}
    </SafeAreaView>
  );
}

function Court({ question, onAnswer }: { question: Question; onAnswer: (choice: Basket) => void }) {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  React.useEffect(() => {
    x.value = 0;
    y.value = 0;
    scale.value = withSequence(withTiming(0.92, { duration: 90 }), withSpring(1));
    rotate.value = 0;
  }, [question.id, rotate, scale, x, y]);

  const decide = (dropX: number) => {
    const choice: Basket = dropX < 0 ? 'yes' : 'no';
    const targetX = choice === 'yes' ? -92 : 92;
    x.value = withTiming(targetX, { duration: 360 });
    y.value = withSequence(withTiming(-150, { duration: 170 }), withTiming(120, { duration: 260 }));
    scale.value = withSequence(withTiming(0.82, { duration: 220 }), withTiming(0.35, { duration: 260 }));
    rotate.value = withTiming(choice === 'yes' ? -35 : 35, { duration: 430 });
    setTimeout(() => onAnswer(choice), 520);
    setTimeout(() => {
      x.value = withSpring(0);
      y.value = withSpring(0);
      scale.value = withSpring(1);
      rotate.value = withSpring(0);
    }, 980);
  };

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      x.value = e.translationX;
      y.value = e.translationY;
      rotate.value = e.translationX / 9;
    })
    .onEnd((e) => {
      const strongThrow = Math.abs(e.translationX) > 70 || Math.abs(e.velocityX) > 500;
      if (strongThrow) {runOnJS(decide)(e.translationX + e.velocityX * 0.05);}
      else {
        x.value = withSpring(0);
        y.value = withSpring(0);
        rotate.value = withSpring(0);
      }
    });

  const ballStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <View style={styles.court}>
      <View style={styles.basketsRow}>
        <BasketCard label="EVET" color="#22c55e" side="left" />
        <BasketCard label="HAYIR" color="#ef4444" side="right" />
      </View>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.ball, ballStyle]}>
          <Text style={styles.ballQuestion}>{question.text}</Text>
        </Animated.View>
      </GestureDetector>
      <Text style={styles.throwHint}>Topu sola atarsan EVET, sağa atarsan HAYIR.</Text>
    </View>
  );
}

function BasketCard({ label, color, side }: { label: string; color: string; side: 'left' | 'right' }) {
  return (
    <View style={[styles.basket, { borderColor: color }]}>
      <Text style={[styles.basketRim, { color }]}>{side === 'left' ? '◖' : '◗'}</Text>
      <Text style={[styles.basketLabel, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f172a' },
  safe: { flex: 1, backgroundColor: '#0f172a', paddingHorizontal: 18, paddingTop: 18 },
  hero: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  learnContent: { flexGrow: 1, justifyContent: 'center', gap: 14, paddingVertical: 24 },
  resultContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', gap: 14, paddingVertical: 24 },
  logo: { fontSize: 72 },
  title: { color: 'white', fontSize: 36, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: '#cbd5e1', fontSize: 17, textAlign: 'center', lineHeight: 25 },
  primaryButton: { backgroundColor: '#14b8a6', borderRadius: 18, paddingVertical: 15, paddingHorizontal: 28, marginTop: 8 },
  primaryButtonText: { color: '#042f2e', fontWeight: '900', fontSize: 17 },
  secondaryButton: { borderColor: '#38bdf8', borderWidth: 1, borderRadius: 18, paddingVertical: 13, paddingHorizontal: 24 },
  secondaryButtonText: { color: '#bae6fd', fontWeight: '800', fontSize: 15 },
  smallNote: { color: '#94a3b8', textAlign: 'center', fontSize: 13, lineHeight: 19, paddingHorizontal: 12 },
  panel: { flex: 1, justifyContent: 'center', gap: 14 },
  panelTitle: { color: 'white', fontSize: 30, fontWeight: '900' },
  infoText: { color: '#dbeafe', fontSize: 16, lineHeight: 25 },
  lessonCard: { flexDirection: 'row', gap: 12, backgroundColor: 'rgba(255,255,255,0.07)', borderColor: 'rgba(125,211,252,0.22)', borderWidth: 1, borderRadius: 22, padding: 16 },
  lessonEmoji: { fontSize: 30, width: 38 },
  lessonBody: { flex: 1, gap: 5 },
  lessonTitle: { color: '#67e8f9', fontSize: 17, fontWeight: '900' },
  warningBox: { color: '#fde68a', backgroundColor: 'rgba(245,158,11,0.12)', borderColor: 'rgba(245,158,11,0.35)', borderWidth: 1, borderRadius: 18, padding: 14, fontSize: 14, lineHeight: 21, fontWeight: '700' },
  resultScore: { color: '#67e8f9', fontSize: 46, fontWeight: '900' },
  summaryCard: { alignSelf: 'stretch', backgroundColor: 'rgba(15,23,42,0.85)', borderColor: 'rgba(45,212,191,0.28)', borderWidth: 1, borderRadius: 22, padding: 16, gap: 8 },
  summaryTitle: { color: '#99f6e4', fontSize: 17, fontWeight: '900' },
  summaryText: { color: '#dbeafe', fontSize: 15, lineHeight: 22 },
  reviewItem: { color: '#dbeafe', fontSize: 14.5, lineHeight: 22 },
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  score: { color: '#ecfeff', fontWeight: '900', fontSize: 16 },
  feedback: { minHeight: 68, color: '#dbeafe', fontSize: 15, lineHeight: 21, marginTop: 14, marginBottom: 8 },
  court: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  basketsRow: { position: 'absolute', top: 36, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between' },
  basket: { width: 132, height: 112, borderWidth: 3, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.06)' },
  basketRim: { fontSize: 44, fontWeight: '900', marginBottom: -8 },
  basketLabel: { fontSize: 21, fontWeight: '900' },
  ball: { width: BALL_SIZE, height: BALL_SIZE, borderRadius: BALL_SIZE / 2, backgroundColor: '#f97316', borderWidth: 6, borderColor: '#fed7aa', alignItems: 'center', justifyContent: 'center', padding: 16, shadowColor: '#000', shadowOpacity: 0.35, shadowOffset: { width: 0, height: 12 }, shadowRadius: 18, elevation: 8 },
  ballQuestion: { color: '#431407', fontSize: 13.5, lineHeight: 17, textAlign: 'center', fontWeight: '900' },
  throwHint: { position: 'absolute', bottom: 42, color: '#93c5fd', fontWeight: '800', textAlign: 'center' },
});
