/**
 * Merge multiple refs into a single ref
 * Useful when a component needs to forward multiple refs
 */

import React from "react";

type Ref<T> = React.Ref<T> | undefined;

/**
 * Merges multiple refs into one, handling all ref types
 * @param refs - Multiple refs to merge
 * @returns A single ref callback that updates all provided refs
 *
 * @example
 * const mergedRef = mergeRefs(ref1, ref2, ref3);
 * <input ref={mergedRef} />
 */
export function mergeRefs<T>(...refs: Ref<T>[]): React.Ref<T> {
  return (value: T) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value);
      } else if (ref != null) {
        (ref as React.MutableRefObject<T>).current = value;
      }
    });
  };
}

/**
 * Alternative: returns a callback ref
 * Useful for components that only accept callback refs
 */
export function useCallbackRef<T>(
  ref1?: React.Ref<T>,
  ref2?: React.Ref<T>
): React.RefCallback<T> {
  return React.useCallback(
    (node: T) => {
      if (ref1) {
        if (typeof ref1 === "function") {
          ref1(node);
        } else {
          (ref1 as React.MutableRefObject<T>).current = node;
        }
      }
      if (ref2) {
        if (typeof ref2 === "function") {
          ref2(node);
        } else {
          (ref2 as React.MutableRefObject<T>).current = node;
        }
      }
    },
    [ref1, ref2]
  );
}
