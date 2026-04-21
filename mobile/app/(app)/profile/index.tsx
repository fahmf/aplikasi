import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { useAuth } from '../../../src/hooks/useAuth'
import { supabase } from '../../../src/lib/supabase'

type Profile = {
  username: string
  full_name: string | null
  role: string
}

type Progress = {
  lesson_id: string
  total_xp: number
  level: number
  streak_days: number
  current_unit: number
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [progressList, setProgressList] = useState<Progress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      supabase.from('profiles').select('username, full_name, role').eq('id', user.id).single(),
      supabase.from('user_progress').select('lesson_id, total_xp, level, streak_days, current_unit').eq('user_id', user.id)
    ]).then(([{ data: p }, { data: prog }]) => {
      setProfile(p)
      setProgressList(prog ?? [])
      setLoading(false)
    })
  }, [user])

  if (loading) return <View style={styles.centered}><ActivityIndicator color="#0d6e5e" /></View>

  const totalXp = progressList.reduce((s, p) => s + p.total_xp, 0)
  const maxStreak = progressList.reduce((m, p) => Math.max(m, p.streak_days), 0)

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>الملف الشخصي · Profil</Text>
      </View>

      {/* Avatar & name */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(profile?.username ?? 'U')[0].toUpperCase()}</Text>
        </View>
        <Text style={styles.username}>{profile?.username}</Text>
        {profile?.full_name && <Text style={styles.fullName}>{profile.full_name}</Text>}
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{totalXp.toLocaleString()}</Text>
          <Text style={styles.statLbl}>Total XP</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{progressList.length}</Text>
          <Text style={styles.statLbl}>Pelajaran</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>🔥 {maxStreak}</Text>
          <Text style={styles.statLbl}>Streak</Text>
        </View>
      </View>

      {/* Progress per lesson */}
      {progressList.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress Belajar</Text>
          {progressList.map(p => (
            <View key={p.lesson_id} style={styles.progressCard}>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Wahdah {p.current_unit}</Text>
                <Text style={styles.progressXp}>Lv.{p.level} · {p.total_xp} XP</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.min(100, (p.total_xp % 100))}%` as `${number}%` }]} />
              </View>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
        <Text style={styles.logoutText}>تسجيل الخروج · Keluar</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f3ea' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    backgroundColor: '#0d6e5e', paddingTop: 56, paddingBottom: 20,
    paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 16
  },
  backBtn: { padding: 4 },
  backText: { color: 'rgba(255,255,255,0.8)', fontSize: 20 },
  headerTitle: { color: 'white', fontSize: 17, fontWeight: '800' },
  avatarSection: { alignItems: 'center', paddingVertical: 28, backgroundColor: '#0d6e5e' },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12
  },
  avatarText: { fontSize: 32, fontWeight: '900', color: 'white' },
  username: { fontSize: 22, fontWeight: '900', color: 'white' },
  fullName: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  statsRow: {
    flexDirection: 'row', backgroundColor: 'white',
    marginHorizontal: 16, marginTop: 16, borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, elevation: 2
  },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statNum: { fontSize: 20, fontWeight: '900', color: '#0d6e5e' },
  statLbl: { fontSize: 11, color: '#8a9a94', marginTop: 2 },
  section: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1a2e28', marginBottom: 10 },
  progressCard: {
    backgroundColor: 'white', borderRadius: 12, padding: 14, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, elevation: 1
  },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontWeight: '700', color: '#1a2e28', fontSize: 14 },
  progressXp: { color: '#0d6e5e', fontWeight: '600', fontSize: 13 },
  progressBar: { height: 6, backgroundColor: '#f0ece0', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#0d6e5e', borderRadius: 3 },
  logoutBtn: {
    margin: 16, backgroundColor: 'white', borderWidth: 1.5, borderColor: '#e5dfd2',
    borderRadius: 14, padding: 16, alignItems: 'center'
  },
  logoutText: { color: '#e06a6a', fontWeight: '700', fontSize: 15 }
})
