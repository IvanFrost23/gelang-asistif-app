/**
 * Один WebGL-рендерер на всю страницу. Каждая секция с 3D — это View со своим 2D-холстом и камерой.
 * Кадр рисуется в общий рендерер и копируется в холст секции: холсты прокручиваются вместе со страницей
 * без отставания, а контекст WebGL и модель создаются один раз.
 */
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { buildBracelet, type Anchor, type BraceletModel, type PartId } from './bracelet'

export interface View {
  canvas: HTMLCanvasElement
  camera: THREE.PerspectiveCamera
  /** Видна ли секция (ставит IntersectionObserver). */
  active: boolean
  /** Продвинуть собственную анимацию вида. */
  tick(time: number, dt: number): void
  /** Записать состояние вида в общую модель и камеру. Должно быть идемпотентным. */
  apply(model: BraceletModel, time: number): void
  /** После рендера: можно спроецировать якоря в экранные координаты. */
  after?(model: BraceletModel): void
}

export class Engine {
  readonly renderer: THREE.WebGLRenderer
  readonly scene = new THREE.Scene()
  readonly model: BraceletModel
  private views = new Set<View>()
  private ctx = new WeakMap<HTMLCanvasElement, CanvasRenderingContext2D>()
  private w = 0
  private h = 0
  private dpr = 0
  private last = 0
  private raycaster = new THREE.Raycaster()
  private time = 0

  constructor() {
    const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    r.setClearColor(0x000000, 0)
    r.outputColorSpace = THREE.SRGBColorSpace
    r.toneMapping = THREE.NeutralToneMapping
    r.toneMappingExposure = 1.05
    this.renderer = r

    const pmrem = new THREE.PMREMGenerator(r)
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    this.scene.environmentIntensity = 0.85
    pmrem.dispose()

    const key = new THREE.DirectionalLight('#ffffff', 1.6)
    key.position.set(60, 110, 90)
    const rim = new THREE.DirectionalLight('#b9a8ff', 1.4)
    rim.position.set(-90, 40, -80)
    const fill = new THREE.HemisphereLight('#d9d2ff', '#120f26', 0.5)
    this.scene.add(key, rim, fill)

    this.model = buildBracelet()
    this.scene.add(this.model.root)
    r.setAnimationLoop((t) => this.frame(t))
  }

  add(v: View) { this.views.add(v) }
  remove(v: View) { this.views.delete(v) }

  private ensureSize(w: number, h: number) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    if (w <= this.w && h <= this.h && dpr === this.dpr) return
    this.w = Math.max(this.w, w); this.h = Math.max(this.h, h); this.dpr = dpr
    this.renderer.setPixelRatio(dpr)
    this.renderer.setSize(this.w, this.h, false)
  }

  private frame(t: number) {
    const dt = this.last ? Math.min(0.05, (t - this.last) / 1000) : 0.016
    this.last = t
    this.time = t
    for (const v of this.views) {
      if (!v.active) continue
      const w = v.canvas.clientWidth, h = v.canvas.clientHeight
      if (!w || !h) continue
      this.ensureSize(w, h)
      v.tick(t, dt)
      this.render(v, w, h, t)
    }
  }

  private render(v: View, w: number, h: number, t: number) {
    const r = this.renderer
    v.apply(this.model, t)
    v.camera.aspect = w / h
    v.camera.updateProjectionMatrix()
    r.setViewport(0, 0, w, h)
    r.setScissor(0, 0, w, h)
    r.setScissorTest(true)
    r.render(this.scene, v.camera)
    const cw = Math.floor(w * this.dpr), ch = Math.floor(h * this.dpr)
    if (v.canvas.width !== cw || v.canvas.height !== ch) { v.canvas.width = cw; v.canvas.height = ch }
    let ctx = this.ctx.get(v.canvas)
    if (!ctx) { ctx = v.canvas.getContext('2d')!; this.ctx.set(v.canvas, ctx) }
    ctx.clearRect(0, 0, cw, ch)
    const H = r.domElement.height
    ctx.drawImage(r.domElement, 0, H - ch, cw, ch, 0, 0, cw, ch)
    v.after?.(this.model)
  }

  /** Какая деталь под точкой экрана в данном виде. */
  pick(v: View, clientX: number, clientY: number): PartId | null {
    const rect = v.canvas.getBoundingClientRect()
    const ndc = new THREE.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1)
    v.apply(this.model, this.time)
    v.camera.aspect = rect.width / rect.height
    v.camera.updateProjectionMatrix()
    this.model.root.updateMatrixWorld(true)
    this.raycaster.setFromCamera(ndc, v.camera)
    const hits = this.raycaster.intersectObjects(this.model.meshes.filter((m) => m.visible && isVisible(m)), false)
    for (const h of hits) {
      let o: THREE.Object3D | null = h.object
      while (o && o.userData.part === undefined) o = o.parent
      const part = o?.userData.part as PartId | null | undefined
      if (part) return part
    }
    return null
  }
}

function isVisible(o: THREE.Object3D) {
  for (let p: THREE.Object3D | null = o; p; p = p.parent) if (!p.visible) return false
  return true
}

let engine: Engine | null | undefined
/** Ленивый синглтон. null — WebGL недоступен. */
export function getEngine(): Engine | null {
  if (engine !== undefined) return engine
  try {
    const test = document.createElement('canvas')
    if (!test.getContext('webgl2') && !test.getContext('webgl')) throw new Error('no webgl')
    engine = new Engine()
  } catch {
    engine = null
  }
  return engine
}

/** Экранные координаты якоря и смотрит ли он на камеру. */
export function projectAnchor(model: BraceletModel, a: Anchor, camera: THREE.Camera, w: number, h: number) {
  const p = a.obj.getWorldPosition(new THREE.Vector3())
  const n = a.normal.clone().applyQuaternion(model.root.getWorldQuaternion(new THREE.Quaternion()))
  const toCam = camera.position.clone().sub(p).normalize()
  const facing = n.dot(toCam)
  const s = p.clone().project(camera)
  return { x: (s.x * 0.5 + 0.5) * w, y: (-s.y * 0.5 + 0.5) * h, facing, behind: s.z > 1 }
}
