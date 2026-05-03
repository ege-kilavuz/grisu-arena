import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { pickQuestions, type Question } from './src/data/questions';
import QuizDemo from './src/screens/QuizDemo';

const BALL_SIZE = 92;
const GAME_LENGTH = 12;
const STARTING_LIVES = 3;
const RECORDS_KEY = 'grisu-arena-records-v1';
const PLAYER_NAME_KEY = 'grisu-arena-player-name-v1';
const ONLINE_LEADERBOARD_URL = process.env.EXPO_PUBLIC_LEADERBOARD_URL ?? ''; // POST/GET dönen online skor API adresi.

type Basket = 'yes' | 'no';
type Screen = 'home' | 'game' | 'result' | 'records' | 'demo';

type AnswerRecord = {
  question: Question;
  choice: Basket;
  isCorrect: boolean;
  shotQuality: ShotQuality;
  shotMode: ShotMode;
};

type ScoreBurstState = {
  id: number;
  points: number;
  label?: string;
};

type ShotQuality = 'swish' | 'perfect' | 'good' | 'miss';
type ShotMode = 'safe' | 'risk';

type OnlineScore = {
  id: string;
  name: string;
  score: number;
  correct: number;
};

type ScoreRecords = {
  weekly: number;
  monthly: number;
  allTime: number;
  weekKey: string;
  monthKey: string;
};

function getPeriodKeys(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 1);
  const dayMs = 24 * 60 * 60 * 1000;
  const week = Math.ceil((((date.getTime() - start.getTime()) / dayMs) + start.getDay() + 1) / 7);
  return {
    weekKey: `${date.getFullYear()}-W${week}`,
    monthKey: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
  };
}

function emptyRecords(): ScoreRecords {
  return { weekly: 0, monthly: 0, allTime: 0, ...getPeriodKeys() };
}

function normalizeRecords(records: ScoreRecords): ScoreRecords {
  const keys = getPeriodKeys();
  return {
    weekly: records.weekKey === keys.weekKey ? records.weekly : 0,
    monthly: records.monthKey === keys.monthKey ? records.monthly : 0,
    allTime: records.allTime ?? 0,
    ...keys,
  };
}

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
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" />
        <ExpoStatusBar style="light" />
        <GameApp />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}



function getMissionResults(answers: AnswerRecord[], bestStreak: number) {
  const correctCount = answers.filter((item) => item.isCorrect).length;
  const riskyMakes = answers.filter((item) => item.isCorrect && item.shotMode === 'risk' && item.shotQuality !== 'miss').length;
  const swishes = answers.filter((item) => item.isCorrect && item.shotQuality === 'swish').length;
  return [
    { title: 'Bilgi serisi', done: bestStreak >= 4, detail: `${Math.min(bestStreak, 4)}/4 doğru seri` },
    { title: 'Riskli atış', done: riskyMakes >= 2, detail: `${Math.min(riskyMakes, 2)}/2 riskli isabet` },
    { title: 'Temiz basket', done: swishes >= 1, detail: `${Math.min(swishes, 1)}/1 swish` },
    { title: 'Su uzmanı', done: correctCount >= 10, detail: `${correctCount}/10 doğru bilgi` },
  ];
}

function getPlayerRank(score: number, correctCount: number, bestStreak: number) {
  if (correctCount === GAME_LENGTH && bestStreak >= 8) {return 'Efsane Su Koruyucusu 🏆';}
  if (score >= 220) {return 'Arena Şampiyonu 🔥';}
  if (score >= 160) {return 'Gri Su Ustası 💧';}
  if (score >= 100) {return 'Bilinçli Oyuncu 🌱';}
  return 'Çaylak Koruyucu 🐣';
}

