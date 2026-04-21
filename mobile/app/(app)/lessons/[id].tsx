import React, { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { getLessonUnits } from '../../../src/lib/api'

interface Unit {
  id: string
  number: number
  title_ar: string
  title_id: string
  is_checkpoint: boolean
  passing_score: number
  xp_reward: number
  locked: boolean
  best_stars: number
  completed: boolean
}

export default function LessonDashboardScreen() {
  const { id: lessonId } = useLocalSearchParams<{ id: string }>()
  const [units, setUnits] = useState<Unit[]>([])
  const [currentUnit, setCurrentUnit] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (lessonId) fetchUnits()
  }, [lessonId])

  async function fetchUnits() {
    try {
      const data = await getLessonUnits(lessonId)
      setUnits(data.units ?? [])
      setCurrentUnit(data.current_unit ?? 1)
    } catch {}
    setLoading(false)
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0d6e5e" />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← رجوع</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>الوحدات · Wahdah</Text>
      </View>

      {/* Progress path */}
      <View style={styles.path}>
        {units.map((unit, index) => (
          <View key={unit.id}>
            {/* Connector line */}
            {index > 0 && (
              <View style={[styles.connector, unit.locked && styles.connectorLocked]} />
            )}

            {/* Unit node */}
            <TouchableOpacity
              style={[
                styles.unitNode,
                unit.completed && styles.unitNodeCompleted,
                unit.locked && styles.unitNodeLocked,
                !unit.completed && !unit.locked && styles.unitNodeActive,
                unit.is_checkpoint && styles.unitNodeCheckpoint
              ]}
              onPress={() => !unit.locked && router.push(`/(app)/quiz/${unit.id}`)}
              disabled={unit.locked}
              activeOpacity={0.8}
            >
              <View style={styles.unitNodeInner}>
                {unit.is_checkpoint ? (
                  <Text style={styles.checkpointIcon}>🎯</Text>
                ) : unit.locked ? (
                  <Text style={styles.lockIcon}>🔒</Text>
                ) : unit.completed ? (
                  <View style={styles.starsRow}>
                    {[1,2,3].map(s => (
                      <Text key={s} style={{ fontSize: 14, opacity: s <= unit.best_stars ? 1 : 0.2 }}>⭐</Text>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.activeIcon}>▶</Text>
                )}
              </View>

              <View style={styles.unitInfo}>
                <Text style={[styles.unitNumber, unit.locked && styles.textMuted]}>
                  {unit.is_checkpoint ? 'Checkpoint' : `Wahdah ${unit.number}`}
                </Text>
                <Text style={[styles.unitTitle, unit.locked && styles.textMuted]} numberOfLines={1}>
                  {unit.title_ar}
                </Text>
                <Text style={[styles.unitXp, unit.locked && styles.textMuted]}>
                  +{unit.xp_reward} XP
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f3ea' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    backgroundColor: '#0d6e5e', paddingTop: 56, paddingBottom: 20,
    paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 16
  },
  backBtn: { padding: 4 },
  backText: { color: 'rgba(255,255,255,0.8)', fontSize: 16 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: '800' },
  path: { padding: 20, paddingTop: 16 },
  connector: { width: 3, height: 24, backgroundColor: '#0d6e5e', marginLeft: 30, opacity: 0.4 },
  connectorLocked: { opacity: 0.15 },
  unitNode: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: 'white', borderRadius: 16, padding: 14,
    borderWidth: 2, borderColor: '#0d6e5e',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2
  },
  unitNodeCompleted: { borderColor: '#f5a623', backgroundColor: '#fffbf0' },
  unitNodeActive: { borderColor: '#0d6e5e', backgroundColor: '#f0faf8' },
  unitNodeLocked: { borderColor: '#e5dfd2', backgroundColor: '#faf9f5', opacity: 0.7 },
  unitNodeCheckpoint: { borderColor: '#f5a623', backgroundColor: '#fff9ed' },
  unitNodeInner: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: '#0d6e5e',
    alignItems: 'center', justifyContent: 'center'
  },
  checkpointIcon: { fontSize: 22 },
  lockIcon: { fontSize: 22 },
  activeIcon: { fontSize: 18, color: 'white', fontWeight: '900' },
  starsRow: { flexDirection: 'row' },
  unitInfo: { flex: 1 },
  unitNumber: { fontSize: 11, fontWeight: '700', color: '#8a9a94', textTransform: 'uppercase', letterSpacing: 0.5 },
  unitTitle: { fontSize: 16, fontWeight: '800', color: '#1a2e28', marginTop: 2, textAlign: 'right' },
  unitXp: { fontSize: 12, color: '#0d6e5e', fontWeight: '600', marginTop: 2 },
  textMuted: { color: '#c0c8c4' }
})
