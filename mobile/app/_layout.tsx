import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { useAuth } from '../src/hooks/useAuth'
import { useRouter, useSegments } from 'expo-router'

export default function RootLayout() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    if (loading) return

    const inAuthGroup = segments[0] === '(auth)'

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login')
    } else if (user && inAuthGroup) {
      router.replace('/(app)/lessons')
    }
  }, [user, loading])

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
    </Stack>
  )
}
