import { Modal } from '../Modal'

interface Props {
  isOpen: boolean
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmLabel?: string
  title?: string
}

export function ConfirmModal({
  isOpen,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirmar',
  title = 'Confirmación requerida',
}: Props) {
  if (!isOpen) return null

  return (
    <Modal>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
        onClick={onCancel}
      >
        <div
          className="w-full max-w-sm animate-pop rounded-2xl border border-rim bg-surface-3 shadow-xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="border-b border-rim px-5 py-3">
            <p className="font-display text-sm font-semibold text-ink">{title}</p>
          </div>

          <div className="px-5 py-5">
            <p className="text-sm text-ink-dim">{message}</p>
          </div>

          <div className="flex gap-2 border-t border-rim px-5 py-3">
            <button
              onClick={onCancel}
              className="flex-1 rounded-lg bg-surface-4 py-2 text-sm font-medium text-ink-dim transition-colors hover:text-ink"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 rounded-lg bg-uno-red py-2 text-sm font-semibold text-white transition-colors hover:bg-uno-red-bright"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
