import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Screen from '../components/Screen'
import Bracelet from '../components/Bracelet'
import { CATEGORY_ICON } from '../components/Flash'
import { CATEGORIES, SIGNALS, type Category } from '../domain/signals'
import { useBraceletPlayer } from '../hooks/useBraceletPlayer'
import { useT } from '../i18n'
import { useStore } from '../store'
import { routes } from '../app/routes'

const ROUNDS = 5
const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5)

type Phase = 'intro' | 'play' | 'answered' | 'done'

/** Игра «Tebak kode»: браслет играет код, ребёнок выбирает значение. Пять раундов, звёзды за ответы. */
export default function Quiz() {
  const { t } = useT()
  const { state, play, stop } = useBraceletPlayer()
  const addQuiz = useStore((s) => s.addQuizResult)
  const best = useStore((s) => s.quizBest)
  const [phase, setPhase] = useState<Phase>('intro')
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [target, setTarget] = useState<Category>('name')
  const [options, setOptions] = useState<Category[]>(CATEGORIES)
  const [picked, setPicked] = useState<Category | null>(null)
  const seq = useRef<Category[]>([])

  const startRound = (i: number) => {
    const c = seq.current[i]
    setTarget(c); setOptions(shuffle(CATEGORIES)); setPicked(null); setRound(i); setPhase('play')
    setTimeout(() => play(c), 350)
  }
  const start = () => {
    seq.current = shuffle([...CATEGORIES, CATEGORIES[Math.floor(Math.random() * 4)]]).slice(0, ROUNDS)
    setScore(0); startRound(0)
  }
  const answer = (c: Category) => {
    if (phase !== 'play') return
    setPicked(c); setPhase('answered'); stop()
    if (c === target) setScore((s) => s + 1)
  }
  const next = () => {
    if (round + 1 >= ROUNDS) { const final = score; addQuiz(final); setPhase('done'); return }
    startRound(round + 1)
  }
  useEffect(() => stop, [stop])

  return (
    <Screen title={t.quiz.title} subtitle={t.quiz.subtitle}>
      {phase === 'intro' && (
        <>
          <section className="card hero center">
            <Bracelet state={state} size={220} />
            <p className="big">{t.quiz.intro}</p>
            {best > 0 && <p className="hint" style={{ marginTop: 6 }}>{t.quiz.best}: {'★'.repeat(best)}{'☆'.repeat(ROUNDS - best)}</p>}
          </section>
          <button className="btn block" onClick={start}>{t.quiz.start}</button>
          <Link to={routes.training} className="btn ghost block">{t.quiz.back}</Link>
        </>
      )}

      {(phase === 'play' || phase === 'answered') && (
        <>
          <div className="quiz-top">
            <span className="pill">{t.quiz.round} {round + 1} / {ROUNDS}</span>
            <span className="stars">{'★'.repeat(score)}{'☆'.repeat(ROUNDS - score)}</span>
          </div>
          <section className="card hero center">
            <Bracelet state={state} size={200} />
            <p className="big">{phase === 'play' ? t.quiz.question : picked === target ? t.quiz.correct : t.quiz.wrong}</p>
            {phase === 'play' && <button className="link" onClick={() => play(target)}>{t.quiz.again}</button>}
          </section>
          <div className="signal-grid">
            {options.map((c) => {
              const cls = phase === 'answered' ? (c === target ? 'right' : c === picked ? 'miss' : 'dim') : ''
              return (
                <button key={c} className={`quiz-opt ${cls}`} onClick={() => answer(c)} disabled={phase === 'answered'}>
                  <span className="quiz-ico">{CATEGORY_ICON[c]}</span>
                  <span className="quiz-txt">{t.guide.child[c].what}</span>
                  {phase === 'answered' && c === target && <span className="dot" style={{ background: SIGNALS[c].color }} />}
                </button>
              )
            })}
          </div>
          {phase === 'answered' && <button className="btn block" onClick={next}>{round + 1 >= ROUNDS ? t.quiz.finish : t.quiz.next}</button>}
        </>
      )}

      {phase === 'done' && (
        <>
          <section className="card hero center">
            <div className="stars big-stars">{'★'.repeat(score)}{'☆'.repeat(ROUNDS - score)}</div>
            <p className="big">{score === ROUNDS ? t.quiz.perfect : score >= 3 ? t.quiz.good : t.quiz.tryAgain}</p>
            <p className="hint" style={{ marginTop: 6 }}>{score} / {ROUNDS}</p>
          </section>
          <button className="btn block" onClick={start}>{t.quiz.playAgain}</button>
          <Link to={routes.training} className="btn ghost block">{t.quiz.back}</Link>
        </>
      )}
    </Screen>
  )
}
