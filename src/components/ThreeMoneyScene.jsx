import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const MAX_RENDER_STACKS = 2800
const STACK_BILL_CAPACITY = 100
const BASE_STACK_HEIGHT = 1.15
const MAX_ACTIVE_FALLING = 4500

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const NOTE_STYLE_BY_DENOM = {
  1: { base: '#6b7b2f', accent: '#d9e68b', dark: '#2a3411', stripe: '#9ebb46' },
  2: { base: '#6f5e24', accent: '#ead590', dark: '#31270f', stripe: '#c2a44d' },
  5: { base: '#345f3c', accent: '#9fd9a8', dark: '#17301f', stripe: '#63ab73' },
  10: { base: '#2f5570', accent: '#8ec4e8', dark: '#142634', stripe: '#4d92c2' },
  20: { base: '#5a3b72', accent: '#d1aaf3', dark: '#261635', stripe: '#9a63cf' },
  50: { base: '#6f2f42', accent: '#ef9fb7', dark: '#32131d', stripe: '#bf5f86' },
}

const makeTextureFromCanvas = (canvas) => {
  const texture = new THREE.CanvasTexture(canvas)
  texture.anisotropy = 8
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  return texture
}

const createCashSideTexture = (style) => {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#dbe8df'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  for (let y = 0; y < canvas.height; y += 5) {
    const tint = 185 + Math.floor(Math.random() * 24)
    ctx.fillStyle = `rgb(${tint - 20}, ${tint}, ${tint - 16})`
    ctx.fillRect(0, y, canvas.width, 2)
  }
  for (let i = 0; i < 8000; i += 1) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const alpha = 0.02 + Math.random() * 0.09
    ctx.fillStyle = `rgba(80,110,85,${alpha})`
    ctx.fillRect(x, y, 1.3, 1.3)
  }
  ctx.fillStyle = `${style.stripe}55`
  ctx.fillRect(0, canvas.height * 0.4, canvas.width, canvas.height * 0.15)
  ctx.fillRect(0, canvas.height * 0.68, canvas.width, canvas.height * 0.1)

  const texture = makeTextureFromCanvas(canvas)
  texture.repeat.set(1, 6)
  return texture
}

