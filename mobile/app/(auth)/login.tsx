import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert
} from 'react-native'
import { useAuth } from '../../src/hooks/useAuth'
import { router } from 'expo-router'

export default function LoginScreen() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('خطأ', 'يرجى إدخال البريد الإلكتروني وكلمة المرور')
      return
    }
    setLoading(true)
    const error = await signIn(email, password)
    setLoading(false)
    if (error) {
      Alert.alert('فشل تسجيل الدخول', error.message)
    } else {
      router.replace('/(app)/lessons')
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>Quizz</Text>
        <Text style={styles.appSubtitle}>تعلّم العربية بطريقة ممتعة</Text>
        <Text style={styles.emoji}>📖</Text>
      </View>

      {/* Form */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>تسجيل الدخول</Text>
        <Text style={styles.cardSubtitle}>Log In</Text>

        <Text style={styles.label}>البريد الإلكتروني</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="contoh@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <Text style={styles.label}>كلمة المرور</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
          autoComplete="password"
        />

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.btnText}>دخول · Masuk</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkBtn}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={styles.linkText}>Belum punya akun? <Text style={styles.linkBold}>Daftar</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d6e5e' },
  header: { alignItems: 'center', paddingTop: 80, paddingBottom: 32 },
  appTitle: { fontSize: 42, fontWeight: '900', color: 'white', letterSpacing: -1 },
  appSubtitle: { fontSize: 18, color: 'rgba(255,255,255,0.8)', marginTop: 4, fontFamily: Platform.OS === 'ios' ? 'Arial' : undefined },
  emoji: { fontSize: 48, marginTop: 16 },
  card: {
    flex: 1, backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 28, paddingTop: 32
  },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#0d6e5e', textAlign: 'right', marginBottom: 2 },
  cardSubtitle: { fontSize: 14, color: '#8a9a94', marginBottom: 24 },
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
