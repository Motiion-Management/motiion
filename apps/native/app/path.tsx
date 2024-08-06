import { useLocalSearchParams } from 'expo-router'
import WebView from '@/components/webview'

export default function DynamicPath() {
  const { path } = useLocalSearchParams()
  return <WebView path={`/${path}`} />
}
