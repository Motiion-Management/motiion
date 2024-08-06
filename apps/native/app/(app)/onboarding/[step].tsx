import { useLocalSearchParams } from 'expo-router'
import WebView from '@/components/webview'

export default function Onboarding2Screen() {
  const { id } = useLocalSearchParams()
  return <WebView path={`/onboarding/${id}`} />
}
