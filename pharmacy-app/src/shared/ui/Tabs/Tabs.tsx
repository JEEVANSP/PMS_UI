/**
 * Tabs component with keyboard navigation and orientation support
 */

import React, { useRef, useCallback } from "react";
import { cn } from "@shared/lib/cn";
import type { TabItem, TabsProps } from "./tabs.types";

function normalizeTab(tab: string | TabItem): TabItem {
  if (typeof tab === "string") {
    return { label: tab, value: tab };
  }
  return tab;
}

export default function Tabs({
  tabs,
  value,
  onValueChange,
  orientation = "horizontal",
  className,
}: TabsProps) {
  const normalizedTabs = tabs.map(normalizeTab);
  const tabButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  /**
   * Get the index of the currently selected tab
   */
  const currentIndex = normalizedTabs.findIndex((t) => t.value === value);

  /**
   * Get list of enabled tab indices
   */
  const enabledIndices = normalizedTabs
    .map((_, i) => i)
    .filter((i) => !normalizedTabs[i].disabled);

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      const isHorizontal = orientation === "horizontal";
      const isVertical = orientation === "vertical";

      if (enabledIndices.length === 0) {
        return;
      }

      let nextTab: TabItem | null = null;

      // Arrow key handling
      if ((isHorizontal && e.key === "ArrowRight") || (isVertical && e.key === "ArrowDown")) {
        e.preventDefault();
        const currentIdx = Math.max(enabledIndices.indexOf(currentIndex), 0);
        const nextIdx = (currentIdx + 1) % enabledIndices.length;
        nextTab = normalizedTabs[enabledIndices[nextIdx]];
      } else if (
        (isHorizontal && e.key === "ArrowLeft") ||
        (isVertical && e.key === "ArrowUp")
      ) {
        e.preventDefault();
        const currentIdx = Math.max(enabledIndices.indexOf(currentIndex), 0);
        const nextIdx = (currentIdx - 1 + enabledIndices.length) % enabledIndices.length;
        nextTab = normalizedTabs[enabledIndices[nextIdx]];
      } else if (e.key === "Home") {
        e.preventDefault();
        nextTab = normalizedTabs[enabledIndices[0]];
      } else if (e.key === "End") {
        e.preventDefault();
        nextTab = normalizedTabs[enabledIndices[enabledIndices.length - 1]];
      }

      if (nextTab) {
        onValueChange(nextTab.value);
        // Focus the button after selection
        setTimeout(() => {
          tabButtonRefs.current[nextTab!.value]?.focus();
        }, 0);
      }
    },
    [currentIndex, enabledIndices, normalizedTabs, onValueChange, orientation]
  );

  // Orientation-specific classes
  const containerClasses =
    orientation === "vertical"
      ? "flex flex-col gap-2 border-l pl-4"
      : "flex gap-6 border-b pb-2";

  const tabClasses = (isSelected: boolean, isDisabled: boolean) =>
    cn(
      "px-3 py-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500",
      isDisabled && "cursor-not-allowed opacity-50",
      orientation === "vertical"
        ? isSelected
          ? "border-l-2 border-l-blue-600 text-blue-600 -ml-4 pl-3.5"
          : "text-gray-500 hover:text-gray-700"
        : isSelected
        ? "border-b-2 border-b-blue-600 text-blue-600"
        : "text-gray-500 hover:text-gray-700"
    );

  return (
    <div className={cn(containerClasses, className)} role="tablist" aria-orientation={orientation}>
      {normalizedTabs.map((tab) => (
        <button
          key={tab.value}
          ref={(el) => {
            tabButtonRefs.current[tab.value] = el;
          }}
          onClick={() => !tab.disabled && onValueChange(tab.value)}
          onKeyDown={handleKeyDown}
          disabled={tab.disabled}
          role="tab"
          aria-selected={value === tab.value}
          aria-controls={`tabpanel-${tab.value}`}
          tabIndex={value === tab.value ? 0 : -1}
          className={tabClasses(value === tab.value, !!tab.disabled)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
