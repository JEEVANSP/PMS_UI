import type { ReactNode } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-lg rounded-lg bg-white shadow-lg"
      >
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            type="button"
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            x
          </button>
        </div>
        <div className="p-5">{children}</div>
        {footer ? <div className="border-t p-4">{footer}</div> : null}
      </div>
    </div>
  );
}