const createNoteFace = (ctx, canvas, denomination, style, isBack = false) => {
  const w = canvas.width
  const h = canvas.height

  ctx.fillStyle = style.base
  ctx.fillRect(0, 0, w, h)

  for (let row = 0; row < 3; row += 1) {
    ctx.strokeStyle = `rgba(255,255,255,${0.08 - row * 0.015})`
    ctx.lineWidth = 1.6 - row * 0.3
    for (let y = 58 + row * 18; y < h - 58; y += 20 + row * 5) {
      ctx.beginPath()
      for (let x = 0; x <= w; x += 16) {
        const wave = Math.sin((x + y) * (0.022 + row * 0.005)) * (3.8 + row * 1.3)
        if (x === 0) ctx.moveTo(x, y + wave)
        else ctx.lineTo(x, y + wave)
      }
      ctx.stroke()
    }
  }

  for (let i = 0; i < 11000; i += 1) {
    const x = Math.random() * w
    const y = Math.random() * h
    const alpha = 0.02 + Math.random() * 0.055
    ctx.fillStyle = `rgba(255,255,255,${alpha})`
    ctx.fillRect(x, y, 1.2, 1.2)
  }

  const stripeX = isBack ? w * 0.28 : w * 0.72
  const stripeGradient = ctx.createLinearGradient(stripeX, 0, stripeX + 30, 0)
  stripeGradient.addColorStop(0, 'rgba(240, 244, 255, 0.16)')
  stripeGradient.addColorStop(0.5, style.stripe)
  stripeGradient.addColorStop(1, 'rgba(240, 244, 255, 0.12)')
  ctx.fillStyle = stripeGradient
  ctx.fillRect(stripeX, 28, 30, h - 56)

  ctx.strokeStyle = style.accent
  ctx.lineWidth = 12
  ctx.strokeRect(20, 20, w - 40, h - 40)
  ctx.strokeStyle = 'rgba(255,255,255,0.36)'
  ctx.lineWidth = 4
  ctx.strokeRect(48, 48, w - 96, h - 96)

  const sealX = isBack ? w * 0.26 : w * 0.74
  const sealY = h * 0.5
  ctx.save()
  ctx.translate(sealX, sealY)
  for (let i = 0; i < 36; i += 1) {
    ctx.rotate((Math.PI * 2) / 36)
    ctx.strokeStyle = 'rgba(255,255,255,0.24)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, 20)
    ctx.lineTo(0, 72)
    ctx.stroke()
  }
  ctx.restore()
  ctx.strokeStyle = 'rgba(255,255,255,0.45)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(sealX, sealY, 54, 0, Math.PI * 2)
  ctx.stroke()

  if (!isBack) {
    const medX = w * 0.33
    const medY = h * 0.5
    const grad = ctx.createRadialGradient(medX, medY, 18, medX, medY, 92)
    grad.addColorStop(0, 'rgba(255,255,255,0.20)')
    grad.addColorStop(1, 'rgba(0,0,0,0.15)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.ellipse(medX, medY, 94, 118, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.38)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.ellipse(medX, medY, 84, 108, 0, 0, Math.PI * 2)
    ctx.stroke()
  } else {
    const monX = w * 0.37
    const monY = h * 0.5
    ctx.fillStyle = 'rgba(255,255,255,0.10)'
    ctx.fillRect(monX - 90, monY - 76, 180, 152)
    ctx.strokeStyle = 'rgba(255,255,255,0.38)'
    ctx.lineWidth = 3
    ctx.strokeRect(monX - 90, monY - 76, 180, 152)
  }

  ctx.fillStyle = '#ecf5fb'
  ctx.font = '700 34px Inter, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('BANQUE CENTRALE DE TUNISIE', w / 2, 88)

  ctx.fillStyle = '#f3fcff'
  ctx.font = 'bold 122px Inter, sans-serif'
  ctx.fillText(`${denomination} DT`, w / 2, h / 2 + 40)

  ctx.fillStyle = 'rgba(243, 252, 255, 0.82)'
  ctx.font = '600 30px Inter, sans-serif'
  ctx.fillText(isBack ? 'REVERSE - TND BANKNOTE' : 'TUNISIAN DINAR', w / 2, h - 70)
}

const createBillTextureSet = (denomination) => {
  const style = NOTE_STYLE_BY_DENOM[denomination] ?? NOTE_STYLE_BY_DENOM[10]
  const frontCanvas = document.createElement('canvas')
  frontCanvas.width = 1024
  frontCanvas.height = 512
  const frontCtx = frontCanvas.getContext('2d')
  createNoteFace(frontCtx, frontCanvas, denomination, style, false)

  const backCanvas = document.createElement('canvas')
  backCanvas.width = 1024
  backCanvas.height = 512
  const backCtx = backCanvas.getContext('2d')
  createNoteFace(backCtx, backCanvas, denomination, style, true)

  const roughnessCanvas = document.createElement('canvas')
  roughnessCanvas.width = frontCanvas.width
  roughnessCanvas.height = frontCanvas.height
  const roughnessCtx = roughnessCanvas.getContext('2d')
  roughnessCtx.fillStyle = 'rgb(170,170,170)'
  roughnessCtx.fillRect(0, 0, roughnessCanvas.width, roughnessCanvas.height)
  for (let i = 0; i < 9000; i += 1) {
    const x = Math.random() * roughnessCanvas.width
    const y = Math.random() * roughnessCanvas.height
    const shade = 140 + Math.floor(Math.random() * 90)
    roughnessCtx.fillStyle = `rgb(${shade},${shade},${shade})`
    roughnessCtx.fillRect(x, y, 1, 1)
  }

  const bumpCanvas = document.createElement('canvas')
  bumpCanvas.width = frontCanvas.width
  bumpCanvas.height = frontCanvas.height
  const bumpCtx = bumpCanvas.getContext('2d')
  bumpCtx.fillStyle = 'rgb(128,128,128)'
  bumpCtx.fillRect(0, 0, bumpCanvas.width, bumpCanvas.height)
  bumpCtx.strokeStyle = 'rgb(145,145,145)'
  bumpCtx.lineWidth = 1
  for (let y = 52; y < bumpCanvas.height - 52; y += 12) {
    bumpCtx.beginPath()
    bumpCtx.moveTo(48, y)
    bumpCtx.lineTo(bumpCanvas.width - 48, y)
    bumpCtx.stroke()
  }
  bumpCtx.fillStyle = 'rgb(152,152,152)'
  bumpCtx.font = 'bold 118px Inter, sans-serif'
  bumpCtx.textAlign = 'center'
  bumpCtx.fillText(`${denomination} TND`, bumpCanvas.width / 2, bumpCanvas.height / 2 + 42)

  return {
    frontColorMap: makeTextureFromCanvas(frontCanvas),
    backColorMap: makeTextureFromCanvas(backCanvas),
    roughnessMap: makeTextureFromCanvas(roughnessCanvas),
    bumpMap: makeTextureFromCanvas(bumpCanvas),
  }
}

const buildSimulationPlan = (totalBills) => {
  if (totalBills <= 0) {
    return {
      stackCount: 0,
      renderedStackCount: 0,
      billsPerRenderedStack: STACK_BILL_CAPACITY,
      stacksPerRendered: 1,
      stackCapacities: [],
    }
  }

  const stackCount = Math.ceil(totalBills / STACK_BILL_CAPACITY)
  const stacksPerRendered = Math.max(1, Math.ceil(stackCount / MAX_RENDER_STACKS))
  const billsPerRenderedStack = STACK_BILL_CAPACITY * stacksPerRendered
  const renderedStackCount = Math.ceil(totalBills / billsPerRenderedStack)

  const stackCapacities = Array.from({ length: renderedStackCount }, (_, index) => {
    const consumed = index * billsPerRenderedStack
    return Math.max(0, Math.min(billsPerRenderedStack, totalBills - consumed))
  })

  return {
    stackCount,
    renderedStackCount,
    billsPerRenderedStack,
    stacksPerRendered,
    stackCapacities,
  }
}

const computeGrid = (count) => {
  if (count <= 0) return { cols: 0, rows: 0 }
  const cols = count >= 4 ? Math.max(4, Math.ceil(Math.sqrt(count))) : count
  const rows = Math.ceil(count / cols)
  return { cols, rows }
}

const createStackMesh = ({
  scene,
  x,
  z,
  capacityBills,
  maxVisibleHeight,
  sideMaterial,
  topMaterial,
  bottomMaterial,
}) => {
  const geometry = new THREE.BoxGeometry(1.6, 1, 0.72)
  const mesh = new THREE.Mesh(geometry, [
    sideMaterial,
    sideMaterial,
    topMaterial,
    bottomMaterial,
    sideMaterial,
    sideMaterial,
  ])
  mesh.castShadow = true
  mesh.receiveShadow = true
  mesh.position.set(x, 0.005, z)
  mesh.scale.y = 0.01
  scene.add(mesh)

  return {
    mesh,
    x,
    z,
    capacityBills,
    currentBills: 0,
    maxVisibleHeight,
    stackIndex: -1,
  }
}

const updateStackHeight = (stack) => {
  const fillRatio = stack.capacityBills
    ? clamp(stack.currentBills / stack.capacityBills, 0, 1)
    : 0
  const nextHeight = Math.max(0.01, fillRatio * stack.maxVisibleHeight)
  stack.mesh.scale.y = nextHeight
  stack.mesh.position.y = nextHeight * 0.5
}

const createFallingBillMesh = (billMaterials) => {
  const geometry = new THREE.BoxGeometry(1.58, 0.01, 0.7)
  const mesh = new THREE.Mesh(geometry, billMaterials)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

const getStackTopY = (stack) => stack.mesh.scale.y + 0.01

/** Lower = faster spawn rate (more bills per second, capped by MAX_ACTIVE_FALLING). */
const getSpawnInterval = (totalBills) => {
  if (totalBills <= 1000) return 0.0012
  if (totalBills <= 5000) return 0.00055
  if (totalBills <= 20000) return 0.00028
  return 0.00014
}

const buildSpawnQueue = (stacks) => {
  if (!stacks.length) return { queue: [], instantFilledBills: 0, animatedBillCount: 0 }

  const queue = []
  stacks.forEach((stack) => {
    for (let i = 0; i < stack.capacityBills; i += 1) {
      queue.push(stack.stackIndex)
    }
  })
  return { queue, instantFilledBills: 0, animatedBillCount: queue.length }
}

/** Immediately finish the current run: remove falling bills, fill stacks, fire progress + complete. */
const applyInstantFillRun = (core, run, onProgress, onComplete) => {
  if (!core || !run || run.completed) return

  run.activeFalling.forEach((falling) => {
    core.scene.remove(falling.mesh)
    falling.mesh.geometry.dispose()
  })
  run.activeFalling = []

  run.stacks.forEach((stack) => {
    stack.currentBills = stack.capacityBills
    updateStackHeight(stack)
  })

  run.spawnedBills = run.animatedBillCount
  run.landedBills = run.totalBills
  run.reportedLanded = run.totalBills
  onProgress(run.totalBills)
  run.completed = true
  core.controls.enabled = true
  onComplete()
}

const ThreeMoneyScene = ({
  totalBills,
  denomination,
  runId,
  skipInstantToken = 0,
  onProgress,
  onComplete,
  onMeta,
  sceneFocusMode = false,
  onFocusScene,
}) => {
  const mountRef = useRef(null)
  const coreRef = useRef(null)
  const runStateRef = useRef(null)
  const progressCallbackRef = useRef(onProgress)
  const completeCallbackRef = useRef(onComplete)
  const metaCallbackRef = useRef(onMeta)
  const onFocusSceneRef = useRef(onFocusScene)
  const totalBillsRef = useRef(totalBills)

  onFocusSceneRef.current = onFocusScene
  totalBillsRef.current = totalBills

  useEffect(() => {
    progressCallbackRef.current = onProgress
    completeCallbackRef.current = onComplete
    metaCallbackRef.current = onMeta
  }, [onProgress, onComplete, onMeta])

  useEffect(() => {
    const core = coreRef.current
    if (!core?.controls) return
    if (sceneFocusMode) {
      core.controls.enabled = true
      return
    }
    const run = runStateRef.current
    if (run) {
      core.controls.enabled = !!run.completed
    }
  }, [sceneFocusMode, runId])

  useEffect(() => {
    if (skipInstantToken === 0) return
    const core = coreRef.current
    const run = runStateRef.current
    applyInstantFillRun(core, run, (n) => progressCallbackRef.current(n), () =>
      completeCallbackRef.current(),
    )
  }, [skipInstantToken])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#070f0c')
    scene.fog = null

    const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 600)
    camera.position.set(16, 9, 16)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.18
    mount.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enabled = false
    controls.enableDamping = true
    controls.target.set(0, 0.45, 0)
    controls.minDistance = 8
    controls.maxDistance = 220
    controls.maxPolarAngle = Math.PI / 2.05

    const hemi = new THREE.HemisphereLight('#c4b5a8', '#1a1f28', 0.58)
    hemi.position.set(0, 48, 0)
    scene.add(hemi)

    const ambient = new THREE.AmbientLight('#e8e0d5', 0.62)
    scene.add(ambient)

    const keyLight = new THREE.DirectionalLight('#fff5e6', 1.85)
    keyLight.position.set(18, 28, 14)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.set(2048, 2048)
    keyLight.shadow.bias = -0.00015
    keyLight.shadow.camera.left = -90
    keyLight.shadow.camera.right = 90
    keyLight.shadow.camera.top = 90
    keyLight.shadow.camera.bottom = -90
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight('#ffd4a8', 0.95)
    fillLight.position.set(-22, 16, -10)
    scene.add(fillLight)

    const backLight = new THREE.DirectionalLight('#a8c4ff', 0.45)
    backLight.position.set(0, 12, 28)
    scene.add(backLight)

    const rimLight = new THREE.PointLight('#fff8e8', 0.88, 0)
    rimLight.position.set(4, 18, -16)
    scene.add(rimLight)

    const vaultFill = new THREE.PointLight('#f5e6d0', 0.7, 0)
    vaultFill.position.set(0, 8, 0)
    scene.add(vaultFill)

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(420, 420),
      new THREE.MeshStandardMaterial({
        color: '#141820',
        roughness: 0.88,
        metalness: 0.06,
      }),
    )
    ground.rotation.x = -Math.PI / 2
    ground.position.y = 0
    ground.receiveShadow = true
    scene.add(ground)

    const clock = new THREE.Clock()
    let orbitAngle = 0

    const setSize = () => {
      const width = mount.clientWidth || window.innerWidth
      const height = mount.clientHeight || window.innerHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    setSize()
    window.addEventListener('resize', setSize)

    const handleCanvasClick = () => {
      if (totalBillsRef.current <= 0) return
      onFocusSceneRef.current?.()
    }
    renderer.domElement.addEventListener('click', handleCanvasClick)

    coreRef.current = { scene, camera, renderer, controls, clock, orbitAngle }

    const animate = () => {
      const core = coreRef.current
      if (!core) return

      const delta = clamp(core.clock.getDelta(), 0.001, 0.034)
      const currentRun = runStateRef.current

      if (currentRun) {
        currentRun.spawnAccumulator += delta
        while (
          currentRun.spawnedBills < currentRun.animatedBillCount &&
          currentRun.activeFalling.length < MAX_ACTIVE_FALLING &&
          currentRun.spawnAccumulator >= currentRun.spawnInterval
        ) {
          currentRun.spawnAccumulator -= currentRun.spawnInterval
          const targetStackIndex = currentRun.spawnQueue[currentRun.spawnedBills]
          const targetStack = currentRun.stacks[targetStackIndex]
          const mesh = createFallingBillMesh(currentRun.billMaterials)
          mesh.position.set(
            targetStack.x + (Math.random() - 0.5) * 1.2,
            12 + Math.random() * 12,
            targetStack.z + (Math.random() - 0.5) * 1.2,
          )
          mesh.rotation.set(
            (Math.random() - 0.5) * 1.8,
            Math.random() * Math.PI * 2,
            (Math.random() - 0.5) * 1.8,
          )
          core.scene.add(mesh)
          currentRun.activeFalling.push({
            mesh,
            stackIndex: targetStackIndex,
            velocity: new THREE.Vector3(
              (Math.random() - 0.5) * 1.15,
              -5.2 - Math.random() * 2.8,
              (Math.random() - 0.5) * 1.15,
            ),
            angularVelocity: new THREE.Vector3(
              (Math.random() - 0.5) * 3,
              (Math.random() - 0.5) * 3,
              (Math.random() - 0.5) * 3,
            ),
          })
          currentRun.spawnedBills += 1
        }

        for (let i = currentRun.activeFalling.length - 1; i >= 0; i -= 1) {
          const falling = currentRun.activeFalling[i]
          const targetStack = currentRun.stacks[falling.stackIndex]
          const stackTopY = getStackTopY(targetStack)

          falling.velocity.y -= currentRun.gravity * delta
          falling.mesh.position.addScaledVector(falling.velocity, delta)
          falling.mesh.rotation.x += falling.angularVelocity.x * delta
          falling.mesh.rotation.y += falling.angularVelocity.y * delta
          falling.mesh.rotation.z += falling.angularVelocity.z * delta

          if (falling.mesh.position.y <= stackTopY) {
            core.scene.remove(falling.mesh)
            falling.mesh.geometry.dispose()

            targetStack.currentBills = Math.min(
              targetStack.capacityBills,
              targetStack.currentBills + 1,
            )
            updateStackHeight(targetStack)

            currentRun.landedBills += 1
            currentRun.activeFalling.splice(i, 1)
          }
        }

        if (currentRun.landedBills !== currentRun.reportedLanded) {
          currentRun.reportedLanded = currentRun.landedBills
          progressCallbackRef.current(currentRun.landedBills)
        }

        if (!currentRun.completed && currentRun.landedBills >= currentRun.totalBills) {
          currentRun.completed = true
          progressCallbackRef.current(currentRun.totalBills)
          core.controls.enabled = true
          completeCallbackRef.current()
        }
      }

      if (!core.controls.enabled) {
        core.orbitAngle += delta * 0.13
        const radius = runStateRef.current?.cameraRadius ?? 24
        core.camera.position.x = Math.cos(core.orbitAngle) * radius
        core.camera.position.z = Math.sin(core.orbitAngle) * radius
        core.camera.position.y = 11 + radius * 0.12
        core.camera.lookAt(0, 1.1, 0)
      } else {
        core.controls.update()
      }

      core.renderer.render(core.scene, core.camera)
      requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)

    return () => {
      renderer.domElement.removeEventListener('click', handleCanvasClick)
      window.removeEventListener('resize', setSize)
      controls.dispose()
      renderer.dispose()
      mount.removeChild(renderer.domElement)
      coreRef.current = null
      runStateRef.current = null
    }
  }, [])

  useEffect(() => {
    const core = coreRef.current
    if (!core) return

    const previous = runStateRef.current
    if (previous) {
      previous.stacks?.forEach((stack) => {
        core.scene.remove(stack.mesh)
        stack.mesh.geometry.dispose()
      })
      previous.activeFalling?.forEach((falling) => {
        core.scene.remove(falling.mesh)
        falling.mesh.geometry.dispose()
      })
      if (previous.textures) {
        previous.textures.frontColorMap.dispose()
        previous.textures.backColorMap.dispose()
        previous.textures.roughnessMap.dispose()
        previous.textures.bumpMap.dispose()
        previous.textures.sideCashMap.dispose()
      }
      if (previous.materials) {
        previous.materials.front.dispose()
        previous.materials.back.dispose()
        previous.materials.side.dispose()
        previous.materials.bottom.dispose()
      }
    }

    core.controls.enabled = false

    const plan = buildSimulationPlan(totalBills)
    const style = NOTE_STYLE_BY_DENOM[denomination] ?? NOTE_STYLE_BY_DENOM[10]
    const textures = createBillTextureSet(denomination)
    textures.sideCashMap = createCashSideTexture(style)

    metaCallbackRef.current({
      stackCount: plan.stackCount,
      renderedStackCount: plan.renderedStackCount,
      stackBillCapacity: STACK_BILL_CAPACITY,
      stacksPerRendered: plan.stacksPerRendered,
    })

    const frontMaterial = new THREE.MeshStandardMaterial({
      map: textures.frontColorMap,
      roughnessMap: textures.roughnessMap,
      bumpMap: textures.bumpMap,
      bumpScale: 0.014,
      roughness: 0.92,
      metalness: 0.07,
    })
    const backMaterial = new THREE.MeshStandardMaterial({
      map: textures.backColorMap,
      roughnessMap: textures.roughnessMap,
      bumpMap: textures.bumpMap,
      bumpScale: 0.014,
      roughness: 0.92,
      metalness: 0.07,
    })
    const sideMaterial = new THREE.MeshStandardMaterial({
      map: textures.sideCashMap,
      roughness: 0.95,
      metalness: 0.04,
    })
    const bottomMaterial = new THREE.MeshStandardMaterial({
      color: '#152019',
      roughness: 0.96,
      metalness: 0.03,
    })

    const { cols, rows } = computeGrid(plan.renderedStackCount)
    const spacingX = 2.25
    const spacingZ = 1.35
    const stacks = plan.stackCapacities.map((capacityBills, index) => {
      const row = Math.floor(index / cols)
      const col = index % cols
      const x = (col - (cols - 1) / 2) * spacingX
      const z = (row - (rows - 1) / 2) * spacingZ
      const visibleHeight = clamp(
        BASE_STACK_HEIGHT * Math.sqrt(plan.stacksPerRendered) * (capacityBills / plan.billsPerRenderedStack),
        0.25,
        4.6,
      )
      const stack = createStackMesh({
        scene: core.scene,
        x,
        z,
        capacityBills,
        maxVisibleHeight: visibleHeight,
        sideMaterial,
        topMaterial: frontMaterial,
        bottomMaterial,
      })
      stack.stackIndex = index
      return stack
    })

    const { queue: spawnQueue, instantFilledBills, animatedBillCount } = buildSpawnQueue(stacks)
    if (instantFilledBills > 0) {
      onProgress(instantFilledBills)
    } else {
      onProgress(0)
    }

    const layoutSpan = Math.max(cols * spacingX, rows * spacingZ)

    runStateRef.current = {
      totalBills,
      spawnedBills: 0,
      landedBills: instantFilledBills,
      reportedLanded: instantFilledBills,
      completed: false,
      spawnAccumulator: 0,
      spawnInterval: getSpawnInterval(totalBills),
      gravity: 34,
      stacks,
      spawnQueue,
      animatedBillCount,
      activeFalling: [],
      billMaterials: [sideMaterial, sideMaterial, frontMaterial, backMaterial, sideMaterial, sideMaterial],
      textures,
      materials: {
        front: frontMaterial,
        back: backMaterial,
        side: sideMaterial,
        bottom: bottomMaterial,
      },
      cameraRadius: clamp(18 + layoutSpan * 0.58, 18, 170),
    }
  }, [runId, denomination, totalBills, onProgress])

  return <div ref={mountRef} className="absolute inset-0 h-full w-full" />
}

export default ThreeMoneyScene
