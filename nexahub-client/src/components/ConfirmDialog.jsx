import ModalShell from './ModalShell.jsx'

const toneClasses = {
  danger: 'bg-rose-600 text-white hover:bg-rose-500',
  primary: 'bg-slate-900 text-white hover:bg-slate-800',
}

const ConfirmDialog = ({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Keep current state',
  confirmTone = 'danger',
  isBusy = false,
  onClose,
  onConfirm,
  children,
}) => (
  <ModalShell isOpen={isOpen} title={title} description={description} onClose={onClose}>
    {children ? <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">{children}</div> : null}

    <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onClose}
        className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
      >
        {cancelLabel}
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={isBusy}
        className={`rounded-2xl px-4 py-3 text-sm font-bold disabled:opacity-60 ${toneClasses[confirmTone] ?? toneClasses.primary}`}
      >
        {confirmLabel}
      </button>
    </div>
  </ModalShell>
)

export default ConfirmDialog