function GameApp() {
  const [screen, setScreen] = React.useState<Screen>('home');
  const [demoActive, setDemoActive] = React.useState(false);
  const [questions, setQuestions] = React.useState<Question[]>(() => pickQuestions(GAME_LENGTH));
  const [index, setIndex] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [streak, setStreak] = React.useState(0);
  const [bestStreak, setBestStreak] = React.useState(0);
  const [lives, setLives] = React.useState(STARTING_LIVES);
  const [feedback, setFeedback] = React.useState('Potayı seç, atış gücünü yeşilde yakala.');
  const [answers, setAnswers] = React.useState<AnswerRecord[]>([]);
  const [scoreBurst, setScoreBurst] = React.useState<ScoreBurstState | null>(null);
  const [records, setRecords] = React.useState<ScoreRecords>(() => emptyRecords());
  const [playerName, setPlayerName] = React.useState('');
  const [onlineScores, setOnlineScores] = React.useState<OnlineScore[]>([]);
  const [leaderboardStatus, setLeaderboardStatus] = React.useState('Online sıralama için backend adresi bekleniyor.');

  React.useEffect(() => {
    AsyncStorage.getItem(RECORDS_KEY)
      .then((raw) => {
        if (!raw) {return;}
        setRecords(normalizeRecords(JSON.parse(raw) as ScoreRecords));
      })
      .catch(() => setRecords(emptyRecords()));
    AsyncStorage.getItem(PLAYER_NAME_KEY).then((name) => {
      if (name) {setPlayerName(name);}
    }).catch(() => undefined);
  }, []);

  async function saveRecord(finalScore: number, correctCount: number) {
    const next = normalizeRecords(records);
    const updated = {
      ...next,
      weekly: Math.max(next.weekly, finalScore),
      monthly: Math.max(next.monthly, finalScore),
      allTime: Math.max(next.allTime, finalScore),
    };
    setRecords(updated);
    await AsyncStorage.setItem(RECORDS_KEY, JSON.stringify(updated));
    await submitOnlineScore(finalScore, correctCount);
  }

  async function loadOnlineScores() {
    if (!ONLINE_LEADERBOARD_URL) {return;}
    try {
      const response = await fetch(ONLINE_LEADERBOARD_URL);
      const data = await response.json() as { scores?: OnlineScore[] };
      setOnlineScores(data.scores ?? []);
      setLeaderboardStatus('Online sıralama güncellendi.');
    } catch {
      setLeaderboardStatus('Online sıralama alınamadı; internet/API ayarı kontrol edilmeli.');
    }
  }

  async function submitOnlineScore(finalScore: number, correctCount: number) {
    const name = playerName.trim();
    if (!ONLINE_LEADERBOARD_URL || !name) {return;}
    try {
      const response = await fetch(ONLINE_LEADERBOARD_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.slice(0, 18), score: finalScore, correct: correctCount }),
      });
      const data = await response.json() as { scores?: OnlineScore[] };
      setOnlineScores(data.scores ?? []);
      setLeaderboardStatus('Online skor gönderildi.');
    } catch {
      setLeaderboardStatus('Online skor gönderilemedi; internet/API ayarı kontrol edilmeli.');
    }
  }

  async function savePlayerName(name: string) {
    const clean = name.replace(/[^a-zA-Z0-9ğüşöçıİĞÜŞÖÇ ._-]/g, '').slice(0, 18);
    setPlayerName(clean);
    await AsyncStorage.setItem(PLAYER_NAME_KEY, clean);
  }

  const question = questions[index];

  function startGame() {
    if (!playerName.trim()) {
      setFeedback('Önce oyuncu adını yaz; sonra online sıralama için hazır ol.');
      return;
    }
    setQuestions(pickQuestions(GAME_LENGTH));
    setIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setLives(STARTING_LIVES);
    setAnswers([]);
    setScoreBurst(null);
    setFeedback('Potayı seç, atış gücünü yeşilde yakala.');
    setScreen('game');
  }

  function answerQuestion(choice: Basket, shotQuality: ShotQuality, shotMode: ShotMode) {
    const current = questions[index];
    if (!current) {return;}
    const isCorrect = (choice === 'yes') === current.answer;
    setAnswers((items) => [...items, { question: current, choice, isCorrect, shotQuality, shotMode }]);
    const nextStreak = isCorrect ? streak + 1 : 0;
    const knowledgePoints = isCorrect ? 10 + Math.min(nextStreak * 2, 10) : 0;
    const baseShotBonus = shotQuality === 'swish' ? 12 : shotQuality === 'perfect' ? 8 : shotQuality === 'good' ? 4 : 0;
    const shotBonus = isCorrect ? baseShotBonus * (shotMode === 'risk' ? 2 : 1) : 0;
    const comboBonus = isCorrect && nextStreak >= 3 ? Math.min(Math.floor(nextStreak / 3) * 3, 9) : 0;
    const feverBonus = isCorrect && nextStreak >= 5 ? 6 : 0;
    const earnedPoints = knowledgePoints + shotBonus + comboBonus + feverBonus;
    const finalScore = score + earnedPoints;
    const nextLives = isCorrect ? lives : Math.max(0, lives - 1);

    if (isCorrect) {
      setStreak(nextStreak);
      setBestStreak((b) => Math.max(b, nextStreak));
      setScore(finalScore);
      const shotLabel = shotQuality === 'swish' ? 'Smaç gibi!' : shotQuality === 'perfect' ? 'Mükemmel atış!' : shotQuality === 'good' ? 'İyi atış!' : 'Doğru seçim';
      setScoreBurst({ id: Date.now(), points: earnedPoints, label: shotLabel });
      setFeedback(`${shotBonus ? '🏀' : '✅'} Doğru taraf! ${shotMode === 'risk' && shotBonus ? 'Riskli atış tuttu, bonus ikiye katlandı! ' : ''}${shotBonus ? `+${shotBonus} isabet bonusu aldın. ` : 'Atış kaçtı ama doğru cevaptan temel puan aldın. '}${comboBonus ? `+${comboBonus} seri bonusu! ` : ''}${feverBonus ? '+6 ateş modu! ' : ''}${current.explanation}`);
    } else {
      setStreak(0);
      setLives(nextLives);
      setFeedback(`❌ Yanlış taraf. ${nextLives > 0 ? `${nextLives} can kaldı. ` : 'Canlar bitti; tur tamamlandı. '}${current.explanation}`);
    }

    setTimeout(() => {
      if (index + 1 >= questions.length || nextLives <= 0) {
        saveRecord(finalScore, answers.filter((item) => item.isCorrect).length + (isCorrect ? 1 : 0)).catch(() => undefined);
        setScreen('result');
      } else {setIndex((i) => i + 1);}
    }, 1050);
  }

  if (screen === 'home') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'right', 'bottom', 'left']}>
        <View style={styles.hero}>
          <Text style={styles.logo}>🏀💧</Text>
          <Text style={styles.title}>GriSu Arena</Text>
          <Text style={styles.subtitle}>EVET/HAYIR potasını seç, riskli atışla bonus kovala, gri suyu güvenli kullanmayı öğren.</Text>
          <Mascot message="Ben Damlacan! Önce adını yaz, sonra arena sıralamasında yerini kovala." />
          <TextInput
            value={playerName}
            onChangeText={(text) => savePlayerName(text).catch(() => undefined)}
            placeholder="Oyuncu adın"
            placeholderTextColor="#94a3b8"
            style={styles.nameInput}
            maxLength={18}
          />
          <TouchableOpacity style={[styles.primaryButton, !playerName.trim() && styles.primaryButtonDisabled]} onPress={startGame} disabled={!playerName.trim()}>
            <Text style={styles.primaryButtonText}>{playerName.trim() ? 'Oyuna Başla' : 'Önce adını yaz'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => { setScreen('records'); loadOnlineScores().catch(() => undefined); }}>
            <Text style={styles.secondaryButtonText}>Online Sıralama / Rekorlar</Text>
          </TouchableOpacity>
          <Text style={styles.smallNote}>Eğitim odaklıdır: can sistemi, ateş modu ve riskli atışlar öğrenmeyi daha akıcı yapar.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (screen === 'records') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'right', 'bottom', 'left']}>
        <ScrollView contentContainerStyle={styles.resultContent}>
          <Mascot message="Yerel sıralamayı kaldırdım. Rekorlar cihazda, online sıralama API bağlanınca herkese açık olacak." />
          <Text style={styles.title}>Puan Rekorları</Text>
          <View style={styles.recordsGrid}>
            <RecordCard title="Bu Hafta" value={records.weekly} />
            <RecordCard title="Bu Ay" value={records.monthly} />
            <RecordCard title="Tüm Zamanlar" value={records.allTime} />
          </View>
          <View style={styles.leaderboardCard}>
            <Text style={styles.summaryTitle}>Online Sıralama</Text>
            {onlineScores.length > 0 ? onlineScores.map((entry, rank) => (
              <Text key={entry.id} style={styles.leaderboardItem}>{rank + 1}. {entry.name} — {entry.score} puan · {entry.correct}/{GAME_LENGTH} doğru</Text>
            )) : <Text style={styles.reviewItem}>{leaderboardStatus}</Text>}
          </View>
          <TouchableOpacity style={styles.primaryButton} onPress={startGame}>
            <Text style={styles.primaryButtonText}>Rekor Denemesi Başlat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => setScreen('home')}>
            <Text style={styles.secondaryButtonText}>Ana Menü</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === 'demo') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'right', 'bottom', 'left']}>
        <QuizDemo onBack={() => setScreen('home')} />
      </SafeAreaView>
    );
  }

  if (screen === 'result') {
    const correctCount = answers.filter((item) => item.isCorrect).length;
    const missed = answers.filter((item) => !item.isCorrect).slice(0, 3);
    const resultCard = buildResultCard(answers);
    const playerRank = getPlayerRank(score, correctCount, bestStreak);
    const missions = getMissionResults(answers, bestStreak);

    return (
      <SafeAreaView style={styles.safe} edges={['top', 'right', 'bottom', 'left']}>
        <ScrollView contentContainerStyle={styles.resultContent}>
          <Text style={styles.logo}>🏆</Text>
          <Mascot message={`Tur bitti ${playerName || 'oyuncu'}! Hatalar öğrenme kartına dönüştü; rekorunu kaydettim.`} />
          <Text style={styles.title}>Öğrenme turu bitti!</Text>
          <Text style={styles.resultScore}>{score} puan</Text>
          <Text style={styles.rankBadge}>{playerRank}</Text>
          <Text style={styles.subtitle}>{correctCount}/{answers.length} doğru · En iyi seri: {bestStreak} · Kalan can: {lives}</Text>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>{resultCard.title}</Text>
            <Text style={styles.summaryText}>{resultCard.body}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Arena Görevleri</Text>
            {missions.map((mission) => (
              <Text key={mission.title} style={mission.done ? styles.missionDone : styles.missionPending}>
                {mission.done ? '✅' : '⬜'} {mission.title}: {mission.detail}
              </Text>
            ))}
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
          <TouchableOpacity style={styles.secondaryButton} onPress={() => { setScreen('records'); loadOnlineScores().catch(() => undefined); }}>
            <Text style={styles.secondaryButtonText}>Puan Rekorları</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => setScreen('home')}>
            <Text style={styles.secondaryButtonText}>Ana Menü</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'right', 'bottom', 'left']}>
      <View style={styles.header}>
        <Text style={styles.score}>🏀 {score}</Text>
        <Text style={styles.score}>{'❤️'.repeat(lives)}</Text>
        <Text style={styles.score}>🔥 {streak}</Text>
        <Text style={styles.score}>{index + 1}/{questions.length}</Text>
      </View>
      {scoreBurst ? <ScoreBurst key={scoreBurst.id} points={scoreBurst.points} label={scoreBurst.label} /> : null}
      <Text style={styles.feedback} numberOfLines={2}>{feedback}</Text>
      {question ? <Court question={question} onAnswer={answerQuestion} /> : null}
    </SafeAreaView>
  );
}

