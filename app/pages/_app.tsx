import '../styles/globals.css'
import type { AppProps } from 'next/app'
import dynamic from 'next/dynamic'
// import AR from '../components/ar'
const AR = dynamic(() => import('../components/ar'), { ssr: false })

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div>
      <Component {...pageProps} />
      <AR />
    </div>
  )
}
