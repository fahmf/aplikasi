import React, { useEffect, useState, useRef } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
  Alert, Animated, ScrollView
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { getUnitQuestions, startAttempt, submitAnswer, finishAttempt } from '../../../src/lib/api'

interface Choice {
  id: string
  text_ar: string
  sort_order: number
}

interface Question {
  id: string
  type: 'mcq' | 'mcq_harakat' | 'arrange' | 'match'
  prompt_ar: string
  context_ar?: string
  xp_reward: number
  choices: Choice[]
}

type QuizPhase = 'loading' | 'intro' | 'quiz' | 'feedback' | 'result'

export default function QuizScreen() {
  const { unitId } = useLocalSearchParams<{ unitId: string }>()
  const [phase, setPhase] = useState<QuizPhase>('loading')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [attemptId, setAttemptId] = useState<string>('')
  const [hearts, setHearts] = useState(3)
  const [xpGained, setXpGained] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [correctChoiceId, setCorrectChoiceId] = useState<string | null>(null)
  const [result, setResult] = useState<{ score: number; stars: number; xp_earned: number; passed: boolean } | null>(null)
  const [arrangePicks, setArrangePicks] = useState<Choice[]>([])
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now())

  const fadeAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    loadQuiz()
  }, [unitId])

  async function loadQuiz() {
    try {
      const [questionsData, attemptData] = await Promise.all([
        getUnitQuestions(unitId),
        startAttempt(unitId)
      ])

      if (attemptData.error) {
        Alert.alert('خطأ', attemptData.error, [{ text: 'OK', onPress: () => router.back() }])
        return
      }

      setQuestions(questionsData.questions ?? [])
      setAttemptId(attemptData.attempt?.id ?? '')
      setPhase('intro')
    } catch {
      Alert.alert('Error', 'Gagal memuat soal')
      router.back()
    }
  }

  const currentQuestion = questions[currentIndex]

  async function handleAnswer(choiceId: string) {
    if (selected || !currentQuestion || !attemptId) return
    setSelected(choiceId)

    const timeMs = Date.now() - questionStartTime
    const response = { choice_id: choiceId }

    try {
      const feedback = await submitAnswer(attemptId, currentQuestion.id, response, timeMs)
      setIsCorrect(feedback.is_correct)
      setCorrectChoiceId(feedback.correct_choice_id)

      if (feedback.is_correct) {
        setXpGained(prev => prev + currentQuestion.xp_reward)
      } else {
        setHearts(prev => Math.max(0, prev - 1))
      }

      setPhase('feedback')
    } catch {}
  }

  async function handleNext() {
    // Check if out of hearts
    if (!isCorrect && hearts <= 0) {
      const r = await finishAttempt(attemptId)
      setResult(r.result)
      setPhase('result')
      return
    }

    if (currentIndex < questions.length - 1) {
      // Animate to next question
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true })
      ]).start()

      setCurrentIndex(prev => prev + 1)
      setSelected(null)
      setIsCorrect(null)
      setCorrectChoiceId(null)
      setArrangePicks([])
      setQuestionStartTime(Date.now())
      setPhase('quiz')
    } else {
      // Finished all questions
      const r = await finishAttempt(attemptId)
      setResult(r.result)
      setPhase('result')
    }
  }

  if (phase === 'loading') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0d6e5e" />
        <Text style={styles.loadingText}>جارٍ التحميل...</Text>
      </View>
    )
  }

  if (phase === 'intro') {
    return (
      <View style={styles.intro}>
        <Text style={styles.introEmoji}>📖</Text>
        <Text style={styles.introTitle}>وحدة {currentIndex + 1}</Text>
        <Text style={styles.introSubtitle}>{questions.length} soal menanti</Text>
        <View style={styles.introHeartsRow}>
          {[1,2,3].map(i => <Text key={i} style={styles.introHeart}>❤️</Text>)}
        </View>
        <TouchableOpacity style={styles.startBtn} onPress={() => { setQuestionStartTime(Date.now()); setPhase('quiz') }}>
          <Text style={styles.startBtnText}>ابدأ الآن · Mulai</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (phase === 'result' && result) {
    return (
      <View style={styles.result}>
        <Text style={styles.resultEmoji}>
          {result.passed ? '🎉' : '😔'}
        </Text>
        <Text style={styles.resultTitle}>
          {result.passed ? 'أحسنت! · Lulus!' : 'حاول مرة أخرى · Coba Lagi'}
        </Text>
        <Text style={styles.resultScore}>{result.score}%</Text>
        <View style={styles.resultStarsRow}>
          {[1,2,3].map(s => (
            <Text key={s} style={[styles.resultStar, { opacity: s <= result.stars ? 1 : 0.2 }]}>⭐</Text>
          ))}
        </View>
        <Text style={styles.resultXp}>+{result.xp_earned} XP</Text>

        <TouchableOpacity
          style={styles.resultBtn}
          onPress={() => router.back()}
        >
          <Text style={styles.resultBtnText}>
            {result.passed ? 'التالي · Lanjut' : 'رجوع · Kembali'}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (!currentQuestion) return null

  const progress = (currentIndex / questions.length) * 100

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` as `${number}%` }]} />
        </View>
        <View style={styles.heartsRow}>
          {[1,2,3].map(i => (
            <Text key={i} style={[styles.heartIcon, { opacity: i <= hearts ? 1 : 0.2 }]}>❤️</Text>
          ))}
        </View>
      </View>

      {/* XP badge */}
      {xpGained > 0 && (
        <View style={styles.xpBadge}>
          <Text style={styles.xpText}>+{xpGained} XP</Text>
        </View>
      )}

      <ScrollView style={styles.questionArea} contentContainerStyle={styles.questionContent}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Question */}
          <Text style={styles.questionCount}>{currentIndex + 1} / {questions.length}</Text>
          <Text style={styles.questionPrompt}>{currentQuestion.prompt_ar}</Text>

          {currentQuestion.context_ar && (
            <View style={styles.contextBox}>
              <Text style={styles.contextText}>{currentQuestion.context_ar}</Text>
            </View>
          )}

          {/* MCQ choices */}
          {(currentQuestion.type === 'mcq' || currentQuestion.type === 'mcq_harakat') && (
            <View style={styles.choicesGrid}>
              {currentQuestion.choices.map((choice, i) => {
                const isSelected = selected === choice.id
                const isCorrectChoice = correctChoiceId === choice.id

                let bgColor = 'white'
                let borderColor = '#e5dfd2'
                let textColor = '#1a2e28'

                if (phase === 'feedback') {
                  if (isCorrectChoice) { bgColor = '#d4ede5'; borderColor = '#0d6e5e'; textColor = '#0d6e5e' }
                  else if (isSelected && !isCorrectChoice) { bgColor = '#f7d4d4'; borderColor = '#e06a6a'; textColor = '#8a3030' }
                } else if (isSelected) {
                  bgColor = '#f0faf8'; borderColor = '#0d6e5e'
                }

                const letters = ['أ', 'ب', 'ج', 'د']
                return (
                  <TouchableOpacity
                    key={choice.id}
                    style={[styles.choiceBtn, { backgroundColor: bgColor, borderColor }]}
                    onPress={() => phase === 'quiz' && handleAnswer(choice.id)}
                    disabled={phase === 'feedback'}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.choiceLetter, { backgroundColor: borderColor }]}>
                      <Text style={styles.choiceLetterText}>{letters[i] ?? String(i + 1)}</Text>
                    </View>
                    <Text style={[styles.choiceText, { color: textColor }]}>{choice.text_ar}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          )}

          {/* Arrange choices */}
          {currentQuestion.type === 'arrange' && (
            <View>
              {/* Picked order */}
              <View style={styles.arrangeAnswer}>
                {arrangePicks.map((c, i) => (
                  <TouchableOpacity
                    key={c.id}
                    style={styles.arrangeChip}
                    onPress={() => setArrangePicks(prev => prev.filter(p => p.id !== c.id))}
                  >
                    <Text style={styles.arrangeChipText}>{c.text_ar}</Text>
                  </TouchableOpacity>
                ))}
                {arrangePicks.length === 0 && (
                  <Text style={styles.arrangePlaceholder}>اضغط على الكلمات بالترتيب الصحيح</Text>
                )}
              </View>
              {/* Available words */}
              <View style={styles.arrangeOptions}>
                {currentQuestion.choices
                  .filter(c => !arrangePicks.find(p => p.id === c.id))
                  .map(c => (
                    <TouchableOpacity
                      key={c.id}
                      style={styles.arrangeWord}
                      onPress={() => setArrangePicks(prev => [...prev, c])}
                    >
                      <Text style={styles.arrangeWordText}>{c.text_ar}</Text>
                    </TouchableOpacity>
                  ))}
              </View>
              {arrangePicks.length === currentQuestion.choices.length && (
                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={async () => {
                    const response = { order: arrangePicks.map(c => c.id) }
                    const timeMs = Date.now() - questionStartTime
                    const feedback = await submitAnswer(attemptId, currentQuestion.id, response, timeMs)
                    setIsCorrect(feedback.is_correct)
                    if (!feedback.is_correct) setHearts(prev => Math.max(0, prev - 1))
                    else setXpGained(prev => prev + currentQuestion.xp_reward)
                    setPhase('feedback')
                  }}
                >
                  <Text style={styles.submitBtnText}>تحقق · Cek Jawaban</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Feedback bar */}
      {phase === 'feedback' && (
        <View style={[styles.feedbackBar, isCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
          <View>
            <Text style={styles.feedbackTitle}>{isCorrect ? 'ممتاز! · Benar!' : 'خطأ · Salah'}</Text>
            {!isCorrect && hearts <= 0 && (
              <Text style={styles.feedbackSub}>Nyawa habis!</Text>
            )}
          </View>
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
            <Text style={styles.nextBtnText}>
              {hearts <= 0 && !isCorrect ? 'Selesai' : currentIndex < questions.length - 1 ? 'التالي →' : 'Selesai ✓'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fefaf0' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fefaf0' },
  loadingText: { marginTop: 12, color: '#8a9a94', fontSize: 14 },

  // Intro
  intro: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0d6e5e', padding: 32 },
  introEmoji: { fontSize: 72 },
  introTitle: { fontSize: 32, fontWeight: '900', color: 'white', marginTop: 16 },
  introSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.7)', marginTop: 8 },
  introHeartsRow: { flexDirection: 'row', gap: 8, marginTop: 24 },
  introHeart: { fontSize: 28 },
  startBtn: {
    backgroundColor: 'white', borderRadius: 16, paddingHorizontal: 40, paddingVertical: 16,
    marginTop: 40
  },
  startBtnText: { color: '#0d6e5e', fontWeight: '800', fontSize: 18 },

  // Result
  result: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fefaf0', padding: 32 },
  resultEmoji: { fontSize: 80 },
  resultTitle: { fontSize: 24, fontWeight: '900', color: '#1a2e28', marginTop: 16, textAlign: 'center' },
  resultScore: { fontSize: 56, fontWeight: '900', color: '#0d6e5e', marginTop: 8 },
  resultStarsRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  resultStar: { fontSize: 36 },
  resultXp: { fontSize: 20, fontWeight: '800', color: '#f5a623', marginTop: 8 },
  resultBtn: {
    backgroundColor: '#0d6e5e', borderRadius: 16, paddingHorizontal: 48, paddingVertical: 16,
    marginTop: 40
  },
  resultBtnText: { color: 'white', fontWeight: '800', fontSize: 18 },

  // Quiz
  topBar: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingTop: 56, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fefaf0'
  },
  closeBtn: { fontSize: 18, color: '#8a9a94', fontWeight: '700', width: 32 },
  progressBar: { flex: 1, height: 8, backgroundColor: '#e5dfd2', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#0d6e5e', borderRadius: 4 },
  heartsRow: { flexDirection: 'row', gap: 2 },
  heartIcon: { fontSize: 18 },
  xpBadge: {
    alignSelf: 'flex-end', marginRight: 16, marginBottom: 4,
    backgroundColor: '#fceac2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20
  },
  xpText: { fontSize: 12, fontWeight: '700', color: '#8a6d1f' },

  questionArea: { flex: 1 },
  questionContent: { padding: 20, paddingTop: 8 },
  questionCount: { fontSize: 12, color: '#8a9a94', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  questionPrompt: { fontSize: 22, fontWeight: '800', color: '#1a2e28', textAlign: 'right', lineHeight: 36, marginBottom: 16 },
  contextBox: {
    backgroundColor: '#fceac2', borderRadius: 12, padding: 14,
    borderLeftWidth: 3, borderLeftColor: '#f5a623', marginBottom: 20
  },
  contextText: { fontSize: 18, color: '#1a2e28', textAlign: 'right', lineHeight: 30 },

  choicesGrid: { gap: 10 },
  choiceBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 2, borderRadius: 14, padding: 14
  },
  choiceLetter: {
    width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexShrink: 0
  },
  choiceLetterText: { color: 'white', fontWeight: '800', fontSize: 14 },
  choiceText: { flex: 1, fontSize: 16, textAlign: 'right', fontWeight: '600', lineHeight: 24 },

  // Arrange
  arrangeAnswer: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8, minHeight: 60,
    borderWidth: 2, borderColor: '#e5dfd2', borderRadius: 14, padding: 12,
    marginBottom: 16, borderStyle: 'dashed'
  },
  arrangePlaceholder: { color: '#c0c8c4', fontSize: 14, textAlign: 'right', flex: 1 },
  arrangeChip: {
    backgroundColor: '#0d6e5e', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8
  },
  arrangeChipText: { color: 'white', fontWeight: '700', fontSize: 15 },
  arrangeOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end' },
  arrangeWord: {
    backgroundColor: 'white', borderWidth: 2, borderColor: '#e5dfd2',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8
  },
  arrangeWordText: { color: '#1a2e28', fontWeight: '700', fontSize: 15 },
  submitBtn: {
    backgroundColor: '#0d6e5e', borderRadius: 14, padding: 14, alignItems: 'center', marginTop: 20
  },
  submitBtnText: { color: 'white', fontWeight: '800', fontSize: 16 },

  // Feedback
  feedbackBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 32
  },
  feedbackCorrect: { backgroundColor: '#d4ede5' },
  feedbackWrong: { backgroundColor: '#f7d4d4' },
  feedbackTitle: { fontSize: 20, fontWeight: '900', color: '#1a2e28' },
  feedbackSub: { fontSize: 13, color: '#8a3030', marginTop: 2 },
  nextBtn: {
    backgroundColor: '#1a2e28', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10
  },
  nextBtnText: { color: 'white', fontWeight: '800', fontSize: 15 }
})
