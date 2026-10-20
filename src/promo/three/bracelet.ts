/**
 * 3D-модель браслета по карточке прототипа и таблице 5 книги:
 * силиконовый ремешок с пряжкой, корпус-пилюля с чёрным стеклом, LED-полоса, одна кнопка, отверстие микрофона,
 * внутри ESP32, батарея, монетный вибромотор, снизу контакты зарядки.
 * Корпус можно «разобрать» (explode): слои поднимаются над ремешком.
 */
import * as THREE from 'three'
import { sweep, slabProfile, stadiumSlab, bend, placeOnArc, glowTexture, labelTexture, type Frame, type Arc } from './geometry'

export type PartId = 'led' | 'button' | 'mic' | 'esp32' | 'battery' | 'motor' | 'port' | 'strap' | 'buckle'
export const PART_IDS: PartId[] = ['led', 'button', 'mic', 'esp32', 'battery', 'motor', 'port', 'strap', 'buckle']
/** Детали, которые видно только в разобранном виде. */
export const INTERNAL = new Set<PartId>(['esp32', 'battery', 'motor'])
/** Подписи разобранного вида. */
export type InnerId = 'glass' | 'led' | 'button' | 'esp32' | 'battery' | 'motor' | 'port'
export const INNER_IDS: InnerId[] = ['glass', 'led', 'button', 'esp32', 'battery', 'motor', 'port']

// Средняя линия ремешка — эллипс; корпус изогнут по радиусу кривизны эллипса в верхней точке.
const EA = 31, EB = 24.5
const TH = 2.6, WD = 18.5
const ARC: Arc = { R: (EA * EA) / EB, cy: EB - (EA * EA) / EB }
const PHI_BUCKLE = -0.62

const ellipse = (phi: number) => ({
  p: new THREE.Vector3(EA * Math.cos(phi), EB * Math.sin(phi), 0),
  t: new THREE.Vector3(-EA * Math.sin(phi), EB * Math.cos(phi), 0).normalize(),
  n: new THREE.Vector3(EB * Math.cos(phi), EA * Math.sin(phi), 0).normalize(),
})
const Z = new THREE.Vector3(0, 0, 1)
const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }

export interface Anchor { obj: THREE.Object3D; normal: THREE.Vector3 }

export interface BraceletModel {
  root: THREE.Group
  body: THREE.Group
  meshes: THREE.Mesh[]
  anchors: Record<PartId, Anchor>
  inner: Record<InnerId, Anchor>
  center: THREE.Vector3
  setLed(color: THREE.ColorRepresentation, level: number): void
  setExplode(e: number): void
  setHighlight(id: PartId | null, amount: number): void
  setShake(amount: number, time: number): void
}

function silicone(color = '#a395ef') {
  return new THREE.MeshPhysicalMaterial({
    color, roughness: 0.52, metalness: 0, sheen: 0.8, sheenColor: new THREE.Color('#efe9ff'), sheenRoughness: 0.45,
    clearcoat: 0.3, clearcoatRoughness: 0.5,
  })
}
const std = (color: string, metalness: number, roughness: number) => new THREE.MeshStandardMaterial({ color, metalness, roughness })

function pcbTexture(seed: number) {
  const c = document.createElement('canvas')
  c.width = 512; c.height = 256
  const g = c.getContext('2d')!
  g.fillStyle = '#0f3a38'; g.fillRect(0, 0, 512, 256)
  let s = seed
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647
  g.strokeStyle = 'rgba(214,180,90,.55)'; g.lineWidth = 3
  for (let i = 0; i < 46; i++) {
    let x = rnd() * 512, y = rnd() * 256
    g.beginPath(); g.moveTo(x, y)
    for (let k = 0; k < 3; k++) { if (rnd() > 0.5) x += (rnd() - 0.5) * 220; else y += (rnd() - 0.5) * 140; g.lineTo(x, y) }
    g.stroke()
  }
  g.fillStyle = 'rgba(232,198,106,.9)'
  for (let i = 0; i < 40; i++) { g.beginPath(); g.arc(rnd() * 512, rnd() * 256, 4, 0, Math.PI * 2); g.fill() }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4
  return t
}

