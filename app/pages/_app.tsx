import '../styles/globals.css'
import type { AppProps } from 'next/app'
import AR from '../components/ar'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div>
      <Component {...pageProps} />
      <AR />
    </div>
  )
}
