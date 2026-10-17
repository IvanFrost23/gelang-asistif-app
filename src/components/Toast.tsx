import { useEffect, useState } from 'react'

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null)
  useEffect(() => {
    if (!msg) return
    const t = setTimeout(() => setMsg(null), 1800)
    return () => clearTimeout(t)
  }, [msg])
  return { msg, show: setMsg }
}

export default function Toast({ msg }: { msg: string | null }) {
  return msg ? <div className="toast" role="status">{msg}</div> : null
}
