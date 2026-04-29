import { useEffect } from 'react'

const ModalShell = ({ isOpen, title, description, onClose, widthClass = 'max-w-lg', children }) => {
  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative z-10 w-full ${widthClass} overflow-hidden rounded-[1.75rem] border border-white/70 bg-white shadow-2xl`}
      >
        <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#f8fafc_0%,#eef6ff_100%)] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Action dialog</p>
              <h2 id="modal-title" className="mt-2 text-2xl font-black text-slate-900">{title}</h2>
              {description ? <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">{description}</p> : null}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Close
            </button>
          </div>
        </div>

        <div className="px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  )
}

export default ModalShell
