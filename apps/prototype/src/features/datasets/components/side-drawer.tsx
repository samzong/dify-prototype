import { RiCloseLine } from '@remixicon/react'
import { createPortal } from 'react-dom'

export const SIDE_DRAWER_BACKDROP_Z = 'z-[100]'
export const SIDE_DRAWER_PANEL_Z = 'z-[101]'

export function transitionToSideDrawer(closeBlockingOverlay: () => void, openDrawer: () => void) {
  closeBlockingOverlay()
  requestAnimationFrame(() => openDrawer())
}

export function SideDrawer({
  open,
  title,
  description,
  onClose,
  children,
  panelClassName,
}: {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children: React.ReactNode
  panelClassName?: string
}) {
  if (!open || typeof document === 'undefined')
    return null

  return createPortal(
    <>
      <button
        type="button"
        className={`fixed inset-0 ${SIDE_DRAWER_BACKDROP_Z} bg-black/20`}
        aria-label="Close drawer backdrop"
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 right-0 ${SIDE_DRAWER_PANEL_Z} flex w-full flex-col border-l border-divider-subtle bg-components-panel-bg shadow-xl ${panelClassName ?? 'max-w-md'}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-start justify-between gap-3 border-b border-divider-subtle px-4 py-4">
          <div className="min-w-0">
            <h2 className="system-md-semibold text-text-secondary">{title}</h2>
            {description && <p className="mt-1 system-xs-regular text-text-tertiary">{description}</p>}
          </div>
          <button
            type="button"
            aria-label="Close drawer"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-text-tertiary hover:bg-state-base-hover"
            onClick={onClose}
          >
            <RiCloseLine className="size-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
      </aside>
    </>,
    document.body,
  )
}
