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
type Screen = 'home' | 'game' | 'result';

type AnswerRecord = {
  question: Question;
  choice: Basket;
  isCorrect: boolean;
};

function buildResultCard(answers: AnswerRecord[]) {
  const missed = answers.filter((item) => !item.isCorrect);
  if (missed.length === 0) {
    return {
      title: 'Bilgi kartı: Güvenli kullanım',
      body: 'Bu turda hata yapmadın. Yine de ana kuralı unutma: gri su içme suyu değildir; tuvalet suyu ve kimyasal karışmış sular güvenli gri su sayılmaz.',
    };
  }

  const categoryCounts = missed.reduce<Record<Question['category'], number>>((acc, item) => {
    acc[item.question.category] += 1;
    return acc;
  }, { 'gri-su': 0, guvenlik: 0, tasarruf: 0, 'yeniden-kullanim': 0, 'yanlis-bilinen': 0 });
  const focusCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as Question['category'];

  if (focusCategory === 'guvenlik') {
    return {
      title: 'Bilgi kartı: Güvenlik',
      body: 'Hataların güvenlik tarafında yoğunlaştı. Çamaşır suyu, ağır kimyasal, yağ, ilaç, boya veya tuvalet atığı karışan sular gri su olarak kullanılmamalıdır.',
    };
  }

  if (focusCategory === 'yeniden-kullanim') {
    return {
      title: 'Bilgi kartı: Yeniden kullanım',
      body: 'Gri su doğru filtreleme ve hijyenle bahçe, süs bitkisi, rezervuar veya temizlik gibi içme dışı alanlarda değerlendirilebilir. Yenilebilir kısımlara temas ettirilmez.',
    };
  }

  if (focusCategory === 'tasarruf') {
    return {
      title: 'Bilgi kartı: Su tasarrufu',
      body: 'Tasarruf sadece büyük sistemlerle olmaz. Kısa duş, kapalı musluk, tam dolu makine ve kaçakları onarma günlük tüketimi ciddi azaltır.',
    };
  }

  if (focusCategory === 'yanlis-bilinen') {
    return {
      title: 'Bilgi kartı: Yanlış bilinenler',
      body: 'Berrak görünen her su güvenli değildir. Gri su sistemi israfı haklı çıkarmaz; amaç suyu bilinçli ve doğru yerde tekrar kullanmaktır.',
    };
  }

  return {
    title: 'Bilgi kartı: Gri su nedir?',
    body: 'Gri su, tuvalet dışındaki duş, lavabo ve bazı çamaşır sularıdır. İçme suyu değildir; doğru kullanım alanı ve hijyen kuralları önemlidir.',
  };
}

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
          <Text style={styles.smallNote}>Eğitim odaklıdır: geniş soru havuzundan her oyunda {GAME_LENGTH} farklı soru seçilir.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (screen === 'result') {
    const correctCount = answers.filter((item) => item.isCorrect).length;
    const missed = answers.filter((item) => !item.isCorrect).slice(0, 3);
    const resultCard = buildResultCard(answers);

    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.resultContent}>
          <Text style={styles.logo}>🏆</Text>
          <Text style={styles.title}>Öğrenme turu bitti!</Text>
          <Text style={styles.resultScore}>{score} puan</Text>
          <Text style={styles.subtitle}>{correctCount}/{answers.length} doğru · En iyi seri: {bestStreak}</Text>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>{resultCard.title}</Text>
            <Text style={styles.summaryText}>{resultCard.body}</Text>
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
    const targetX = choice === 'yes' ? -104 : 104;
    x.value = withTiming(targetX, { duration: 520 });
    y.value = withSequence(
      withTiming(-210, { duration: 260 }),
      withTiming(-126, { duration: 260 }),
      withTiming(-100, { duration: 120 }),
    );
    scale.value = withSequence(withTiming(0.72, { duration: 320 }), withTiming(0.46, { duration: 260 }));
    rotate.value = withTiming(choice === 'yes' ? -185 : 185, { duration: 620 });
    setTimeout(() => onAnswer(choice), 680);
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
      <View style={styles.courtFloor}>
        <View style={styles.paintArea} />
        <View style={styles.centerCircle} />
        <View style={styles.freeThrowLine} />
      </View>
      <View style={styles.basketsRow}>
        <BasketCard label="EVET" color="#22c55e" side="left" />
        <BasketCard label="HAYIR" color="#ef4444" side="right" />
      </View>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.ball, ballStyle]}>
          <View style={styles.ballSeamVertical} />
          <View style={styles.ballSeamHorizontal} />
          <View style={styles.ballSeamLeft} />
          <View style={styles.ballSeamRight} />
          <Text style={styles.ballQuestion}>{question.text}</Text>
        </Animated.View>
      </GestureDetector>
      <Text style={styles.throwHint}>Topu sola atarsan EVET, sağa atarsan HAYIR.</Text>
    </View>
  );
}

