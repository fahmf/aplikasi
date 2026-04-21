import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView
} from 'react-native'
import { router } from 'expo-router'

export default function RegisterScreen() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const API_URL = process.env.EXPO_PUBLIC_API_URL ?? ''

  async function handleRegister() {
    if (!email || !username || !password) {
      Alert.alert('خطأ', 'Email, username, dan password wajib diisi')
      return
    }
    if (password.length < 6) {
      Alert.alert('خطأ', 'Password minimal 6 karakter')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, full_name: fullName, password })
      })
      const data = await res.json()

      if (!res.ok) {
        Alert.alert('Gagal Daftar', data.error ?? 'Terjadi kesalahan')
        return
      }

      Alert.alert('Berhasil! 🎉', 'Akun berhasil dibuat. Silakan login.', [
        { text: 'Login', onPress: () => router.replace('/(auth)/login') }
      ])
    } catch {
      Alert.alert('Error', 'Tidak dapat terhubung ke server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.appTitle}>Quizz</Text>
          <Text style={styles.appSubtitle}>تسجيل حساب جديد</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Daftar Akun Baru</Text>

          <Text style={styles.label}>Nama Lengkap</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Ahmad Maulana"
            autoCapitalize="words"
          />

          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="ahmad123"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="contoh@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password (min. 6 karakter)</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.btnText}>Daftar Sekarang</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.linkText}>Sudah punya akun? <Text style={styles.linkBold}>Login</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d6e5e' },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 24 },
  appTitle: { fontSize: 36, fontWeight: '900', color: 'white' },
  appSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  card: {
    backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 28, paddingTop: 32, minHeight: 600
  },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#1a2e28', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', color: '#4a5c56', marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: '#e5dfd2', borderRadius: 12, padding: 14,
    fontSize: 15, color: '#1a2e28', marginBottom: 16, backgroundColor: '#fefaf0'
  },
  btn: {
    backgroundColor: '#0d6e5e', borderRadius: 14, padding: 16,
    alignItems: 'center', marginTop: 8
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: 'white', fontWeight: '800', fontSize: 16 },
  linkBtn: { alignItems: 'center', marginTop: 20 },
  linkText: { color: '#8a9a94', fontSize: 14 },
  linkBold: { color: '#0d6e5e', fontWeight: '700' }
})
