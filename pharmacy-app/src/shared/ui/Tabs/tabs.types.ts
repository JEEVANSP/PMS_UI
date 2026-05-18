/**
 * Tabs component types
 */

export type TabsOrientation = "horizontal" | "vertical";

export interface TabItem {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: Array<string | TabItem>;
  value: string;
  onValueChange: (value: string) => void;
  orientation?: TabsOrientation;
  className?: string;
}
