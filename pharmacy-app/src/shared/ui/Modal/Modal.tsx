/**
 * Enhanced Modal Component with Portal, Focus Trap, and Accessibility
 */

import React, { useEffect, useId, createContext, useContext } from "react";
import { createPortal } from "react-dom";
import { FocusTrap } from "focus-trap-react";
import { cn } from "@shared/lib/cn";
import { useLockBodyScroll } from "@shared/hooks/useLockBodyScroll";
import type {
  ModalProps,
  ModalContentProps,
  ModalHeaderProps,
  ModalTitleProps,
  ModalDescriptionProps,
  ModalBodyProps,
  ModalFooterProps,
  ModalContextType,
  ModalSize,
} from "./modal.types";

/**
 * Size variants for modal
 */
const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
};

/**
 * Modal Context for sharing state between subcomponents
 */
const ModalContext = createContext<ModalContextType | undefined>(undefined);

/**
 * Hook to access modal context in subcomponents
 */
function useModalContext(): ModalContextType {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("Modal subcomponents must be used inside Modal");
  }
  return context;
}

/**
 * Main Modal component
 */
export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      closeOnOverlayClick = true,
      closeOnEscape = true,
      size = "md",
      usePortal = true,
      children,
      ...props
    },
    ref
  ) => {
    const titleId = useId();
    const descriptionId = useId();

    // Lock body scroll when modal is open
    useLockBodyScroll(isOpen);

    // Handle escape key
    useEffect(() => {
      if (!isOpen || !closeOnEscape) return;

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };

      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose, closeOnEscape]);

    if (!isOpen) return null;

    const contextValue: ModalContextType = {
      isOpen,
      onClose,
      size,
      titleId,
      descriptionId,
    };

    const modalContent = (
      <FocusTrap focusTrapOptions={{ onDeactivate: onClose }}>
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          role="presentation"
          onClick={closeOnOverlayClick ? onClose : undefined}
          aria-hidden="true"
        >
          <div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg shadow-xl"
            {...props}
          >
            <ModalContext.Provider value={contextValue}>
              {children}
            </ModalContext.Provider>
          </div>
        </div>
      </FocusTrap>
    );

    // Render in portal if enabled (default: true)
    if (usePortal && typeof document !== "undefined") {
      return createPortal(modalContent, document.body);
    }

    return modalContent;
  }
);
Modal.displayName = "Modal";

/**
 * Modal Content wrapper
 */
export const ModalContent = React.forwardRef<HTMLDivElement, ModalContentProps>(
  ({ size: sizeProp, className, ...props }, ref) => {
    const context = useModalContext();
    const size = sizeProp ?? context.size ?? "md";

    return (
      <div
        ref={ref}
        className={cn("w-full p-6", sizeClasses[size], className)}
        {...props}
      />
    );
  }
);
ModalContent.displayName = "ModalContent";

/**
 * Modal Header
 */
export const ModalHeader = React.forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ id: idProp, className, ...props }, ref) => {
    const context = useModalContext();
    const headerId = idProp || context.titleId;

    return (
      <div ref={ref} id={headerId} className={cn("mb-4 space-y-2", className)} {...props} />
    );
  }
);
ModalHeader.displayName = "ModalHeader";

/**
 * Modal Title
 */
export const ModalTitle = React.forwardRef<HTMLHeadingElement, ModalTitleProps>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn("text-lg font-semibold text-gray-900", className)}
      {...props}
    />
  )
);
ModalTitle.displayName = "ModalTitle";

/**
 * Modal Description
 */
export const ModalDescription = React.forwardRef<HTMLParagraphElement, ModalDescriptionProps>(
  ({ id: idProp, className, ...props }, ref) => {
    const context = useModalContext();
    const descId = idProp || context.descriptionId;

    return (
      <p
        ref={ref}
        id={descId}
        className={cn("text-sm text-gray-500", className)}
        {...props}
      />
    );
  }
);
ModalDescription.displayName = "ModalDescription";

/**
 * Modal Body
 */
export const ModalBody = React.forwardRef<HTMLDivElement, ModalBodyProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("py-4", className)} {...props} />
  )
);
ModalBody.displayName = "ModalBody";

/**
 * Modal Footer
 */
export const ModalFooter = React.forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200", className)}
      {...props}
    />
  )
);
ModalFooter.displayName = "ModalFooter";

// Exported default for backward compatibility
export default Modal;
