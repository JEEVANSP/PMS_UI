import React, { useEffect } from "react";
import { cn } from "@shared/lib/cn";

type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  side?: "left" | "right";
  size?: "sm" | "md" | "lg";
  closeOnOverlayClick?: boolean;
};

const sizeClasses = {
  sm: "w-64",
  md: "w-80",
  lg: "w-96",
};

const sideClasses = {
  left: "left-0",
  right: "right-0",
};

export default function Drawer({
  isOpen,
  onClose,
  title,
  children,
  side = "right",
  size = "md",
  closeOnOverlayClick = true,
}: DrawerProps) {
  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={closeOnOverlayClick ? onClose : undefined}
        role="presentation"
      />

      {/* Drawer Panel */}
      <div
        className={cn(
          "fixed top-0 h-full bg-white shadow-lg p-6 z-50 transform transition-transform duration-200",
          sideClasses[side],
          sizeClasses[size],
          isOpen ? "translate-x-0" : side === "right" ? "translate-x-full" : "-translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "drawer-title" : undefined}
      >
        {/* Prevent overlay click from closing drawer */}
        <div onClick={(e) => e.stopPropagation()} className="h-full overflow-auto">
          {title && (
            <h2 id="drawer-title" className="text-xl font-semibold mb-4">
              {title}
            </h2>
          )}
          {children}
        </div>
      </div>
    </>
  );
}
