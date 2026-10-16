import { Link } from 'react-router-dom'
import { ChevronIcon } from './Icons'

type Props = { to: string; title: string; sub?: string; color?: string }

export default function MenuRow({ to, title, sub, color }: Props) {
  return (
    <Link to={to} className="row">
      {color && <span className="dot" style={{ background: color }} />}
      <span className="grow">
        <div className="title">{title}</div>
        {sub && <div className="sub">{sub}</div>}
      </span>
      <span className="chev"><ChevronIcon size={20} /></span>
    </Link>
  )
}
