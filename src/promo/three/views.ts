/**
 * Виды страницы: hero, коды, разборка по скроллу и интерактивный обозреватель.
 * Каждый вид хранит своё состояние и записывает его в общую модель перед рендером.
 */
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CATEGORIES, SIGNALS, fullPattern, type Category } from '../../domain/signals'
import { INTERNAL, type BraceletModel, type PartId } from './bracelet'
import type { View } from './engine'

export const IDLE = '#a99cf2'
const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }

/** Кадр кода: вибрирует ли браслет и насколько горит LED в момент ms от начала проигрывания. */
export function codeFrame(cat: Category, ms: number, opts: { once?: boolean; gap?: number } = {}) {
  const s = SIGNALS[cat]
  const pat = opts.once ? s.pattern : fullPattern(s)
  const total = pat.reduce((a, b) => a + b, 0)
  const hold = 700, fade = 500
  const period = total + hold + fade + (opts.gap ?? 1100)
  const t = ms % period
  let acc = 0, vib = false
  for (let i = 0; i < pat.length; i++) { if (t < acc + pat[i]) { vib = i % 2 === 0; break } acc += pat[i] }
  let led = t < total + hold ? 1 : Math.max(0, 1 - (t - total - hold) / fade)
  if (s.blink && t < total + hold) led *= Math.floor(t / 90) % 2 ? 0.2 : 1
  return { vib, led, period, total }
}

const tmpColor = new THREE.Color()
function ledFor(m: BraceletModel, cat: Category | null, f: { led: number } | null, idleLevel = 0.35) {
  if (!cat || !f) { m.setLed(IDLE, idleLevel); return }
  tmpColor.set(IDLE).lerp(new THREE.Color(SIGNALS[cat].color), Math.min(1, f.led * 1.4))
  m.setLed(tmpColor, Math.max(idleLevel * (1 - f.led), f.led))
}

/** Расстояние камеры, при котором объект размером w×h помещается в кадр. */
function fitDistance(cam: THREE.PerspectiveCamera, w: number, h: number) {
  const t = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2))
  return Math.max(h / 2 / t, w / 2 / (t * cam.aspect))
}

abstract class Base implements View {
  canvas!: HTMLCanvasElement
  camera = new THREE.PerspectiveCamera(28, 1, 1, 4000)
  active = false
  tick(_t: number, _dt: number) {}
  abstract apply(m: BraceletModel, t: number): void
  protected aspect() { return this.canvas && this.canvas.clientHeight ? this.canvas.clientWidth / this.canvas.clientHeight : 1 }
}

/** Hero: браслет парит, слегка поворачивается за курсором и по очереди показывает четыре кода. */
export class HeroView extends Base {
  private px = 0
  private py = 0
  target = { x: 0, y: 0 }
  tick(_t: number, dt: number) {
    const k = 1 - Math.exp(-dt * 3)
    this.px += (this.target.x - this.px) * k
    this.py += (this.target.y - this.py) * k
  }
  apply(m: BraceletModel, t: number) {
    const still = reduced()
    const sway = still ? 0 : Math.sin(t * 0.00032) * 0.42
    m.root.rotation.set(0.42 + this.py * 0.14, -0.62 + sway + this.px * 0.3, 0)
    m.root.position.set(0, still ? 0 : Math.sin(t * 0.0011) * 1.4, 0)
    m.setExplode(0)
    m.setHighlight(null, 0)
    const ms = t - 1800, slot = 3200
    if (ms < 0) { ledFor(m, null, null, 0.35 + 0.25 * Math.sin(t * 0.003)); m.setShake(0, t) }
    else {
      const cat = CATEGORIES[Math.floor(ms / slot) % 4]
      const f = codeFrame(cat, ms % slot, { once: true, gap: 4000 })
      ledFor(m, cat, f)
      m.setShake(f.vib && !still ? 1 : 0, t)
    }
    this.camera.fov = 24
    this.camera.aspect = this.aspect()
    const d = fitDistance(this.camera, 84, 74)
    this.camera.position.set(0, d * 0.12, d)
    this.camera.lookAt(0, 3, 0)
  }
}

