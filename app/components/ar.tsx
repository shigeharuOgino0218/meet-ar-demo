import { useState, useEffect } from 'react'
import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js'
import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod'

export default function AR() {
  const [visible, setVisible] = useState(false)

  const roundedRectangle = (w: number, h: number, r: number, s: number) => {
    // width, height, radius corner, smoothness
    // helper const's
    const wi = w / 2 - r // inner width
    const hi = h / 2 - r // inner height
    const w2 = w / 2 // half width
    const h2 = h / 2 // half height
    const ul = r / w // u left
    const ur = (w - r) / w // u right
    const vl = r / h // v low
    const vh = (h - r) / h // v high

    // prettier-ignore
    let positions = [
      -wi, -h2, 0,  wi, -h2, 0,  wi, h2, 0,
      -wi, -h2, 0,  wi,  h2, 0, -wi, h2, 0,
      -w2, -hi, 0, -wi, -hi, 0, -wi, hi, 0,
      -w2, -hi, 0, -wi,  hi, 0, -w2, hi, 0,
       wi, -hi, 0,  w2, -hi, 0,  w2, hi, 0,
       wi, -hi, 0,  w2,  hi, 0,  wi, hi, 0
    ];

    // prettier-ignore
    let uvs = [
      ul,  0, ur,  0, ur,  1,
      ul,  0, ur,  1, ul,  1,
       0, vl, ul, vl, ul, vh,
       0, vl, ul, vh,  0, vh,
      ur, vl,  1, vl,  1, vh,
      ur, vl,  1, vh,	ur, vh 
    ];

    let phia = 0
    let phib, xc, yc, uc, vc, cosa, sina, cosb, sinb

    for (let i = 0; i < s * 4; i++) {
      phib = (Math.PI * 2 * (i + 1)) / (4 * s)

      cosa = Math.cos(phia)
      sina = Math.sin(phia)
      cosb = Math.cos(phib)
      sinb = Math.sin(phib)

      xc = i < s || i >= 3 * s ? wi : -wi
      yc = i < 2 * s ? hi : -hi

      positions.push(xc, yc, 0, xc + r * cosa, yc + r * sina, 0, xc + r * cosb, yc + r * sinb, 0)

      uc = i < s || i >= 3 * s ? ur : ul
      vc = i < 2 * s ? vh : vl

      uvs.push(uc, vc, uc + ul * cosa, vc + vl * sina, uc + ul * cosb, vc + vl * sinb)

      phia = phib
    }

    const geometry = new THREE.BufferGeometry()

    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))
    geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2))

    return geometry
  }

  const createMyLinkMeshs = (font: any, anchor: any) => {
    const myLinkDatas = [
      { name: 'LINE', type: 'line' },
      { name: 'Instagram', type: 'instagram' },
      { name: 'Twitter', type: 'twitter' },
    ]

    myLinkDatas.forEach((data, idx) => {
      const myLinkGroup = new THREE.Group()
      const myLinkGeo = roundedRectangle(3.43, 0.6, 0.1, 4)
      const myLinkMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.2,
      })
      const myLinkPlane = new THREE.Mesh(myLinkGeo, myLinkMat)

      const myLinkIcoGeo = roundedRectangle(0.4, 0.4, 0.1, 4)
      const myLinkIcoMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: new THREE.TextureLoader().load(`/img/${data.type}.jpg`),
      })
      const myLinkIcoPlane = new THREE.Mesh(myLinkIcoGeo, myLinkIcoMat)
      myLinkIcoPlane.position.x = -1.42
      myLinkIcoPlane.position.y = 0
      myLinkIcoPlane.position.z = 0.05

      const myLinkNameGeo = new TextGeometry(data.name, { font: font, size: 0.16, height: 0 })
      const myLinkNameMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
      const myLinkNameMesh = new THREE.Mesh(myLinkNameGeo, myLinkNameMat)

      myLinkNameMesh.position.x = -1.02
      myLinkNameMesh.position.y = -0.1
      myLinkNameMesh.position.z = 0.05

      myLinkGroup.add(myLinkPlane)
      myLinkGroup.add(myLinkIcoPlane)
      myLinkGroup.add(myLinkNameMesh)

      myLinkGroup.name = data.type
      myLinkGroup.position.y = -0.72 - 0.7 * idx

      anchor.group.add(myLinkGroup)
    })
  }

  useEffect(() => {
    let mindarThree: any, composer: any
    let renderAnimationId: any = null
    const container = document.getElementById('container')

    mindarThree = new MindARThree({
      container: container,
      imageTargetSrc: '/marker/targets.mind',
      filterMinCF: 0.0005,
      filterBeta: 0.005,
    })

    const { renderer, scene, camera } = mindarThree

    const anchor = mindarThree.addAnchor(0)
    const geometry = new THREE.PlaneGeometry(3.75, 1.8)
    const material = new THREE.MeshBasicMaterial({
      // color: 0x000000,
      transparent: true,
      opacity: 0.8,
      map: new THREE.TextureLoader().load('/img/head.jpg'),
    })
    const plane = new THREE.Mesh(geometry, material)

    const fontLoader = new FontLoader()

    fontLoader.load('/data/fonts/helvetiker_regular.typeface.json', (font: any) => {
      createMyLinkMeshs(font, anchor)
    })

    fontLoader.load('/data/fonts/helvetiker_bold.typeface.json', (font: any) => {
      const meetNameGeo = new TextGeometry('MEET', { font: font, size: 0.24, height: 0 })
      const meetNameMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
      })
      meetNameGeo.computeBoundingBox()
      const meetNameBoudingBox = meetNameGeo.boundingBox
      if (meetNameBoudingBox) {
        meetNameGeo.translate(-(meetNameBoudingBox.max.x - meetNameBoudingBox.min.x) / 2, 0, 0)
        anchor.group.add(new THREE.Mesh(meetNameGeo, meetNameMat))
      }
    })

    plane.position.y = 2.2
    anchor.group.add(plane)

    camera.zoom = (1 / 3.75) * 2

    composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))

    let pixelRatio = window.devicePixelRatio || 2
    // renderer.setSize(window.innerWidth, window.innerHeight)
    composer.setSize(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio)

    const glitchPass = new GlitchPass()
    composer.addPass(glitchPass)

    const update = () => {
      renderer.render(scene, camera)
      composer.render()
      renderAnimationId = requestAnimationFrame(update)
    }

    const start = async () => {
      await mindarThree.start()
      update()
    }

    const startBtn = document.getElementById('startBtn')
    const stopBtn = document.getElementById('stopBtn')
    startBtn?.addEventListener('click', () => {
      start()
    })
    stopBtn?.addEventListener('click', () => {
      if (!renderAnimationId) return
      mindarThree.stop()
      cancelAnimationFrame(renderAnimationId)
    })

    const raycaster = new THREE.Raycaster()

    window.addEventListener('click', (e) => {
      const vector = new THREE.Vector2(
        (e.clientX / window.innerWidth) * 2 - 1,
        (e.clientY / window.innerHeight) * -2 + 1
      )

      raycaster.setFromCamera(vector, camera)

      const intersects = raycaster.intersectObjects(scene.children[0].children)

      if (intersects.length) {
        let targetName: string
        const intersect = intersects[0]
        console.log(intersect)

        const obj = intersect.object
        if (obj.parent) targetName = obj.parent.name
        else targetName = obj.name

        if (targetName === 'line') {
          window.open('https://line.me/R/ti/p/@linedevelopers_ja?accountId=linedevelopers_ja')
        } else if (targetName === 'twitter') {
          window.open('https://twitter.com/Twitter')
        } else if (targetName === 'instagram') {
          window.open('https://instagram.com/instagram?igshid=YmMyMTA2M2Y=')
        }
      }
    })
  })

  return (
    <div className="ar">
      <div id="control">
        <button id="startBtn">Start</button>
        <button id="stopBtn">Stop</button>
      </div>
      <div className="showMaker" onClick={() => setVisible(!visible)}>
        <img src="/img/ar_marker.png" alt="" />
      </div>
      <div className="marker" style={{ visibility: visible ? 'visible' : 'hidden' }}>
        <div className="marker_inner">
          <img src="/img/ar_marker.png" alt="" />
        </div>
      </div>
      <div id="container"></div>
    </div>
  )
}
