import { useEffect, useState } from 'react'

export default function useMakerAr({ THREE, scriptUrl, cameraParametersUrl, patternUrl }) {
  const [THREEx, setTHREEx] = useState(null)
  const [markerRoot, setMarkerRoot] = useState(null)
  const [arToolkitSource, setArToolkitSource] = useState(null)
  const [arToolkitContext, setArToolkitContext] = useState(null)
  const [arMarkerControl, setArMarkerControl] = useState(null)

  useEffect(() => {
    if (!window.THREE) {
      window.THREE = THREE
    }

    if (!window.THREEx) {
      const script = document.createElement('script')

      script.onload = () => {
        setTHREEx(window.THREEx)
        document.body.removeChild(script)
      }
      script.src = scriptUrl
      document.body.appendChild(script)
    }
  }, [])

  useEffect(() => {
    if (!THREEx) {
      return
    }

    const markerRoot = new THREE.Group()
    const arToolkitContext = new THREEx.ArToolkitContext({
      cameraParametersUrl,
      detectionMode: 'mono',
    })
    const arToolkitSource = new THREEx.ArToolkitSource({
      sourceType: 'webcam',
    })
    const arMarkerControl = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
      type: 'pattern',
      patternUrl,
    })

    setMarkerRoot(markerRoot)
    setArToolkitContext(arToolkitContext)
    setArToolkitSource(arToolkitSource)
    setArMarkerControl(arMarkerControl)
  }, [THREEx])

  return {
    markerRoot,
    arToolkitSource,
    arToolkitContext,
    arMarkerControl,
  }
}
