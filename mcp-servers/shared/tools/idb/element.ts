/**
 * Shared mapper from raw `idb ui describe-*` JSON elements to our UIElement.
 *
 * fb-idb emits AX-prefixed accessibility fields (AXLabel, AXValue, ...). The
 * older code in this package read plain `label`/`value`, which never matched
 * anything, so labels were silently dropped on every call. Centralize the
 * mapping here so describe and find-element stay in sync.
 */

import type { UIElement } from "../../types/idb.js";

export function toUIElement(elem: Record<string, unknown>): UIElement {
  const frame = elem.frame as UIElement["frame"];
  const label =
    (elem.AXLabel as string | undefined) ?? (elem.label as string | undefined);
  const value =
    (elem.AXValue as string | undefined) ?? (elem.value as string | undefined);
  return {
    label,
    value,
    type: elem.type as string | undefined,
    roleDescription: elem.role_description as string | undefined,
    axUniqueId: elem.AXUniqueId as string | undefined,
    centerX: frame ? frame.x + frame.width / 2 : undefined,
    centerY: frame ? frame.y + frame.height / 2 : undefined,
    frame,
  };
}
