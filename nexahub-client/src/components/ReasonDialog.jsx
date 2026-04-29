import { useEffect, useRef, useState } from 'react'
import ModalShell from './ModalShell.jsx'

const toneClasses = {
  danger: 'bg-rose-600 text-white hover:bg-rose-500',
  neutral: 'bg-slate-900 text-white hover:bg-slate-800',
}

const ReasonDialog = ({
  isOpen,
  title,
  description,
  label,
  placeholder,
  helperText,
  initialValue = '',
  confirmLabel,
  confirmTone = 'neutral',
  isBusy = false,
  required = false,
  onClose,
  onSubmit,
}) => {
  const [value, setValue] = useState(initialValue)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setValue(initialValue)
    setError('')

    const timeoutId = window.setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select?.()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [initialValue, isOpen])

  const handleSubmit = () => {
    const trimmedValue = value.trim()

    if (required && !trimmedValue) {
      setError('This field is required for this action.')
      return
    }

    setError('')
    onSubmit(trimmedValue)
  }

  return (
    <ModalShell isOpen={isOpen} title={title} description={description} onClose={onClose}>
      <label className="block text-sm font-semibold text-slate-700" htmlFor="reason-dialog-input">
        {label}
      </label>
      <textarea
        id="reason-dialog-input"
        ref={inputRef}
        rows="4"
        maxLength="255"
        value={value}
        onChange={(event) => {
          setValue(event.target.value)
          if (error) {
            setError('')
          }
        }}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-cyan-100"
      />
      <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-500">
        <span>{helperText}</span>
        <span>{value.trim().length}/255</span>
      </div>

      {error ? <p className="mt-3 text-sm font-semibold text-rose-600">{error}</p> : null}

      <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isBusy}
          className={`rounded-2xl px-4 py-3 text-sm font-bold disabled:opacity-60 ${toneClasses[confirmTone] ?? toneClasses.neutral}`}
        >
          {confirmLabel}
        </button>
      </div>
    </ModalShell>
  )
}

export default ReasonDialog