function BasketCard({ label, color, side }: { label: string; color: string; side: 'left' | 'right' }) {
  return (
    <View style={styles.basketSlot}>
      <View style={[styles.backboard, { borderColor: color }]}>
        <View style={[styles.backboardSquare, { borderColor: color }]} />
        <Text style={[styles.basketLabel, { color }]}>{label}</Text>
      </View>
      <View style={[styles.rimShadow, side === 'left' ? styles.leftRimShadow : styles.rightRimShadow]} />
      <View style={[styles.rim, { borderColor: color, backgroundColor: `${color}33` }]}>
        <View style={[styles.rimInner, { borderColor: color }]} />
      </View>
      <View style={styles.net}>
        <View style={styles.netTop} />
        <View style={styles.netLinesRow}>
          <View style={styles.netLineLeft} />
          <View style={styles.netLine} />
          <View style={styles.netLineRight} />
        </View>
        <View style={styles.netBottom} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f172a' },
  safe: { flex: 1, backgroundColor: '#0f172a', paddingHorizontal: 18, paddingTop: 18 },
  hero: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  resultContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', gap: 14, paddingVertical: 24 },
  logo: { fontSize: 72 },
  title: { color: 'white', fontSize: 36, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: '#cbd5e1', fontSize: 17, textAlign: 'center', lineHeight: 25 },
  primaryButton: { backgroundColor: '#14b8a6', borderRadius: 18, paddingVertical: 15, paddingHorizontal: 28, marginTop: 8 },
  primaryButtonText: { color: '#042f2e', fontWeight: '900', fontSize: 17 },
  secondaryButton: { borderColor: '#38bdf8', borderWidth: 1, borderRadius: 18, paddingVertical: 13, paddingHorizontal: 24 },
  secondaryButtonText: { color: '#bae6fd', fontWeight: '800', fontSize: 15 },
  smallNote: { color: '#94a3b8', textAlign: 'center', fontSize: 13, lineHeight: 19, paddingHorizontal: 12 },
  resultScore: { color: '#67e8f9', fontSize: 46, fontWeight: '900' },
  summaryCard: { alignSelf: 'stretch', backgroundColor: 'rgba(15,23,42,0.85)', borderColor: 'rgba(45,212,191,0.28)', borderWidth: 1, borderRadius: 22, padding: 16, gap: 8 },
  summaryTitle: { color: '#99f6e4', fontSize: 17, fontWeight: '900' },
  summaryText: { color: '#dbeafe', fontSize: 15, lineHeight: 22 },
  reviewItem: { color: '#dbeafe', fontSize: 14.5, lineHeight: 22 },
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  score: { color: '#ecfeff', fontWeight: '900', fontSize: 16 },
  feedback: { minHeight: 68, color: '#dbeafe', fontSize: 15, lineHeight: 21, marginTop: 14, marginBottom: 8 },
  court: { flex: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  courtFloor: { position: 'absolute', left: -24, right: -24, top: 110, bottom: 8, borderTopWidth: 2, borderColor: 'rgba(125,211,252,0.18)', backgroundColor: 'rgba(15,118,110,0.10)', borderTopLeftRadius: 42, borderTopRightRadius: 42 },
  paintArea: { position: 'absolute', top: 0, alignSelf: 'center', width: 158, height: 156, borderWidth: 2, borderColor: 'rgba(251,146,60,0.24)', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  centerCircle: { position: 'absolute', top: 154, alignSelf: 'center', width: 210, height: 106, borderWidth: 2, borderColor: 'rgba(125,211,252,0.15)', borderRadius: 110 },
  freeThrowLine: { position: 'absolute', top: 154, alignSelf: 'center', width: 166, height: 2, backgroundColor: 'rgba(251,146,60,0.22)' },
  basketsRow: { position: 'absolute', top: 18, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', zIndex: 1 },
  basketSlot: { width: 142, height: 174, alignItems: 'center' },
  backboard: { width: 118, height: 76, borderWidth: 4, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(241,245,249,0.13)' },
  backboardSquare: { position: 'absolute', bottom: 10, width: 42, height: 27, borderWidth: 2, borderRadius: 4, opacity: 0.8 },
  basketLabel: { position: 'absolute', top: 8, fontSize: 17, fontWeight: '900', letterSpacing: 1 },
  rimShadow: { position: 'absolute', top: 75, width: 76, height: 18, borderRadius: 40, backgroundColor: 'rgba(0,0,0,0.22)' },
  leftRimShadow: { transform: [{ rotate: '-4deg' }] },
  rightRimShadow: { transform: [{ rotate: '4deg' }] },
  rim: { position: 'absolute', top: 68, width: 82, height: 28, borderWidth: 5, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  rimInner: { width: 56, height: 13, borderWidth: 2, borderRadius: 32, opacity: 0.85 },
  net: { position: 'absolute', top: 90, width: 66, height: 60, alignItems: 'center' },
  netTop: { width: 62, height: 2, backgroundColor: 'rgba(226,232,240,0.9)' },
  netBottom: { position: 'absolute', bottom: 0, width: 34, height: 2, backgroundColor: 'rgba(226,232,240,0.72)' },
  netLinesRow: { flexDirection: 'row', gap: 14, height: 54 },
  netLine: { width: 2, height: 55, backgroundColor: 'rgba(226,232,240,0.72)' },
  netLineLeft: { width: 2, height: 55, backgroundColor: 'rgba(226,232,240,0.72)', transform: [{ rotate: '13deg' }] },
  netLineRight: { width: 2, height: 55, backgroundColor: 'rgba(226,232,240,0.72)', transform: [{ rotate: '-13deg' }] },
  ball: { width: BALL_SIZE, height: BALL_SIZE, borderRadius: BALL_SIZE / 2, backgroundColor: '#f97316', borderWidth: 6, borderColor: '#7c2d12', alignItems: 'center', justifyContent: 'center', padding: 17, shadowColor: '#000', shadowOpacity: 0.38, shadowOffset: { width: 0, height: 14 }, shadowRadius: 18, elevation: 9, overflow: 'hidden', zIndex: 3 },
  ballSeamVertical: { position: 'absolute', width: 5, height: BALL_SIZE, backgroundColor: 'rgba(67,20,7,0.55)' },
  ballSeamHorizontal: { position: 'absolute', width: BALL_SIZE, height: 5, backgroundColor: 'rgba(67,20,7,0.55)' },
  ballSeamLeft: { position: 'absolute', left: 20, width: 58, height: BALL_SIZE + 28, borderRightWidth: 5, borderColor: 'rgba(67,20,7,0.55)', borderRadius: 80, transform: [{ rotate: '-18deg' }] },
  ballSeamRight: { position: 'absolute', right: 20, width: 58, height: BALL_SIZE + 28, borderLeftWidth: 5, borderColor: 'rgba(67,20,7,0.55)', borderRadius: 80, transform: [{ rotate: '18deg' }] },
  ballQuestion: { color: '#fff7ed', fontSize: 13, lineHeight: 16.5, textAlign: 'center', fontWeight: '900', textShadowColor: 'rgba(67,20,7,0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  throwHint: { position: 'absolute', bottom: 42, color: '#93c5fd', fontWeight: '800', textAlign: 'center' },
});
