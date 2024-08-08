import { useLocalSearchParams } from 'expo-router'
import WebView from '@/components/webview'

export default function SettingsPages() {
  const { path } = useLocalSearchParams()
  console.log('SETTINGS PATH ==', path)

  const slug =
    typeof path === 'undefined'
      ? ''
      : typeof path === 'string'
        ? path
        : path.join('/')
  return <WebView path={`/talent/settings/${slug}`} />
}