/** Коды: браслет крупно, проигрывает активный код по кругу. */
export class CodesView extends Base {
  private cat: Category = 'name'
  private start = 0
  private now = 0
  setCategory(c: Category) { if (c !== this.cat) { this.cat = c; this.start = this.now } }
  replay() { this.start = this.now }
  tick(t: number) { this.now = t }
  apply(m: BraceletModel, t: number) {
    const still = reduced()
    m.root.rotation.set(0.78, -0.42 + (still ? 0 : Math.sin(t * 0.0004) * 0.16), 0)
    m.root.position.set(0, 0, 0)
    m.setExplode(0)
    m.setHighlight(null, 0)
    const f = codeFrame(this.cat, Math.max(0, t - this.start - 350))
    ledFor(m, this.cat, f, 0.2)
    m.setShake(f.vib && !still ? 1.1 : 0, t)
    this.camera.fov = 26
    this.camera.aspect = this.aspect()
    const d = fitDistance(this.camera, 82, 70)
    this.camera.position.set(0, 18 + d * 0.1, d)
    this.camera.lookAt(0, 12, 0)
  }
}

/** Разборка по скроллу: progress 0..1 задаёт секция. */
export class InsideView extends Base {
  progress = 0
  onAfter?: (m: BraceletModel, cam: THREE.PerspectiveCamera, explode: number) => void
  explode() { return smooth(0.06, 0.62, this.progress) }
  apply(m: BraceletModel, t: number) {
    const e = this.explode()
    m.root.rotation.set(0.2 + 0.18 * (1 - e), -1.05 + this.progress * 0.75, 0)
    m.root.position.set(0, 0, 0)
    m.setExplode(e)
    m.setHighlight(null, 0)
    m.setShake(0, t)
    m.setLed(IDLE, 0.55 + 0.2 * Math.sin(t * 0.002))
    this.camera.fov = 26
    this.camera.aspect = this.aspect()
    const narrow = this.camera.aspect < 0.9
    const d = fitDistance(this.camera, narrow ? 86 : 96, 72 + 66 * e)
    this.camera.position.set(0, 10 + 30 * e, d)
    this.camera.lookAt(0, 3 + 24 * e, 0)
  }
  after(m: BraceletModel) { this.onAfter?.(m, this.camera, this.explode()) }
}

const POSE = new THREE.Euler(0.3, -0.5, 0)
const FOCUS: Record<PartId, { dir: [number, number, number]; dist: number }> = {
  led: { dir: [0.15, 1, 0.75], dist: 72 },
  button: { dir: [-0.5, 1, 0.75], dist: 62 },
  mic: { dir: [0.55, 1, 0.6], dist: 56 },
  esp32: { dir: [0.1, 0.5, 1], dist: 100 },
  battery: { dir: [-0.35, 0.45, 1], dist: 88 },
  motor: { dir: [0.5, 0.45, 1], dist: 82 },
  port: { dir: [0.1, -0.55, 1], dist: 86 },
  strap: { dir: [-1, -0.2, 0.7], dist: 125 },
  buckle: { dir: [1, -0.45, 0.65], dist: 72 },
}

type Tween = { p0: THREE.Vector3; p1: THREE.Vector3; t0: THREE.Vector3; t1: THREE.Vector3; start: number; dur: number }

/** Обозреватель: вращение, зум, выбор детали, разборка, проигрывание кода. */
export class ExplorerView extends Base {
  controls?: OrbitControls
  explodeTarget = 0
  private explodeNow = 0
  selected: PartId | null = null
  private play: { cat: Category; start: number } | null = null
  private tween: Tween | null = null
  private now = 0
  private model?: BraceletModel
  onAfter?: (m: BraceletModel, cam: THREE.PerspectiveCamera) => void
  onExplode?: (exploded: boolean) => void

  attach(canvas: HTMLCanvasElement, model: BraceletModel) {
    this.canvas = canvas
    this.model = model
    const c = new OrbitControls(this.camera, canvas)
    c.enableDamping = true
    c.dampingFactor = 0.08
    c.enablePan = false
    c.minDistance = 38
    c.maxDistance = 300
    c.rotateSpeed = 0.75
    c.zoomSpeed = 0.9
    c.autoRotate = !reduced()
    c.autoRotateSpeed = 1.2
    c.addEventListener('start', () => { this.tween = null; c.autoRotate = false })
    this.controls = c
    this.camera.fov = 30
    this.reset(false)
  }
  detach() { this.controls?.dispose(); this.controls = undefined }

  private defaultCam() {
    this.camera.aspect = this.aspect()
    const d = fitDistance(this.camera, 90, 80) * (this.explodeTarget ? 1.45 : 1)
    const target = new THREE.Vector3(0, 3 + (this.explodeTarget ? 20 : 0), 0)
    return { pos: new THREE.Vector3(0, 0.28, 1).normalize().multiplyScalar(d).add(target), target }
  }

