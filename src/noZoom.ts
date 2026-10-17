// Отключение масштабирования страницы. Meta viewport и touch-action покрывают
// Android/Chrome; iOS Safari игнорирует user-scalable, поэтому дополнительно
// гасим жесты gesturestart и pinch через ctrl+wheel, двойной тап отключает touch-action: manipulation в CSS.
export function initNoZoom() {
  const prevent = (e: Event) => e.preventDefault()
  document.addEventListener('gesturestart', prevent, { passive: false })
  document.addEventListener('gesturechange', prevent, { passive: false })
  document.addEventListener(
    'wheel',
    (e) => { if (e.ctrlKey) e.preventDefault() },
    { passive: false },
  )
  document.addEventListener(
    'keydown',
    (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0')) e.preventDefault()
    },
  )
}