export function buildBracelet(): BraceletModel {
  const root = new THREE.Group()
  const body = new THREE.Group()
  root.add(body)
  const meshes: THREE.Mesh[] = []
  const add = (parent: THREE.Object3D, g: THREE.BufferGeometry, m: THREE.Material | THREE.Material[], part: PartId | null) => {
    const mesh = new THREE.Mesh(g, m)
    mesh.userData.part = part
    parent.add(mesh)
    meshes.push(mesh)
    return mesh
  }

  // ---------- Ремешок ----------
  const strapMat = silicone()
  const loopFrames: Frame[] = [], lu: number[] = [], lv: number[] = []
  const NL = 360
  for (let i = 0; i < NL; i++) {
    const e = ellipse((i / NL) * Math.PI * 2)
    loopFrames.push({ p: e.p, u: e.n, v: Z }); lu.push(TH / 2); lv.push(WD / 2)
  }
  add(body, sweep(loopFrames, lu, lv, { closed: true, k: 32 }), strapMat, 'strap')

  // Хвост ремешка: выходит из-под пряжки и лежит поверх, кончик скруглён.
  const tailStart = PHI_BUCKLE - 0.2, tailEnd = PHI_BUCKLE + 1.36, NT = 220
  const lift = TH + 0.12
  const tail: { p: THREE.Vector3; t: THREE.Vector3; n: THREE.Vector3; s: number }[] = []
  let acc = 0
  for (let i = 0; i < NT; i++) {
    const phi = tailStart + ((tailEnd - tailStart) * i) / (NT - 1)
    const e = ellipse(phi)
    const p = e.p.clone().addScaledVector(e.n, lift * smooth(PHI_BUCKLE - 0.17, PHI_BUCKLE - 0.02, phi))
    if (i > 0) acc += p.distanceTo(tail[i - 1].p)
    tail.push({ p, t: e.t, n: e.n, s: acc })
  }
  const tailLen = acc, tip = WD / 2
  const tu: number[] = [], tv: number[] = []
  for (const f of tail) {
    const rem = tailLen - f.s
    const k = rem < tip ? Math.sqrt(Math.max(0, 1 - ((tip - rem) / tip) ** 2)) : 1
    tu.push((TH / 2) * Math.pow(k, 0.35)); tv.push((WD / 2) * k)
  }
  add(body, sweep(tail.map((f) => ({ p: f.p, u: f.n, v: Z })), tu, tv, { closed: false, k: 32 }), strapMat, 'strap')
  const tailAt = (s: number) => {
    const i = Math.max(0, tail.findIndex((f) => f.s >= s))
    return tail[i]
  }
  const sBuckle = tail[Math.round(((PHI_BUCKLE - tailStart) / (tailEnd - tailStart)) * (NT - 1))].s

  // Кольцо вокруг сечения ремешка (пряжка, шлёвка): путь — скруглённый прямоугольник в плоскости (n, z).
  const ringAround = (c: THREE.Vector3, n: THREE.Vector3, t: THREE.Vector3, hu: number, hv: number, tubeU: number, tubeV: number, power: number) => {
    const frames: Frame[] = [], u: number[] = [], v: number[] = []
    const N = 96
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2
      const cu = Math.sign(Math.cos(a)) * Math.pow(Math.abs(Math.cos(a)), 0.25)
      const cv = Math.sign(Math.sin(a)) * Math.pow(Math.abs(Math.sin(a)), 0.25)
      const p = c.clone().addScaledVector(n, cu * hu).addScaledVector(Z, cv * hv)
      frames.push({ p, u: new THREE.Vector3(), v: t.clone() }); u.push(tubeU); v.push(tubeV)
    }
    for (let i = 0; i < N; i++) {
      const tan = frames[(i + 1) % N].p.clone().sub(frames[(i + N - 1) % N].p)
      const out = new THREE.Vector3().crossVectors(tan, t).normalize()
      if (out.dot(frames[i].p.clone().sub(c)) < 0) out.negate()
      frames[i].u = out
    }
    return sweep(frames, u, v, { closed: true, k: 20, power })
  }

  // Пряжка: металлическая рамка вокруг хвоста и язычок, входящий в первое отверстие.
  const buckleGroup = new THREE.Group()
  body.add(buckleGroup)
  const metal = std('#dcd9ea', 1, 0.2)
  const fb = tail.find((f) => f.s >= sBuckle) ?? tail[0]
  const frameC = fb.p.clone()
  add(buckleGroup, ringAround(frameC, fb.n, fb.t, TH / 2 + 0.95, WD / 2 + 0.95, 0.62, 0.62, 2), metal, 'buckle')
  const hole0 = tailAt(sBuckle + 5)
  const tongueLen = hole0.p.distanceTo(frameC)
  const tongue = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, tongueLen, 6, 12), metal)
  tongue.userData.part = 'buckle'
  {
    const top = frameC.clone().addScaledVector(fb.n, TH / 2 + 0.5)
    const end = hole0.p.clone().addScaledVector(hole0.n, TH / 2 + 0.25)
    tongue.position.copy(top).add(end).multiplyScalar(0.5)
    tongue.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(top).normalize())
  }
  buckleGroup.add(tongue); meshes.push(tongue)

  // Шлёвка (силиконовая петля) вокруг обоих слоёв.
  const keep = tailAt(sBuckle + 10.5)
  const keepC = keep.p.clone().addScaledVector(keep.n, -lift / 2)
  add(body, ringAround(keepC, keep.n, keep.t, TH / 2 + lift / 2 + 0.55, WD / 2 + 0.55, 0.6, 2.1, 4), strapMat, 'strap')

  // Отверстия на хвосте.
  const holeMat = std('#2b2270', 0, 1)
  const holeGeo = new THREE.CylinderGeometry(1.1, 1.1, 0.2, 28)
  const holeAt = [sBuckle + 5]
  for (let s = sBuckle + 15.5; s < tailLen - 7; s += 5) holeAt.push(s)
  for (const s of holeAt) {
    const f = tailAt(s)
    const h = new THREE.Mesh(holeGeo, holeMat)
    h.position.copy(f.p).addScaledVector(f.n, TH / 2 - 0.07)
    h.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(f.t, f.n, new THREE.Vector3().crossVectors(f.t, f.n)))
    h.scale.set(1.5, 1, 1)
    h.userData.part = 'strap'
    body.add(h); meshes.push(h)
  }

  // ---------- Корпус ----------
  const slab = (L: number, B: number, p: Parameters<typeof slabProfile>[0]) => bend(stadiumSlab(L, B, slabProfile(p)), ARC)
  add(body, slab(48, 12, { B: 12, y0: -2.6, y1: 5.6, rt: 2.6, rb: 1.6, dome: 0.3 }), silicone(), 'strap')
  const bezel = add(body, slab(41.6, 9.3, { B: 9.3, y0: 2, y1: 6.5, rt: 1.3, rb: 0.5 }), std('#2c2752', 0.85, 0.26), null)
  bezel.userData.part = null

  // Слой стекла: стекло, светящаяся полоса, кнопка, микрофон.
  const glassLayer = new THREE.Group(); body.add(glassLayer)
  const glass = add(glassLayer, slab(40, 8.5, { B: 8.5, y0: 3, y1: 7.6, rt: 1.7, rb: 0.5, dome: 0.5 }),
    new THREE.MeshPhysicalMaterial({ color: '#06050d', roughness: 0.07, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.03 }), 'led')
  glass.userData.noHighlight = true
  const barMat = new THREE.MeshStandardMaterial({ color: '#000', emissive: new THREE.Color('#a99cf2'), emissiveIntensity: 0.5, roughness: 0.3, toneMapped: false })
  const bar = new THREE.Mesh(bend(stadiumSlab(17, 1.35, slabProfile({ B: 1.35, y0: 6.9, y1: 7.72, rt: 0.6, rb: 0.2 }), 64).translate(3, 0, 0), ARC), barMat)
  bar.userData.part = 'led'
  glassLayer.add(bar); meshes.push(bar)

  const btnCap = new THREE.Mesh(new THREE.CylinderGeometry(3, 3.1, 0.7, 48), new THREE.MeshPhysicalMaterial({ color: '#1c1934', roughness: 0.35, clearcoat: 0.7, clearcoatRoughness: 0.2 }))
  placeOnArc(btnCap, ARC, -13.5, 7.55); btnCap.userData.part = 'button'
  const btnRing = new THREE.Mesh(new THREE.TorusGeometry(3.35, 0.3, 16, 64), std('#c7befa', 1, 0.24))
  btnRing.rotation.x = Math.PI / 2
  const ringHolder = placeOnArc(new THREE.Group(), ARC, -13.5, 7.5); ringHolder.add(btnRing); btnRing.userData.part = 'button'
  const micHole = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.4, 24), std('#000', 0, 1))
  placeOnArc(micHole, ARC, 15.2, 7.38, 3.6); micHole.userData.part = 'mic'
  const micRing = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.14, 8, 32), std('#7a72b8', 1, 0.3))
  micRing.rotation.x = Math.PI / 2
  const micHolder = placeOnArc(new THREE.Group(), ARC, 15.2, 7.4, 3.6); micHolder.add(micRing); micRing.userData.part = 'mic'
  glassLayer.add(btnCap, ringHolder, micHole, micHolder)
  meshes.push(btnCap, btnRing, micHole, micRing)

  // Свечение LED: спрайты вдоль полосы и точечный свет.
  const gtex = glowTexture()
  const glows: THREE.Sprite[] = []
  for (const [x, s] of [[-3, 13], [3, 15], [9, 13], [3, 34]] as const) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: gtex, color: '#a99cf2', transparent: true, depthWrite: false, opacity: 0.6 }))
    placeOnArc(sp, ARC, x, 8.4); sp.rotation.set(0, 0, 0)
    sp.scale.setScalar(s); sp.renderOrder = 5; sp.userData.base = s
    glassLayer.add(sp); glows.push(sp)
  }
  const ledLight = new THREE.PointLight('#a99cf2', 0, 70, 2)
  placeOnArc(ledLight, ARC, 3, 12)
  glassLayer.add(ledLight)

  // ---------- Внутренние слои ----------
  const internals: THREE.Object3D[] = []
  const flat = (o: THREE.Object3D, x: number, y: number, z = 0) => { placeOnArc(o, ARC, x, y, z); return o }

  // Верхняя плата: RGB-светодиод, тактовая кнопка, MEMS-микрофон.
  const topLayer = new THREE.Group(); body.add(topLayer); internals.push(topLayer)
  const pcbSide = std('#0d302f', 0.1, 0.6)
  const pcbTop = (seed: number) => new THREE.MeshStandardMaterial({ map: pcbTexture(seed), roughness: 0.55, metalness: 0.1 })
  // Гибкая плата повторяет изгиб корпуса и не выходит за стекло
  const topBoard = new THREE.Mesh(bend(new THREE.BoxGeometry(34, 0.7, 9, 48, 1, 1).translate(0, 5.4, 0), ARC), [pcbSide, pcbSide, pcbTop(7), pcbSide, pcbSide, pcbSide])
  topBoard.userData.part = null
  topLayer.add(topBoard); meshes.push(topBoard)
  const ledPkg = new THREE.Mesh(new THREE.BoxGeometry(5, 1.4, 5), std('#f2f0f7', 0, 0.4)); ledPkg.userData.part = 'led'
  const ledLensMat = new THREE.MeshStandardMaterial({ color: '#000', emissive: new THREE.Color('#a99cf2'), emissiveIntensity: 1, toneMapped: false })
  const ledLens = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.3, 32), ledLensMat); ledLens.userData.part = 'led'
  ledLens.position.y = 0.75; ledPkg.add(ledLens)
  topLayer.add(flat(ledPkg, 3, 6.4)); meshes.push(ledPkg, ledLens)
  const sw = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.6, 5.2), std('#d5d6dd', 1, 0.3)); sw.userData.part = 'button'
  const swCap = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.9, 24), std('#15121f', 0, 0.5)); swCap.position.y = 1.1; swCap.userData.part = 'button'
  sw.add(swCap)
  topLayer.add(flat(sw, -13.5, 6.5)); meshes.push(sw, swCap)
  const mic = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.1, 2.7), std('#c9c9d3', 1, 0.3)); mic.userData.part = 'mic'
  topLayer.add(flat(mic, 15.2, 6.3, 3.6)); meshes.push(mic)

  // Основная плата: ESP32 под экраном с маркировкой.
  const mainLayer = new THREE.Group(); body.add(mainLayer); internals.push(mainLayer)
  const mainBoard = new THREE.Mesh(new THREE.BoxGeometry(31, 1, 13), [pcbSide, pcbSide, pcbTop(3), pcbSide, pcbSide, pcbSide])
  mainBoard.userData.part = 'esp32'
  mainLayer.add(flat(mainBoard, 0, 3.6)); meshes.push(mainBoard)
  const shieldSide = std('#c8c8d2', 1, 0.32)
  const shieldTop = new THREE.MeshStandardMaterial({
    map: labelTexture([{ text: 'ESP32', size: 92, color: '#2a2a33', weight: 800 }, { text: 'Wi-Fi · Bluetooth', size: 40, color: '#4a4a55', weight: 600 }], '#cfd0d8'),
    metalness: 0.7, roughness: 0.35,
  })
  const shield = new THREE.Mesh(new THREE.BoxGeometry(15, 2, 11.5), [shieldSide, shieldSide, shieldTop, shieldSide, shieldSide, shieldSide])
  shield.userData.part = 'esp32'
  mainLayer.add(flat(shield, -4.5, 5.1)); meshes.push(shield)
  const antenna = new THREE.Mesh(new THREE.BoxGeometry(6, 0.3, 10), std('#d6b45a', 1, 0.3)); antenna.userData.part = 'esp32'
  mainLayer.add(flat(antenna, 9.5, 4.2)); meshes.push(antenna)
  for (const [x, z] of [[5, -4], [5, 4.2]] as const) {
    const chip = new THREE.Mesh(new THREE.BoxGeometry(3, 0.8, 2.4), std('#16151c', 0.2, 0.5)); chip.userData.part = 'esp32'
    mainLayer.add(flat(chip, x, 4.5, z)); meshes.push(chip)
  }

  // Питание и вибрация: батарея и монетный мотор.
  const powerLayer = new THREE.Group(); body.add(powerLayer); internals.push(powerLayer)
  const foil = std('#cfd1da', 0.9, 0.38)
  const battTop = new THREE.MeshStandardMaterial({
    map: labelTexture([{ text: 'Li-Po', size: 96, color: '#3a2c00', weight: 800 }, { text: '3.7 V · rechargeable', size: 38, color: '#5a4700', weight: 600 }], '#f2c94c'),
    roughness: 0.5,
  })
  const battery = new THREE.Mesh(new THREE.BoxGeometry(20, 3.2, 12.4), [foil, foil, battTop, foil, foil, foil])
  battery.userData.part = 'battery'
  powerLayer.add(flat(battery, -7, 1.4)); meshes.push(battery)
  const motorMat = std('#c3c5d0', 1, 0.28)
  const motor = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 2.8, 64), motorMat); motor.userData.part = 'motor'
  const motorTop = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.18, 8, 48), std('#9a9daa', 1, 0.4)); motorTop.rotation.x = Math.PI / 2; motorTop.position.y = 1.42
  motorTop.userData.part = 'motor'; motor.add(motorTop)
  powerLayer.add(flat(motor, 11, 1.4)); meshes.push(motor, motorTop)
  for (const [dz, col] of [[-0.8, '#d43a3a'], [0.8, '#1d1b24']] as const) {
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(-4.6, 0, dz), new THREE.Vector3(-6.5, 0.6, dz * 1.5), new THREE.Vector3(-8, 1.3, dz * 2.5)])
    const w = new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.3, 8), std(col, 0, 0.5)); w.userData.part = 'motor'
    motor.add(w); meshes.push(w)
  }

  // Задняя крышка с контактами зарядки.
  const backLayer = new THREE.Group(); body.add(backLayer)
  add(backLayer, slab(30, 8, { B: 8, y0: -3.7, y1: -2.3, rt: 0.5, rb: 0.9 }), std('#25213f', 0.35, 0.42), 'port')
  for (const x of [-3.5, 3.5]) {
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.5, 32), std('#e7c467', 1, 0.22)); pin.userData.part = 'port'
    backLayer.add(placeOnArc(pin, ARC, x, -3.75)); meshes.push(pin)
  }

  // ---------- Якоря для подписей и точек ----------
  const anchor = (parent: THREE.Object3D, p: THREE.Vector3, n: THREE.Vector3): Anchor => {
    const o = new THREE.Object3D(); o.position.copy(p); parent.add(o)
    return { obj: o, normal: n.normalize() }
  }
  const onArc = (x: number, y: number, z = 0) => { const o = placeOnArc(new THREE.Object3D(), ARC, x, y, z); return o.position.clone() }
  const radial = (x: number) => new THREE.Vector3(Math.sin(x / ARC.R), Math.cos(x / ARC.R), 0)
  const strapPt = ellipse(3.55)
  const anchors: Record<PartId, Anchor> = {
    led: anchor(glassLayer, onArc(3, 7.9), radial(3)),
    button: anchor(glassLayer, onArc(-13.5, 8), radial(-13.5)),
    mic: anchor(glassLayer, onArc(15.2, 7.5, 3.6), radial(15.2)),
    esp32: anchor(mainLayer, onArc(-4.5, 6.2), radial(-4.5).add(new THREE.Vector3(0, 0, 0.4))),
    battery: anchor(powerLayer, onArc(-7, 3.1), radial(-7).add(new THREE.Vector3(0, 0, 0.4))),
    motor: anchor(powerLayer, onArc(11, 2.9), radial(11).add(new THREE.Vector3(0, 0, 0.4))),
    port: anchor(backLayer, onArc(0, -4.1), radial(0).negate().add(new THREE.Vector3(0, 0, 0.45))),
    strap: anchor(body, strapPt.p.clone().addScaledVector(strapPt.n, TH / 2).add(new THREE.Vector3(0, 0, WD / 2 - 2)), strapPt.n.clone().multiplyScalar(0.7).add(Z)),
    buckle: anchor(buckleGroup, frameC.clone().addScaledVector(fb.n, TH / 2 + 1.6).add(new THREE.Vector3(0, 0, WD / 2 - 1)), fb.n.clone().add(new THREE.Vector3(0, 0, 0.9))),
  }

  const inner: Record<InnerId, Anchor> = {
    glass: anchor(glassLayer, onArc(-5, 7.8, -4.5), radial(-5)),
    led: anchor(topLayer, onArc(3, 7.3), radial(3)),
    button: anchor(topLayer, onArc(-13.5, 8.1), radial(-13.5)),
    esp32: anchors.esp32, battery: anchors.battery, motor: anchors.motor, port: anchors.port,
  }

  // ---------- Состояние ----------
  const ledColor = new THREE.Color()
  const accent = new THREE.Color('#8b7cf6')
  let explodeNow = -1

  const setLed = (color: THREE.ColorRepresentation, level: number) => {
    ledColor.set(color)
    const lv = Math.max(0, Math.min(1, level))
    barMat.emissive.copy(ledColor)
    barMat.emissiveIntensity = 0.18 + lv * 1.05
    ledLensMat.emissive.copy(ledColor)
    ledLensMat.emissiveIntensity = 0.3 + lv
    for (const g of glows) {
      g.material.color.copy(ledColor)
      g.material.opacity = (g.userData.base > 20 ? 0.28 : 0.75) * (0.12 + lv * 0.88)
    }
    ledLight.color.copy(ledColor)
    ledLight.intensity = lv * 260
  }

  const setExplode = (e: number) => {
    if (e === explodeNow) return
    explodeNow = e
    const k = e * e * (3 - 2 * e)
    glassLayer.position.y = 48 * k
    topLayer.position.y = 35 * smooth(0.05, 0.9, e)
    mainLayer.position.y = 23 * smooth(0.1, 0.95, e)
    powerLayer.position.y = 11.5 * smooth(0.15, 1, e)
    backLayer.position.y = -14 * k
    for (const o of internals) o.visible = e > 0.02
  }

  let hlId: PartId | null = null
  const setHighlight = (id: PartId | null, amount: number) => {
    for (const m of meshes) {
      const mat = m.material
      const list = Array.isArray(mat) ? mat : [mat]
      for (const x of list) {
        if (x === barMat || x === ledLensMat || m.userData.noHighlight || !('emissive' in x)) continue
        const sx = x as THREE.MeshStandardMaterial
        if (m.userData.part === id && id) { sx.emissive.copy(accent); sx.emissiveIntensity = amount }
        else if (hlId && sx.emissiveIntensity !== 0) { sx.emissive.setRGB(0, 0, 0); sx.emissiveIntensity = 0 }
      }
    }
    hlId = id
  }

  // Материалы, общие для нескольких мешей, разделяем, чтобы подсветка была по деталям.
  const seen = new Map<THREE.Material, PartId | null>()
  for (const m of meshes) {
    if (Array.isArray(m.material)) continue
    const owner = seen.get(m.material)
    if (owner === undefined) seen.set(m.material, m.userData.part)
    else if (owner !== m.userData.part) m.material = m.material.clone()
  }

  // Лёгкое плавное дрожание вдоль ремешка: 12 Гц, амплитуда 0.12 мм (меньше пикселя на экране).
  // Резкая тряска по трём осям с поворотом укачивала, вибрацию и так видно по LED.
  const setShake = (amount: number, time: number) => {
    body.rotation.set(0, 0, 0)
    if (amount <= 0) { body.position.set(0, 0, 0); return }
    body.position.set(Math.sin(time * 0.001 * Math.PI * 2 * 12) * 0.12 * amount, 0, 0)
  }

  setLed('#a99cf2', 0.4)
  setExplode(0)
  return { root, body, meshes, anchors, inner, center: new THREE.Vector3(0, 3, 0), setLed, setExplode, setHighlight, setShake }
}

