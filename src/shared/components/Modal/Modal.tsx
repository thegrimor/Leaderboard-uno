import { createPortal } from 'react-dom'

interface Props {
  children: React.ReactNode
}

/**
 * Renderiza su contenido directamente en `document.body` vía portal, para que un modal
 * `fixed` no quede atrapado por el stacking context de `<main>`.
 */
export function Modal({ children }: Props) {
  return createPortal(children, document.body)
}
