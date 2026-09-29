/**
 * Shared mapper from raw `idb ui describe-*` JSON elements to our UIElement.
 *
 * fb-idb emits AX-prefixed accessibility fields (AXLabel, AXValue, ...). The
 * older code in this package read plain `label`/`value`, which never matched
 * anything, so labels were silently dropped on every call. Centralize the
 * mapping here so describe and find-element stay in sync.
 */
export function toUIElement(elem) {
    const frame = elem.frame;
    const label = elem.AXLabel ?? elem.label;
    const value = elem.AXValue ?? elem.value;
    return {
        label,
        value,
        type: elem.type,
        roleDescription: elem.role_description,
        axUniqueId: elem.AXUniqueId,
        centerX: frame ? frame.x + frame.width / 2 : undefined,
        centerY: frame ? frame.y + frame.height / 2 : undefined,
        frame,
    };
}
