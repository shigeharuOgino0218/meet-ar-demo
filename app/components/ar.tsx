import { useState, useEffect } from 'react'
import * as THREE from 'three'
import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod'

export default function AR() {
  useEffect(() => {
    let mindarThree: any
    let renderAnimationId: any = null
    const container = document.getElementById('container')

    mindarThree = new MindARThree({
      container: container,
      imageTargetSrc: '/marker/meet.mind',
    })

    const { renderer, scene, camera } = mindarThree
    const anchor = mindarThree.addAnchor(0)
    const geometry = new THREE.PlaneGeometry(2, 2)
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.5,
    })
    const plane = new THREE.Mesh(geometry, material)

    anchor.group.add(plane)

    const update = () => {
      renderer.render(scene, camera)
      renderAnimationId = requestAnimationFrame(update)
    }

    const start = async () => {
      await mindarThree.start()
      update()
    }

    const startButton = document.getElementById('startButton')
    const stopButton = document.getElementById('stopButton')
    startButton?.addEventListener('click', () => {
      start()
    })
    stopButton?.addEventListener('click', () => {
      mindarThree.stop()
      cancelAnimationFrame(renderAnimationId)
    })
  })

  return (
    <div className="ar">
      <div id="control">
        <button id="startButton">Start</button>
        <button id="stopButton">Stop</button>
      </div>
      <div id="container"></div>
    </div>
  )
}