function ScoreBurst({ points, label }: { points: number; label?: string }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(18);
  const scale = useSharedValue(0.72);
  const rotate = useSharedValue(-8);

  React.useEffect(() => {
    opacity.value = withSequence(withTiming(1, { duration: 120 }), withTiming(1, { duration: 520 }), withTiming(0, { duration: 260 }));
    translateY.value = withSequence(withSpring(-8), withTiming(-52, { duration: 560 }));
    scale.value = withSequence(withSpring(1.24), withTiming(1, { duration: 360 }));
    rotate.value = withSequence(withTiming(6, { duration: 160 }), withTiming(-3, { duration: 220 }), withTiming(0, { duration: 200 }));
  }, [opacity, rotate, scale, translateY]);

  const burstStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.View pointerEvents="none" style={[styles.scoreBurst, burstStyle]}>
      <View style={styles.scoreBurstSparkOne} />
      <View style={styles.scoreBurstSparkTwo} />
      <View style={styles.scoreBurstSparkThree} />
      <Text style={styles.scoreBurstText}>+{points}</Text>
      {label ? <Text style={styles.scoreBurstLabel}>{label}</Text> : null}
    </Animated.View>
  );
}

function Mascot({ message }: { message: string }) {
  return (
    <View style={styles.mascotCard}>
      <View style={styles.mascotBubble}>
        <Text style={styles.mascotFace}>🦦</Text>
      </View>
      <View style={styles.mascotTextBox}>
        <Text style={styles.mascotName}>Damlacan</Text>
        <Text style={styles.mascotMessage}>{message}</Text>
      </View>
    </View>
  );
}

