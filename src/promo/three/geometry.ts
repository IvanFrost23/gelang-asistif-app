/**
 * Процедурная геометрия браслета. Единицы: миллиметры.
 * Плоское локальное пространство корпуса: x вдоль ремешка, y наружу от запястья, z поперёк ремешка.
 */
import * as THREE from 'three'

/** Опорная рамка сечения: p — центр, u — направление толщины (наружу), v — направление ширины. */
export type Frame = { p: THREE.Vector3; u: THREE.Vector3; v: THREE.Vector3 }

const sgnPow = (x: number, e: number) => Math.sign(x) * Math.pow(Math.abs(x), e)

/**
 * Протягивает сечение-сквиркл вдоль рамок.
 * halfU/halfV — полутолщина и полуширина в каждой точке. power: 2 — круг/эллипс, 4 — скруглённый прямоугольник.
 * Концы не закрываются крышками: их нужно сужать до нуля или прятать.
 */
export function sweep(frames: Frame[], halfU: number[], halfV: number[], opts: { closed: boolean; k?: number; power?: number }) {
  const K = opts.k ?? 28
  const e = 2 / (opts.power ?? 4)
  const M = frames.length
  const pos = new Float32Array(M * K * 3)
  const tmp = new THREE.Vector3()
  for (let i = 0; i < M; i++) {
    const { p, u, v } = frames[i]
    for (let j = 0; j < K; j++) {
      const a = (j / K) * Math.PI * 2
      const cu = sgnPow(Math.cos(a), e) * halfU[i]
      const cv = sgnPow(Math.sin(a), e) * halfV[i]
      tmp.copy(p).addScaledVector(u, cu).addScaledVector(v, cv)
      pos.set([tmp.x, tmp.y, tmp.z], (i * K + j) * 3)
    }
  }
  // Ориентация треугольников: наружу, если (u × v) смотрит вдоль пути.
  const along = new THREE.Vector3().subVectors(frames[1].p, frames[0].p)
  const flip = new THREE.Vector3().crossVectors(frames[0].u, frames[0].v).dot(along) < 0
  const idx: number[] = []
  const rows = opts.closed ? M : M - 1
  for (let i = 0; i < rows; i++) {
    const i2 = (i + 1) % M
    for (let j = 0; j < K; j++) {
      const j2 = (j + 1) % K
      const a = i * K + j, b = i * K + j2, c = i2 * K + j, d = i2 * K + j2
      if (flip) idx.push(a, c, b, b, c, d)
      else idx.push(a, b, c, b, d, c)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

/** Профиль скруглённой пластины: точки [ρ, y] от центра верха по краю к центру низа. */
export function slabProfile(o: { B: number; y0: number; y1: number; rt: number; rb: number; dome?: number }) {
  const { B, y0, y1, rt, rb } = o
  const dome = o.dome ?? 0
  const top = (r: number) => y1 - dome * (r / B) ** 2
  const pts: [number, number][] = []
  const nTop = 10, nArc = 9
  for (let i = 0; i <= nTop; i++) { const r = ((B - rt) * i) / nTop; pts.push([r, top(r)]) }
  const ye = top(B - rt)
  for (let i = 1; i <= nArc; i++) {
    const a = (Math.PI / 2) * (1 - i / nArc)
    pts.push([B - rt + rt * Math.cos(a), ye - rt + rt * Math.sin(a)])
  }
  for (let i = 1; i <= nArc; i++) {
    const a = -(Math.PI / 2) * (i / nArc)
    pts.push([B - rb + rb * Math.cos(a), y0 + rb + rb * Math.sin(a)])
  }
  for (let i = 1; i <= 6; i++) { const r = (B - rb) * (1 - i / 6); pts.push([r, y0]) }
  return pts
}

/**
 * Пластина в форме «стадиона» (пилюли) длиной L и полушириной B: профиль вращается вокруг осевого отрезка.
 * Верх и низ плотно разбиты вдоль длины, поэтому пластину можно изгибать.
 */
export function stadiumSlab(L: number, B: number, profile: [number, number][], nk = 160) {
  const h = Math.max(0, L / 2 - B)
  const per = 4 * h + 2 * Math.PI * B
  const S: [number, number][] = [], D: [number, number][] = []
  for (let k = 0; k < nk; k++) {
    let s = (k / nk) * per
    if (s < Math.PI * B) { const a = -Math.PI / 2 + s / B; S.push([h, 0]); D.push([Math.cos(a), Math.sin(a)]); continue }
    s -= Math.PI * B
    if (s < 2 * h) { S.push([h - s, 0]); D.push([0, 1]); continue }
    s -= 2 * h
    if (s < Math.PI * B) { const a = Math.PI / 2 + s / B; S.push([-h, 0]); D.push([Math.cos(a), Math.sin(a)]); continue }
    s -= Math.PI * B
    S.push([-h + s, 0]); D.push([0, -1])
  }
  const R = profile.length
  const pos = new Float32Array(R * nk * 3)
  for (let j = 0; j < R; j++) {
    const [rho, y] = profile[j]
    for (let k = 0; k < nk; k++) {
      pos.set([S[k][0] + D[k][0] * rho, y, S[k][1] + D[k][1] * rho], (j * nk + k) * 3)
    }
  }
  const idx: number[] = []
  for (let j = 0; j < R - 1; j++) {
    for (let k = 0; k < nk; k++) {
      const k2 = (k + 1) % nk
      const a = j * nk + k, b = j * nk + k2, c = (j + 1) * nk + k, d = (j + 1) * nk + k2
      idx.push(a, c, b, b, c, d)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setIndex(idx)
  // Проверка ориентации по треугольнику на верхней грани
  const p = (i: number) => new THREE.Vector3().fromBufferAttribute(g.attributes.position as THREE.BufferAttribute, i)
  const t0 = idx.findIndex((_, i) => i % 3 === 0 && i / 3 >= nk * 2 && i / 3 < nk * 4)
  const [a, b, c] = [idx[t0], idx[t0 + 1], idx[t0 + 2]]
  const n = new THREE.Vector3().crossVectors(p(b).sub(p(a)), p(c).sub(p(a)))
  if (n.y < 0) { for (let i = 0; i < idx.length; i += 3) { const t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t } g.setIndex(idx) }
  g.computeVertexNormals()
  return g
}

/** Дуга, по которой изогнут корпус: радиус R вокруг центра (0, cy). y=0 плоского пространства ложится на радиус R. */
export type Arc = { R: number; cy: number }

export function bend(g: THREE.BufferGeometry, arc: Arc) {
  const p = g.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i)
    const th = x / arc.R, r = arc.R + y
    p.setXYZ(i, r * Math.sin(th), arc.cy + r * Math.cos(th), z)
  }
  p.needsUpdate = true
  g.computeVertexNormals()
  g.computeBoundingSphere()
  return g
}

/** Ставит жёсткую деталь на дугу: x — положение вдоль ремешка, y — высота над осью ремешка. */
export function placeOnArc(o: THREE.Object3D, arc: Arc, x: number, y: number, z = 0) {
  const th = x / arc.R, r = arc.R + y
  o.position.set(r * Math.sin(th), arc.cy + r * Math.cos(th), z)
  o.rotation.set(0, 0, -th)
  return o
}

/** Мягкая текстура свечения для спрайтов. */
export function glowTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  r.addColorStop(0, 'rgba(255,255,255,1)')
  r.addColorStop(0.25, 'rgba(255,255,255,.55)')
  r.addColorStop(0.6, 'rgba(255,255,255,.12)')
  r.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = r
  g.fillRect(0, 0, 128, 128)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/** Текстура с надписью для маркировки деталей (ESP32, батарея). */
export function labelTexture(lines: { text: string; size: number; color: string; weight?: number }[], bg: string, w = 512, h = 256) {
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  const g = c.getContext('2d')!
  g.fillStyle = bg
  g.fillRect(0, 0, w, h)
  const total = lines.reduce((s, l) => s + l.size * 1.25, 0)
  let y = (h - total) / 2
  g.textAlign = 'center'
  g.textBaseline = 'top'
  for (const l of lines) {
    g.font = `${l.weight ?? 700} ${l.size}px "Plus Jakarta Sans", system-ui, sans-serif`
    g.fillStyle = l.color
    g.fillText(l.text, w / 2, y)
    y += l.size * 1.25
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}
