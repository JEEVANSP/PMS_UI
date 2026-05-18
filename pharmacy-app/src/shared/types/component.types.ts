/**
 * Global component type definitions
 * Enforces consistent API patterns across all components
 */

export type Size = "xs" | "sm" | "md" | "lg" | "xl";
export type Variant = "default" | "primary" | "secondary" | "tertiary" | "ghost" | "outline";
export type Tone = "default" | "primary" | "secondary" | "success" | "warning" | "danger" | "info";
export type Status = "idle" | "loading" | "success" | "error";
export type Direction = "horizontal" | "vertical";

export interface BaseComponentProps {
  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Accessible label for screen readers
   */
  "aria-label"?: string;

  /**
   * Accessible description
   */
  "aria-describedby"?: string;

  /**
   * Whether component is disabled
   */
  disabled?: boolean;

  /**
   * Test ID for testing
   */
  "data-testid"?: string;
}

export interface SizedComponent extends BaseComponentProps {
  /**
   * Component size
   */
  size?: Size;
}

export interface VariantComponent extends BaseComponentProps {
  /**
   * Visual variant
   */
  variant?: Variant;
}

export interface TonedComponent extends BaseComponentProps {
  /**
   * Semantic tone/color
   */
  tone?: Tone;
}

export interface StatusComponent extends BaseComponentProps {
  /**
   * Current status
   */
  status?: Status;
}

export interface DirectionalComponent extends BaseComponentProps {
  /**
   * Layout direction
   */
  direction?: Direction;
}
