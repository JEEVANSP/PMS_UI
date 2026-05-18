/**
 * Modal component types
 */

import type React from "react";

export type ModalSize = "sm" | "md" | "lg" | "xl";

export interface ModalContextType {
  isOpen: boolean;
  onClose: () => void;
  size?: ModalSize;
  titleId?: string;
  descriptionId?: string;
}

export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  size?: ModalSize;
  /**
   * Whether to render modal in portal (document.body)
   * Prevents z-index stacking issues
   */
  usePortal?: boolean;
}

export interface ModalContentProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: ModalSize;
}

export interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * ID for aria-labelledby
   */
  id?: string;
}

export interface ModalTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export interface ModalDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /**
   * ID for aria-describedby
   */
  id?: string;
}

export interface ModalBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {}
