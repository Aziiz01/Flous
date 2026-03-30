import { useCallback, useState } from 'react'
import emailjs from '@emailjs/browser'
import { EMAILJS_CONFIG } from '../config/emailjs'

const initial = { name: '', email: '', message: '', rating: 5 }

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(null)
  const shown = hover ?? value

  return (
    <div
      className="flex flex-wrap items-center gap-0.5"
      role="radiogroup"
      aria-label="Rating from 1 to 5 stars"
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(null)}
          className={`rounded-md p-1 text-[1.65rem] leading-none transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 ${
            n <= shown ? 'text-yellow-400' : 'text-zinc-600'
          }`}
        >
          ★
        </button>
      ))}
      <span className="ml-2 text-sm tabular-nums text-zinc-400">{shown} / 5</span>
    </div>
  )
}

export default function RateProjectModal({ open, onClose }) {
  const [form, setForm] = useState(initial)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const handleChange = (field) => (e) => {
    const value = field === 'rating' ? Number(e.target.value) : e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      setError('')
      if (!form.email.trim() || !form.message.trim()) {
        setError('Please add your email and a short message.')
        return
      }

      setStatus('sending')
      try {
        const starsVisual = `${'★'.repeat(form.rating)}${'☆'.repeat(5 - form.rating)}`
        await emailjs.send(
          EMAILJS_CONFIG.serviceId,
          EMAILJS_CONFIG.templateId,
          {
            from_name: form.name.trim() || 'Anonymous',
            reply_to: form.email.trim(),
            user_email: form.email.trim(),
            message: form.message.trim(),
            rating: String(form.rating),
            rating_stars: starsVisual,
            project_name: 'Flous',
          },
          { publicKey: EMAILJS_CONFIG.publicKey },
        )
        setStatus('sent')
        setForm(initial)
      } catch (err) {
        console.error(err)
        setError('Could not send — try again in a moment.')
        setStatus('idle')
      }
    },
    [form],
  )

  const handleClose = () => {
    if (status === 'sending') return
    setStatus('idle')
    setError('')
    onClose()
  }

  if (!open) return null

  return (
    <>
      <button
        type="button"
        aria-label="Close rating dialog"
        className="pointer-events-auto fixed inset-0 z-[70] bg-black/55 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rate-project-title"
        className="pointer-events-auto fixed left-1/2 top-1/2 z-[71] w-[min(26rem,calc(100vw-1.25rem))] max-h-[min(90dvh,calc(100dvh-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto overscroll-contain rounded-2xl border border-yellow-500/30 bg-emerald-950/95 p-4 shadow-[0_24px_64px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="rate-project-title" className="text-lg font-semibold text-emerald-50">
              Rate <span className="display-font text-[var(--money-gold)]">Flous</span>
            </h2>
            <p className="mt-1 text-xs text-zinc-400">
              Quick feedback about Flous — we&apos;ll get it by email.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg px-2 py-1 text-sm text-zinc-400 transition hover:bg-white/10 hover:text-zinc-100"
          >
            ✕
          </button>
        </div>

        {status === 'sent' ? (
          <p className="py-6 text-center text-sm text-emerald-200/95">
            Thanks — your message is on its way.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block space-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Name (optional)</span>
              <input
                type="text"
                value={form.name}
                onChange={handleChange('name')}
                className="w-full rounded-xl border border-white/10 bg-emerald-950/80 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/25"
                autoComplete="name"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Email</span>
              <input
                type="email"
                required
                value={form.email}
                onChange={handleChange('email')}
                className="w-full rounded-xl border border-white/10 bg-emerald-950/80 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/25"
                autoComplete="email"
              />
            </label>
            <div className="block space-y-2">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Rating</span>
              <StarRating
                value={form.rating}
                onChange={(n) => setForm((prev) => ({ ...prev, rating: n }))}
              />
            </div>
            <label className="block space-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Message</span>
              <textarea
                required
                rows={4}
                value={form.message}
                onChange={handleChange('message')}
                placeholder="What did you think?"
                className="w-full resize-none rounded-xl border border-white/10 bg-emerald-950/80 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/25"
              />
            </label>
            {error && <p className="text-xs text-red-400/95">{error}</p>}
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={status === 'sending'}
                className="money-glow rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-900 px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-yellow-50 disabled:opacity-60"
              >
                {status === 'sending' ? 'Sending…' : 'Send'}
              </button>
            </div>
          </form>
        )}

        {status === 'sent' && (
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl bg-emerald-800/40 px-4 py-2 text-sm font-medium text-yellow-100"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </>
  )
}
