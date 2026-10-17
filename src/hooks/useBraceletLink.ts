import { useEffect } from 'react'
import { onAccepted } from '../events/pipeline'
import { useBraceletPlayer } from './useBraceletPlayer'

/** Браслет на экране, который реагирует на все принятые события конвейера. */
export function useBraceletLink() {
  const player = useBraceletPlayer()
  useEffect(() => onAccepted((e) => player.play(e.category)), [player.play])
  return player
}
