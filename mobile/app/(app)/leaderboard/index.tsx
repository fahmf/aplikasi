import React, { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity
} from 'react-native'
import { router } from 'expo-router'
import { getLeaderboard } from '../../../src/lib/api'

interface LeaderboardEntry {
  rank: number
  user_id: string
  username: string
  full_name: string
  total_xp: number
  level: number
  streak_days: number
}

const rankMedal = ['🥇', '🥈', '🥉']

export default function LeaderboardScreen() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLeaderboard({}).then(data => {
      setEntries(data.leaderboard ?? [])
      setLoading(false)
    })
  }, [])

  const top3 = entries.slice(0, 3)
  const rest = entries.slice(3)

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0d6e5e" />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>لوحة الصدارة · Leaderboard</Text>
      </View>

      {/* Podium top 3 */}
      <View style={styles.podium}>
        {top3.map((entry, i) => (
          <View key={entry.user_id} style={[styles.podiumItem, i === 0 && styles.podiumFirst]}>
            <Text style={styles.podiumMedal}>{rankMedal[i]}</Text>
            <View style={[styles.podiumAvatar, i === 0 && styles.podiumAvatarFirst]}>
              <Text style={styles.podiumAvatarText}>{entry.username[0].toUpperCase()}</Text>
            </View>
            <Text style={styles.podiumName} numberOfLines={1}>{entry.username}</Text>
            <Text style={styles.podiumXp}>{entry.total_xp} XP</Text>
            <Text style={styles.podiumLevel}>Lv.{entry.level}</Text>
          </View>
        ))}
      </View>

      {/* Rest of leaderboard */}
      <View style={styles.listContainer}>
        {rest.map(entry => (
          <View key={entry.user_id} style={styles.listItem}>
            <Text style={styles.listRank}>#{entry.rank}</Text>
            <View style={styles.listAvatar}>
              <Text style={styles.listAvatarText}>{entry.username[0].toUpperCase()}</Text>
            </View>
            <View style={styles.listInfo}>
              <Text style={styles.listUsername}>{entry.username}</Text>
              <Text style={styles.listXp}>{entry.total_xp} XP · Lv.{entry.level}</Text>
            </View>
            {entry.streak_days > 0 && (
              <Text style={styles.listStreak}>🔥 {entry.streak_days}</Text>
            )}
          </View>
        ))}

        {entries.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🏆</Text>
            <Text style={styles.emptyText}>Belum ada data ranking</Text>
          </View>
        )}
      </View>
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
  podium: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end',
    backgroundColor: '#0d6e5e', paddingBottom: 32, paddingHorizontal: 16, gap: 8
  },
  podiumItem: { flex: 1, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: 12 },
  podiumFirst: { backgroundColor: 'rgba(245,166,35,0.2)', paddingTop: 20, marginBottom: -12 },
  podiumMedal: { fontSize: 28, marginBottom: 8 },
  podiumAvatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 6
  },
  podiumAvatarFirst: { width: 58, height: 58, borderRadius: 29, backgroundColor: 'rgba(245,166,35,0.3)' },
  podiumAvatarText: { color: 'white', fontWeight: '900', fontSize: 20 },
  podiumName: { color: 'white', fontWeight: '700', fontSize: 12, textAlign: 'center' },
  podiumXp: { color: '#f5a623', fontWeight: '800', fontSize: 13, marginTop: 2 },
  podiumLevel: { color: 'rgba(255,255,255,0.6)', fontSize: 11 },
  listContainer: { padding: 16, gap: 8 },
  listItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'white', borderRadius: 12, padding: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, elevation: 1
  },
  listRank: { width: 28, textAlign: 'center', fontWeight: '800', color: '#8a9a94', fontSize: 14 },
  listAvatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#0d6e5e',
    alignItems: 'center', justifyContent: 'center'
  },
  listAvatarText: { color: 'white', fontWeight: '900', fontSize: 16 },
  listInfo: { flex: 1 },
  listUsername: { fontWeight: '700', color: '#1a2e28', fontSize: 14 },
  listXp: { color: '#8a9a94', fontSize: 12, marginTop: 1 },
  listStreak: { fontWeight: '700', color: '#f5a623', fontSize: 13 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#8a9a94', fontSize: 15 }
})
