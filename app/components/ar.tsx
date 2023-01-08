import { useState, useEffect } from 'react'
import * as THREE from 'three'
import useMarkerAr from '../hooks/useMakerAr'

export default function AR() {
  const [isReady, setIsReady] = useState(false)
  const [isInit, setIsInit] = useState(false)

  const { markerRoot, arToolkitSource, arToolkitContext, arMarkerControl } = useMarkerAr({
    THREE,
    scriptUrl: '/scripts/ar.js',
    cameraParametersUrl: '/data/ar/camera_para.dat',
    patternUrl: '/data/ar/patt.hiro',
  })

  let markerFound = false
  let markerFoundTimer: any = null

  useEffect(() => {
    setIsReady(true)
  }, [])

  if (isReady) {
    if (!markerRoot || !arToolkitSource || !arToolkitContext || !arMarkerControl) return

    //////////////////////////////////////////////////////////////////////////////////
    //		Init
    //////////////////////////////////////////////////////////////////////////////////

    // init renderer
    var renderer = new THREE.WebGLRenderer({
      // antialias	: true,
      alpha: true,
    })
    renderer.setClearColor(new THREE.Color('lightgrey'), 0)
    // renderer.setPixelRatio(2)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.domElement.style.position = 'absolute'
    renderer.domElement.style.top = '0px'
    renderer.domElement.style.left = '0px'

    document.body.appendChild(renderer.domElement)

    // array of functions for the rendering loop
    const onRenderFcts: any[] = []

    // init scene and camera
    var scene = new THREE.Scene()

    //////////////////////////////////////////////////////////////////////////////////
    //		Initialize a basic camera
    //////////////////////////////////////////////////////////////////////////////////

    // Create a camera
    var camera = new THREE.Camera()
    scene.add(camera)

    scene.add(markerRoot)

    ////////////////////////////////////////////////////////////////////////////////
    //          handle arToolkitSource
    ////////////////////////////////////////////////////////////////////////////////

    arToolkitSource.init(() => {
      arToolkitSource.domElement.addEventListener('canplay', () => {
        console.log(
          'canplay',
          'actual source dimensions',
          arToolkitSource.domElement.videoWidth,
          arToolkitSource.domElement.videoHeight
        )

        initARContext()
      })

      window.arToolkitSource = arToolkitSource
      setTimeout(() => {
        onResize()
      }, 500)
    })

    // handle resize
    window.addEventListener('resize', () => {
      onResize()
    })

    const onResize = () => {
      arToolkitSource.onResizeElement()
      arToolkitSource.copyElementSizeTo(renderer.domElement)
      if (window.arToolkitContext.arController !== null) {
        arToolkitSource.copyElementSizeTo(window.arToolkitContext.arController.canvas)
      }
    }

    ////////////////////////////////////////////////////////////////////////////////
    //          initialize arToolkitContext
    ////////////////////////////////////////////////////////////////////////////////
    const initARContext = () => {
      console.log('initARContext()')

      // CONTEXT

      arToolkitContext.init(() => {
        camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix())

        arToolkitContext.arController.orientation = getSourceOrientation()
        arToolkitContext.arController.options.orientation = getSourceOrientation()

        console.log('arToolkitContext', arToolkitContext)
        window.arToolkitContext = arToolkitContext
      })

      // MARKER
      // console.log('ArMarkerControls', arMarkerControls)
      // window.arMarkerControls = arMarkerControls
    }

    const getSourceOrientation = () => {
      if (!arToolkitSource) {
        return null
      }

      console.log(
        'actual source dimensions',
        arToolkitSource.domElement.videoWidth,
        arToolkitSource.domElement.videoHeight
      )

      if (arToolkitSource.domElement.videoWidth > arToolkitSource.domElement.videoHeight) {
        console.log('source orientation', 'landscape')
        return 'landscape'
      } else {
        console.log('source orientation', 'portrait')
        return 'portrait'
      }
    }

    // update artoolkit on every frame
    onRenderFcts.push(() => {
      if (!arToolkitContext || !arToolkitSource || !arToolkitSource.ready) {
        return
      }

      arToolkitContext.update(arToolkitSource.domElement)
    })

    //////////////////////////////////////////////////////////////////////////////////
    //		add an object in the scene
    //////////////////////////////////////////////////////////////////////////////////

    const markerScene = new THREE.Scene()
    markerRoot.add(markerScene)

    // var mesh = new THREE.AxesHelper()
    // markerScene.add(mesh)

    // add a torus knot
    // var geometry = new THREE.BoxGeometry(1, 1, 1)
    // var material = new THREE.MeshNormalMaterial({
    //   transparent: true,
    //   opacity: 0.5,
    //   side: THREE.DoubleSide,
    // })
    // var mesh = new THREE.Mesh(geometry, material)
    // mesh.position.y = geometry.parameters.height / 2
    // markerScene.add(mesh)

    var geometry = new THREE.TorusKnotGeometry(0.3, 0.1, 64, 16)
    var material = new THREE.MeshNormalMaterial()
    var mesh = new THREE.Mesh(geometry, material)
    mesh.position.y = 0.5
    markerScene.add(mesh)

    onRenderFcts.push((delta) => {
      mesh.rotation.x += delta * Math.PI
    })

    //////////////////////////////////////////////////////////////////////////////////
    //		render the whole thing on the page
    //////////////////////////////////////////////////////////////////////////////////s
    onRenderFcts.push(function () {
      renderer.render(scene, camera)
    })

    // run the rendering loop
    var lastTimeMsec = null
    requestAnimationFrame(function animate(nowMsec) {
      // keep looping
      requestAnimationFrame(animate)
      // measure time
      lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60
      var deltaMsec = Math.min(200, nowMsec - lastTimeMsec)
      lastTimeMsec = nowMsec
      // call each update function
      onRenderFcts.forEach(function (onRenderFct) {
        onRenderFct(deltaMsec / 1000, nowMsec / 1000)
      })
    })

    arMarkerControl.addEventListener('markerFound', function (event) {
      if (!markerFound) {
        console.log('markerFound')
        markerFound = true
      }

      if (markerFoundTimer) clearTimeout(markerFoundTimer)
      markerFoundTimer = setTimeout(() => {
        markerFound = false
      }, 100)
    })
  }

  return <div className="ar"></div>
}
