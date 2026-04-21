import React, { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl
} from 'react-native'
import { router } from 'expo-router'
import { useAuth } from '../../../src/hooks/useAuth'
import { getLessons } from '../../../src/lib/api'

interface Lesson {
  id: string
  code: string
  name_ar: string
  name_id: string
  description_ar: string
  icon: string
  color: string
  level: string
  progress?: {
    current_unit: number
    total_xp: number
    level: number
    streak_days: number
    hearts: number
  } | null
}

const levelLabel: Record<string, string> = {
  mubtadi: 'مبتدئ · Pemula',
  mutawassit: 'متوسط · Menengah',
  mutaqaddim: 'متقدم · Lanjutan'
}

export default function LessonsScreen() {
  const { user, signOut } = useAuth()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => { fetchLessons() }, [])

  async function fetchLessons() {
    try {
      const data = await getLessons()
      setLessons(data.lessons ?? [])
    } catch {}
    setLoading(false)
  }

  async function handleRefresh() {
    setRefreshing(true)
    await fetchLessons()
    setRefreshing(false)
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0d6e5e" />
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>مرحباً 👋</Text>
          <Text style={styles.greetingName}>{user?.email?.split('@')[0]}</Text>
        </View>
        <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>خروج</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>اختر درساً · Pilih Pelajaran</Text>

      <View style={styles.lessonList}>
        {lessons.map(lesson => {
          const progress = lesson.progress
          const xp = progress?.total_xp ?? 0
          const level = progress?.level ?? 1
          const hearts = progress?.hearts ?? 3
          const streak = progress?.streak_days ?? 0

          return (
            <TouchableOpacity
              key={lesson.id}
              style={[styles.lessonCard, { borderLeftColor: lesson.color }]}
              onPress={() => router.push(`/(app)/lessons/${lesson.id}`)}
              activeOpacity={0.8}
            >
              <View style={styles.lessonCardTop}>
                <Text style={styles.lessonIcon}>{lesson.icon}</Text>
                <View style={styles.lessonInfo}>
                  <Text style={styles.lessonNameId}>{lesson.name_id}</Text>
                  <Text style={styles.lessonNameAr}>{lesson.name_ar}</Text>
                  <Text style={styles.lessonLevel}>{levelLabel[lesson.level] ?? lesson.level}</Text>
                </View>
                <View style={styles.lessonStats}>
                  <Text style={styles.statValue}>Lv.{level}</Text>
                  <Text style={styles.statLabel}>{xp} XP</Text>
                </View>
              </View>

              {progress && (
                <View style={styles.lessonCardBottom}>
                  <View style={styles.progressInfo}>
                    <Text style={styles.progressText}>Wahdah {progress.current_unit}</Text>
                    <View style={styles.heartsRow}>
                      {[1,2,3].map(i => (
                        <Text key={i} style={[styles.heart, { opacity: i <= hearts ? 1 : 0.2 }]}>❤️</Text>
                      ))}
                    </View>
                    {streak > 0 && (
                      <Text style={styles.streakBadge}>🔥 {streak} hari</Text>
                    )}
                  </View>
                </View>
              )}

              {!progress && (
                <View style={styles.enrollBadge}>
                  <Text style={styles.enrollText}>Mulai Belajar →</Text>
                </View>
              )}
            </TouchableOpacity>
          )
        })}
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => router.push('/(app)/leaderboard')}>
          <Text style={styles.navIcon}>🏆</Text>
          <Text style={styles.navLabel}>Ranking</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(app)/profile')}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Profil</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f3ea' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f7f3ea' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#0d6e5e', paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20
  },
  greeting: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  greetingName: { color: 'white', fontSize: 20, fontWeight: '800' },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  logoutText: { color: 'white', fontSize: 12, fontWeight: '600' },
  sectionTitle: {
    fontSize: 18, fontWeight: '800', color: '#1a2e28',
    paddingHorizontal: 20, paddingTop: 24, paddingBottom: 12, textAlign: 'right'
  },
  lessonList: { paddingHorizontal: 16, gap: 12 },
  lessonCard: {
    backgroundColor: 'white', borderRadius: 16, padding: 16,
    borderLeftWidth: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2
  },
  lessonCardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  lessonIcon: { fontSize: 36 },
  lessonInfo: { flex: 1 },
  lessonNameId: { fontSize: 17, fontWeight: '800', color: '#1a2e28' },
  lessonNameAr: { fontSize: 16, color: '#4a5c56', textAlign: 'right' },
  lessonLevel: { fontSize: 11, color: '#8a9a94', marginTop: 2 },
  lessonStats: { alignItems: 'flex-end' },
  statValue: { fontSize: 15, fontWeight: '800', color: '#0d6e5e' },
  statLabel: { fontSize: 11, color: '#8a9a94' },
  lessonCardBottom: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f0ece0' },
  progressInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressText: { fontSize: 12, color: '#4a5c56', fontWeight: '600', flex: 1 },
  heartsRow: { flexDirection: 'row', gap: 2 },
  heart: { fontSize: 14 },
  streakBadge: { fontSize: 11, fontWeight: '700', color: '#f5a623' },
  enrollBadge: { marginTop: 10, alignItems: 'flex-end' },
  enrollText: { color: '#0d6e5e', fontSize: 13, fontWeight: '700' },
  bottomNav: {
    flexDirection: 'row', justifyContent: 'space-around',
    backgroundColor: 'white', paddingVertical: 16, marginTop: 24,
    borderTopWidth: 1, borderTopColor: '#e5dfd2'
  },
  navIcon: { fontSize: 24, textAlign: 'center' },
  navLabel: { fontSize: 11, color: '#8a9a94', textAlign: 'center', marginTop: 2 }
})