function RecordCard({ title, value }: { title: string; value: number }) {
  return (
    <View style={styles.recordCard}>
      <Text style={styles.recordTitle}>{title}</Text>
      <Text style={styles.recordValue}>{value}</Text>
      <Text style={styles.recordHint}>en iyi puan</Text>
    </View>
  );
}

function Court({ question, onAnswer }: { question: Question; onAnswer: (choice: Basket, shotQuality: ShotQuality, shotMode: ShotMode) => void }) {
  const [selectedBasket, setSelectedBasket] = React.useState<Basket | null>(null);
  const [isShooting, setIsShooting] = React.useState(false);
  const [shotMode, setShotMode] = React.useState<ShotMode>('safe');
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);
  const power = useSharedValue(0);
  const aim = useSharedValue(0.5);
  const rimPulse = useSharedValue(1);
  const powerDirection = React.useRef(1);
  const aimDirection = React.useRef(1);
  const powerValue = React.useRef(0);
  const aimValue = React.useRef(0.5);
  const wind = React.useMemo(() => (((question.id.length * 37) % 41) - 20) / 100, [question.id]);

  React.useEffect(() => {
    setSelectedBasket(null);
    setIsShooting(false);
    setShotMode('safe');
    x.value = 0;
    y.value = 0;
    scale.value = withSequence(withTiming(0.92, { duration: 90 }), withSpring(1));
    rotate.value = 0;
  }, [question.id, rotate, scale, x, y]);

  React.useEffect(() => {
    rimPulse.value = withRepeat(
      withSequence(withTiming(1.18, { duration: 520 }), withTiming(0.78, { duration: 520 })),
      -1,
      true,
    );
  }, [rimPulse]);

  React.useEffect(() => {
    power.value = 0;
    aim.value = 0.5;
    powerValue.current = 0;
    aimValue.current = 0.5;
    powerDirection.current = 1;
    aimDirection.current = 1;
    const timer = setInterval(() => {
      const powerSpeed = shotMode === 'risk' ? 0.068 : 0.045;
      const aimSpeed = shotMode === 'risk' ? 0.078 : 0.055;
      const next = Math.max(0, Math.min(1, powerValue.current + (powerDirection.current * powerSpeed)));
      if (next >= 1 || next <= 0) {powerDirection.current *= -1;}
      const nextAim = Math.max(0, Math.min(1, aimValue.current + (aimDirection.current * aimSpeed)));
      if (nextAim >= 1 || nextAim <= 0) {aimDirection.current *= -1;}
      powerValue.current = next;
      aimValue.current = nextAim;
      power.value = withTiming(next, { duration: 70 });
      aim.value = withTiming(nextAim, { duration: 70 });
    }, 70);
    return () => clearInterval(timer);
  }, [aim, power, question.id, shotMode]);

  const shoot = () => {
    if (!selectedBasket || isShooting) {return;}
    setIsShooting(true);
    const choice = selectedBasket;
    const targetX = choice === 'yes' ? -104 : 104;
    const currentPower = powerValue.current;
    const currentAim = aimValue.current + wind;
    const powerDistance = Math.abs(currentPower - 0.72);
    const aimDistance = Math.abs(currentAim - 0.5);
    const rimScalePenalty = Math.abs(rimPulse.value - 1);
    const shotDifficulty = powerDistance + aimDistance + (rimScalePenalty * 0.16) + (shotMode === 'risk' ? 0.035 : 0);
    const shotQuality: ShotQuality = shotDifficulty < 0.07 ? 'swish' : shotDifficulty < 0.12 ? 'perfect' : shotDifficulty < 0.22 ? 'good' : 'miss';
    const missDrift = shotQuality === 'miss' ? (currentAim > 0.5 ? 38 : -38) : 0;
    x.value = withTiming(targetX + missDrift, { duration: 520 });
    y.value = withSequence(
      withTiming(-210, { duration: 260 }),
      withTiming(-126, { duration: 260 }),
      withTiming(shotQuality === 'miss' ? -84 : -104, { duration: 120 }),
    );
    scale.value = withSequence(withTiming(0.72, { duration: 320 }), withTiming(0.46, { duration: 260 }));
    rotate.value = withTiming(choice === 'yes' ? -185 : 185, { duration: 620 });
    setTimeout(() => onAnswer(choice, shotQuality, shotMode), 680);
  };

  const ballStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  const powerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: power.value * 196 }],
  }));

  const aimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: aim.value * 196 }],
  }));

  return (
    <View style={styles.court}>
      <View style={styles.questionBoard}>
        <Text style={styles.questionKicker}>Soru</Text>
        <Text style={styles.questionText}>{question.text}</Text>
      </View>
      <View style={styles.courtFloor}>
        <View style={styles.woodStripeOne} />
        <View style={styles.woodStripeTwo} />
        <View style={styles.woodStripeThree} />
        <View style={styles.sideline} />
        <View style={styles.midCourtLine} />
        <View style={styles.paintArea} />
        <View style={styles.freeThrowCircle} />
        <View style={styles.threePointArc} />
        <View style={styles.centerCircle} />
        <View style={styles.freeThrowLine} />
        <View style={styles.baselineLabel}>
          <Text style={styles.baselineText}>GRİSU ARENA</Text>
        </View>
      </View>
      <View style={styles.basketsRow}>
        <BasketCard label="EVET" color="#22c55e" side="left" selected={selectedBasket === 'yes'} pulse={rimPulse} onPress={() => setSelectedBasket('yes')} />
        <BasketCard label="HAYIR" color="#ef4444" side="right" selected={selectedBasket === 'no'} pulse={rimPulse} onPress={() => setSelectedBasket('no')} />
      </View>
      <View style={styles.powerPanel}>
        <Text style={styles.powerLabel}>GÜÇ: yeşilde yakala</Text>
        <View style={styles.powerTrack}>
          <View style={styles.powerSweetSpot} />
          <Animated.View style={[styles.powerNeedle, powerStyle]} />
        </View>
        <Text style={styles.powerLabel}>NİŞAN: rüzgâr {wind > 0 ? 'sağa' : wind < 0 ? 'sola' : 'yok'} {Math.round(Math.abs(wind) * 100)}</Text>
        <View style={styles.aimTrack}>
          <View style={styles.aimSweetSpot} />
          <Animated.View style={[styles.aimNeedle, aimStyle]} />
        </View>
      </View>
      <Animated.View style={[styles.ball, ballStyle]}>
        <View style={styles.ballSeamVertical} />
        <View style={styles.ballSeamHorizontal} />
        <View style={styles.ballSeamLeft} />
        <View style={styles.ballSeamRight} />
      </Animated.View>
      <View style={styles.shotControls}>
        <TouchableOpacity style={[styles.riskButton, shotMode === 'risk' && styles.riskButtonActive]} onPress={() => setShotMode((mode) => mode === 'safe' ? 'risk' : 'safe')} disabled={isShooting}>
          <Text style={styles.riskButtonText}>{shotMode === 'risk' ? 'RİSK x2' : 'GÜVENLİ'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.shootButton, (!selectedBasket || isShooting) && styles.shootButtonDisabled]} onPress={shoot} disabled={!selectedBasket || isShooting}>
          <Text style={styles.shootButtonText}>{selectedBasket ? 'ATIŞ' : 'POTA SEÇ'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function BasketCard({ label, color, side, selected, pulse, onPress }: { label: string; color: string; side: 'left' | 'right'; selected: boolean; pulse: SharedValue<number>; onPress: () => void }) {
  const rimStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: pulse.value }, { scaleY: 0.86 + ((pulse.value - 0.78) * 0.28) }],
  }));

  return (
    <TouchableOpacity activeOpacity={0.86} onPress={onPress} style={[styles.basketSlot, selected && styles.basketSlotSelected]}>
      <View style={[styles.backboard, { borderColor: color }, selected && { backgroundColor: `${color}30` }]}>
        <View style={[styles.backboardSquare, { borderColor: color }]} />
        <Text style={[styles.basketLabel, { color }]}>{label}</Text>
      </View>
      <View style={[styles.rimShadow, side === 'left' ? styles.leftRimShadow : styles.rightRimShadow]} />
      <Animated.View style={[styles.rim, { borderColor: color, backgroundColor: `${color}33` }, rimStyle]}>
        <View style={[styles.rimInner, { borderColor: color }]} />
      </Animated.View>
      <View style={styles.net}>
        <View style={styles.netTop} />
        <View style={styles.netLinesRow}>
          <View style={styles.netLineLeft} />
          <View style={styles.netLine} />
          <View style={styles.netLineRight} />
        </View>
        <View style={styles.netBottom} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f172a' },
  safe: { flex: 1, backgroundColor: '#0f172a', paddingHorizontal: 18, paddingTop: 10, paddingBottom: 10 },
  hero: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  resultContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', gap: 14, paddingVertical: 24 },
  logo: { fontSize: 72 },
  title: { color: 'white', fontSize: 36, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: '#cbd5e1', fontSize: 17, textAlign: 'center', lineHeight: 25 },
  nameInput: { alignSelf: 'stretch', backgroundColor: 'rgba(15,23,42,0.92)', borderColor: 'rgba(45,212,191,0.55)', borderWidth: 2, borderRadius: 18, paddingVertical: 13, paddingHorizontal: 16, color: '#f8fafc', fontSize: 17, fontWeight: '900', textAlign: 'center' },
  primaryButton: { backgroundColor: '#14b8a6', borderRadius: 18, paddingVertical: 15, paddingHorizontal: 28, marginTop: 8 },
  primaryButtonDisabled: { opacity: 0.55, backgroundColor: '#64748b' },
  primaryButtonText: { color: '#042f2e', fontWeight: '900', fontSize: 17 },
  secondaryButton: { borderColor: '#38bdf8', borderWidth: 1, borderRadius: 18, paddingVertical: 13, paddingHorizontal: 24 },
  secondaryButtonText: { color: '#bae6fd', fontWeight: '800', fontSize: 15 },
  smallNote: { color: '#94a3b8', textAlign: 'center', fontSize: 13, lineHeight: 19, paddingHorizontal: 12 },
  resultScore: { color: '#67e8f9', fontSize: 46, fontWeight: '900' },
  rankBadge: { color: '#0f172a', backgroundColor: '#facc15', overflow: 'hidden', borderRadius: 18, paddingVertical: 8, paddingHorizontal: 14, fontWeight: '900', fontSize: 16, textAlign: 'center' },
  summaryCard: { alignSelf: 'stretch', backgroundColor: 'rgba(15,23,42,0.85)', borderColor: 'rgba(45,212,191,0.28)', borderWidth: 1, borderRadius: 22, padding: 16, gap: 8 },
  summaryTitle: { color: '#99f6e4', fontSize: 17, fontWeight: '900' },
  summaryText: { color: '#dbeafe', fontSize: 15, lineHeight: 22 },
  reviewItem: { color: '#dbeafe', fontSize: 14.5, lineHeight: 22 },
  missionDone: { color: '#bbf7d0', fontSize: 14.5, lineHeight: 22, fontWeight: '900' },
  missionPending: { color: '#cbd5e1', fontSize: 14.5, lineHeight: 22, fontWeight: '800' },
  mascotCard: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', gap: 10, backgroundColor: 'rgba(20,184,166,0.12)', borderColor: 'rgba(45,212,191,0.32)', borderWidth: 1, borderRadius: 22, padding: 12 },
  mascotBubble: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#ccfbf1', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#14b8a6' },
  mascotFace: { fontSize: 34 },
  mascotTextBox: { flex: 1, gap: 2 },
  mascotName: { color: '#99f6e4', fontWeight: '900', fontSize: 15 },
  mascotMessage: { color: '#dbeafe', fontSize: 13.5, lineHeight: 19, fontWeight: '700' },
  recordsGrid: { alignSelf: 'stretch', gap: 12 },
  recordCard: { backgroundColor: 'rgba(15,23,42,0.88)', borderColor: 'rgba(251,191,36,0.35)', borderWidth: 1, borderRadius: 20, padding: 16, alignItems: 'center' },
  recordTitle: { color: '#fde68a', fontWeight: '900', fontSize: 16 },
  recordValue: { color: '#67e8f9', fontWeight: '900', fontSize: 42 },
  recordHint: { color: '#94a3b8', fontWeight: '800', fontSize: 12 },
  leaderboardCard: { alignSelf: 'stretch', backgroundColor: 'rgba(15,23,42,0.88)', borderColor: 'rgba(56,189,248,0.35)', borderWidth: 1, borderRadius: 20, padding: 16, gap: 8 },
  leaderboardItem: { color: '#dbeafe', fontSize: 14.5, lineHeight: 22, fontWeight: '800' },
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  score: { color: '#ecfeff', fontWeight: '900', fontSize: 16 },
  scoreBurst: { position: 'absolute', top: 74, alignSelf: 'center', minWidth: 104, height: 58, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: '#facc15', borderWidth: 4, borderColor: '#fff7ed', shadowColor: '#f97316', shadowOpacity: 0.55, shadowOffset: { width: 0, height: 8 }, shadowRadius: 16, elevation: 12, zIndex: 20 },
  scoreBurstText: { color: '#7c2d12', fontSize: 28, fontWeight: '900', letterSpacing: 0.5 },
  scoreBurstLabel: { color: '#7c2d12', fontSize: 10, fontWeight: '900', marginTop: -3 },
  scoreBurstSparkOne: { position: 'absolute', top: -12, left: 8, width: 13, height: 13, borderRadius: 7, backgroundColor: '#fb7185' },
  scoreBurstSparkTwo: { position: 'absolute', right: -10, top: 18, width: 16, height: 16, borderRadius: 8, backgroundColor: '#22c55e' },
  scoreBurstSparkThree: { position: 'absolute', bottom: -9, left: 34, width: 11, height: 11, borderRadius: 6, backgroundColor: '#38bdf8' },
  missionBanner: { color: '#fde68a', backgroundColor: 'rgba(251,191,36,0.12)', borderColor: 'rgba(251,191,36,0.35)', borderWidth: 1, borderRadius: 14, paddingVertical: 7, paddingHorizontal: 10, marginTop: 10, fontSize: 12, fontWeight: '900', textAlign: 'center' },
  feedback: { minHeight: 68, color: '#dbeafe', fontSize: 15, lineHeight: 21, marginTop: 8, marginBottom: 8 },
  court: { flex: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  questionBoard: { position: 'absolute', top: 0, left: 0, right: 0, minHeight: 92, borderRadius: 18, borderWidth: 2, borderColor: 'rgba(251,191,36,0.5)', backgroundColor: 'rgba(15,23,42,0.92)', paddingVertical: 12, paddingHorizontal: 14, zIndex: 4, shadowColor: '#000', shadowOpacity: 0.22, shadowOffset: { width: 0, height: 8 }, shadowRadius: 14, elevation: 6 },
  questionKicker: { color: '#fbbf24', fontSize: 12, fontWeight: '900', letterSpacing: 1.6, marginBottom: 4 },
  questionText: { color: '#f8fafc', fontSize: 16, lineHeight: 22, fontWeight: '900' },
  courtFloor: { position: 'absolute', left: -28, right: -28, top: 108, bottom: 6, borderWidth: 3, borderColor: 'rgba(255,255,255,0.7)', backgroundColor: '#b7791f', borderRadius: 24, overflow: 'hidden' },
  woodStripeOne: { position: 'absolute', left: 0, right: 0, top: 38, height: 36, backgroundColor: 'rgba(146,64,14,0.26)' },
  woodStripeTwo: { position: 'absolute', left: 0, right: 0, top: 118, height: 42, backgroundColor: 'rgba(253,186,116,0.18)' },
  woodStripeThree: { position: 'absolute', left: 0, right: 0, top: 222, height: 38, backgroundColor: 'rgba(146,64,14,0.20)' },
  sideline: { position: 'absolute', left: 16, right: 16, top: 18, bottom: 18, borderWidth: 2, borderColor: 'rgba(255,255,255,0.72)', borderRadius: 18 },
  midCourtLine: { position: 'absolute', top: 205, left: 16, right: 16, height: 2, backgroundColor: 'rgba(255,255,255,0.72)' },
  paintArea: { position: 'absolute', top: 0, alignSelf: 'center', width: 154, height: 156, borderWidth: 3, borderColor: 'rgba(255,255,255,0.8)', borderBottomLeftRadius: 6, borderBottomRightRadius: 6, backgroundColor: 'rgba(14,116,144,0.18)' },
  freeThrowCircle: { position: 'absolute', top: 116, alignSelf: 'center', width: 154, height: 82, borderWidth: 3, borderColor: 'rgba(255,255,255,0.72)', borderRadius: 82 },
  threePointArc: { position: 'absolute', top: 44, alignSelf: 'center', width: 318, height: 214, borderWidth: 3, borderColor: 'rgba(255,255,255,0.62)', borderRadius: 170 },
  centerCircle: { position: 'absolute', top: 156, alignSelf: 'center', width: 122, height: 122, borderWidth: 3, borderColor: 'rgba(255,255,255,0.75)', borderRadius: 70 },
  freeThrowLine: { position: 'absolute', top: 156, alignSelf: 'center', width: 154, height: 3, backgroundColor: 'rgba(255,255,255,0.85)' },
  baselineLabel: { position: 'absolute', top: 278, alignSelf: 'center', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, backgroundColor: 'rgba(15,23,42,0.25)' },
  baselineText: { color: 'rgba(255,255,255,0.58)', fontWeight: '900', letterSpacing: 3, fontSize: 12 },
  basketsRow: { position: 'absolute', top: 112, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', zIndex: 2 },
  basketSlot: { width: 132, height: 158, alignItems: 'center', borderRadius: 20, paddingTop: 2 },
  basketSlotSelected: { backgroundColor: 'rgba(255,255,255,0.16)', borderWidth: 2, borderColor: '#facc15' },
  backboard: { width: 108, height: 66, borderWidth: 4, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(241,245,249,0.18)' },
  backboardSquare: { position: 'absolute', bottom: 10, width: 42, height: 27, borderWidth: 2, borderRadius: 4, opacity: 0.8 },
  basketLabel: { position: 'absolute', top: 7, fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  rimShadow: { position: 'absolute', top: 66, width: 72, height: 17, borderRadius: 40, backgroundColor: 'rgba(0,0,0,0.24)' },
  leftRimShadow: { transform: [{ rotate: '-4deg' }] },
  rightRimShadow: { transform: [{ rotate: '4deg' }] },
  rim: { position: 'absolute', top: 60, width: 78, height: 27, borderWidth: 5, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  rimInner: { width: 56, height: 13, borderWidth: 2, borderRadius: 32, opacity: 0.85 },
  net: { position: 'absolute', top: 82, width: 64, height: 58, alignItems: 'center' },
  netTop: { width: 62, height: 2, backgroundColor: 'rgba(226,232,240,0.9)' },
  netBottom: { position: 'absolute', bottom: 0, width: 34, height: 2, backgroundColor: 'rgba(226,232,240,0.72)' },
  netLinesRow: { flexDirection: 'row', gap: 14, height: 54 },
  netLine: { width: 2, height: 55, backgroundColor: 'rgba(226,232,240,0.72)' },
  netLineLeft: { width: 2, height: 55, backgroundColor: 'rgba(226,232,240,0.72)', transform: [{ rotate: '13deg' }] },
  netLineRight: { width: 2, height: 55, backgroundColor: 'rgba(226,232,240,0.72)', transform: [{ rotate: '-13deg' }] },
  ball: { width: BALL_SIZE, height: BALL_SIZE, borderRadius: BALL_SIZE / 2, backgroundColor: '#f97316', borderWidth: 5, borderColor: '#7c2d12', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.42, shadowOffset: { width: 0, height: 14 }, shadowRadius: 18, elevation: 9, overflow: 'hidden', zIndex: 3 },
  ballSeamVertical: { position: 'absolute', width: 5, height: BALL_SIZE, backgroundColor: 'rgba(67,20,7,0.55)' },
  ballSeamHorizontal: { position: 'absolute', width: BALL_SIZE, height: 5, backgroundColor: 'rgba(67,20,7,0.55)' },
  ballSeamLeft: { position: 'absolute', left: 20, width: 58, height: BALL_SIZE + 28, borderRightWidth: 5, borderColor: 'rgba(67,20,7,0.55)', borderRadius: 80, transform: [{ rotate: '-18deg' }] },
  ballSeamRight: { position: 'absolute', right: 20, width: 58, height: BALL_SIZE + 28, borderLeftWidth: 5, borderColor: 'rgba(67,20,7,0.55)', borderRadius: 80, transform: [{ rotate: '18deg' }] },
  powerPanel: { position: 'absolute', bottom: 72, alignSelf: 'center', width: 260, borderRadius: 18, backgroundColor: 'rgba(15,23,42,0.86)', borderColor: 'rgba(251,191,36,0.42)', borderWidth: 1, padding: 10, zIndex: 4, gap: 5 },
  powerLabel: { color: '#fde68a', fontSize: 11.5, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  powerTrack: { height: 18, borderRadius: 10, backgroundColor: '#7f1d1d', overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(255,255,255,0.65)' },
  powerSweetSpot: { position: 'absolute', left: 132, width: 52, top: 0, bottom: 0, backgroundColor: '#22c55e' },
  powerNeedle: { position: 'absolute', left: 15, top: -4, width: 7, height: 24, borderRadius: 4, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#0f172a' },
  aimTrack: { height: 18, borderRadius: 10, backgroundColor: '#1e3a8a', overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(255,255,255,0.65)' },
  aimSweetSpot: { position: 'absolute', left: 105, width: 50, top: 0, bottom: 0, backgroundColor: '#38bdf8' },
  aimNeedle: { position: 'absolute', left: 15, top: -4, width: 7, height: 24, borderRadius: 4, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#0f172a' },
  shotControls: { position: 'absolute', bottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, zIndex: 7 },
  choiceControls: { position: 'absolute', bottom: 172, flexDirection: 'row', gap: 10, zIndex: 5 },
  choiceButton: { backgroundColor: 'rgba(15,23,42,0.88)', borderColor: 'rgba(255,255,255,0.35)', borderWidth: 1, borderRadius: 16, paddingVertical: 10, paddingHorizontal: 13 },
  choiceButtonSelected: { backgroundColor: '#facc15', borderColor: '#fff7ed' },
  choiceButtonText: { color: '#f8fafc', fontWeight: '900', fontSize: 13 },
  riskButton: { backgroundColor: 'rgba(15,23,42,0.92)', borderRadius: 18, paddingVertical: 12, paddingHorizontal: 18, borderWidth: 2, borderColor: '#fbbf24' },
  riskButtonActive: { backgroundColor: '#f97316', borderColor: '#ffedd5' },
  riskButtonText: { color: '#fff7ed', fontSize: 13, fontWeight: '900', letterSpacing: 0.6 },
  shootButton: { backgroundColor: '#14b8a6', borderRadius: 20, paddingVertical: 13, paddingHorizontal: 30, borderWidth: 3, borderColor: '#ccfbf1' },
  shootButtonDisabled: { opacity: 0.58, backgroundColor: '#64748b' },
  shootButtonText: { color: '#042f2e', fontSize: 17, fontWeight: '900', letterSpacing: 1 },
  throwHint: { position: 'absolute', bottom: 236, color: '#0f172a', fontWeight: '900', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.72)', paddingVertical: 7, paddingHorizontal: 12, borderRadius: 14 },
});