  reset(animate = true) {
    this.selected = null
    const { pos, target } = this.defaultCam()
    if (animate) this.flyTo(pos, target)
    else if (this.controls) { this.camera.position.copy(pos); this.controls.target.copy(target); this.controls.update() }
  }

  setExplode(on: boolean, refocus = true) {
    this.explodeTarget = on ? 1 : 0
    this.onExplode?.(on)
    if (!refocus) return
    if (this.selected) this.focus(this.selected)
    else { const { pos, target } = this.defaultCam(); this.flyTo(pos, target) }
  }

  /** Мгновенный зум без анимации, для щипка: factor < 1 приближает. */
  dolly(factor: number) {
    const c = this.controls
    if (!c) return
    this.tween = null
    c.autoRotate = false
    const off = this.camera.position.clone().sub(c.target)
    const len = THREE.MathUtils.clamp(off.length() * factor, c.minDistance, c.maxDistance)
    this.camera.position.copy(c.target).add(off.setLength(len))
  }

  zoom(factor: number) {
    if (!this.controls) return
    const tgt = this.controls.target.clone()
    const off = this.camera.position.clone().sub(tgt)
    const len = THREE.MathUtils.clamp(off.length() * factor, this.controls.minDistance, this.controls.maxDistance)
    this.flyTo(tgt.clone().add(off.setLength(len)), tgt, 450)
  }

  playCode(cat: Category) { this.play = { cat, start: this.now } }
  get explodeLevel() { return this.explodeNow }
  get playing() { return this.play?.cat ?? null }

  focus(id: PartId) {
    const m = this.model
    if (!m || !this.controls) return
    this.selected = id
    if (INTERNAL.has(id) && !this.explodeTarget) { this.explodeTarget = 1; this.onExplode?.(true) }
    // Положение якоря в конечном состоянии разборки
    m.root.rotation.copy(POSE)
    m.setExplode(this.explodeTarget)
    m.root.updateMatrixWorld(true)
    const target = m.anchors[id].obj.getWorldPosition(new THREE.Vector3())
    m.setExplode(this.explodeNow)
    const f = FOCUS[id]
    const dir = new THREE.Vector3(...f.dir).normalize().applyEuler(POSE)
    // На узком экране отодвигаемся, чтобы деталь целиком помещалась по ширине
    const narrow = Math.max(1, 0.95 / this.aspect())
    this.flyTo(target.clone().addScaledVector(dir, f.dist * narrow), target)
  }

  private flyTo(pos: THREE.Vector3, target: THREE.Vector3, dur = 950) {
    if (!this.controls) return
    this.controls.autoRotate = false
    this.tween = { p0: this.camera.position.clone(), p1: pos, t0: this.controls.target.clone(), t1: target, start: this.now, dur: reduced() ? 1 : dur }
  }

  tick(t: number, dt: number) {
    this.now = t
    const k = 1 - Math.exp(-dt * 3.2)
    this.explodeNow += (this.explodeTarget - this.explodeNow) * k
    if (Math.abs(this.explodeTarget - this.explodeNow) < 0.001) this.explodeNow = this.explodeTarget
    const c = this.controls
    if (!c) return
    if (this.tween) {
      const tw = this.tween
      const p = Math.min(1, (t - tw.start) / tw.dur)
      const e = ease(p)
      // Летим по дуге вокруг цели, чтобы не проходить сквозь браслет
      const a = tw.p0.clone().sub(tw.t0), b = tw.p1.clone().sub(tw.t1)
      const len = THREE.MathUtils.lerp(a.length(), b.length(), e)
      const dir = a.normalize().lerp(b.normalize(), e).normalize()
      c.target.lerpVectors(tw.t0, tw.t1, e)
      this.camera.position.copy(c.target).addScaledVector(dir, len)
      if (p >= 1) this.tween = null
    }
    c.update(dt)
  }

  apply(m: BraceletModel, t: number) {
    m.root.rotation.copy(POSE)
    m.root.position.set(0, 0, 0)
    m.setExplode(this.explodeNow)
    m.setHighlight(this.selected, 0.16 + 0.12 * Math.sin(t * 0.005))
    if (this.play) {
      const ms = t - this.play.start
      const f = codeFrame(this.play.cat, ms)
      if (ms > f.total + 1200) { this.play = null; ledFor(m, null, null, 0.45); m.setShake(0, t) }
      else { ledFor(m, this.play.cat, f); m.setShake(f.vib && !reduced() ? 1 : 0, t) }
    } else { ledFor(m, null, null, 0.45); m.setShake(0, t) }
  }

  after(m: BraceletModel) { this.onAfter?.(m, this.camera) }
}
