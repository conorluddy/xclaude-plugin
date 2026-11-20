/**
 * Tests for the raw-element -> UIElement mapper.
 *
 * The describe/find-element/check-quality tests already exercise the
 * happy path (AXLabel/AXValue present, frame present). These cover the
 * fallback branches:
 *   - element shaped with plain `label`/`value` (forward-compat fallback)
 *   - element with no frame at all
 */

import { describe, it, expect } from "vitest";
import { toUIElement } from "../../../shared/tools/idb/element.js";

describe("toUIElement", () => {
  it("falls back to plain label/value when AX fields are absent", () => {
    const mapped = toUIElement({
      label: "Legacy Label",
      value: "Legacy Value",
      type: "Button",
      frame: { x: 10, y: 20, width: 100, height: 50 },
    });

    expect(mapped.label).toBe("Legacy Label");
    expect(mapped.value).toBe("Legacy Value");
    expect(mapped.centerX).toBe(60);
    expect(mapped.centerY).toBe(45);
  });

  it("returns undefined center coordinates when frame is missing", () => {
    const mapped = toUIElement({
      AXLabel: "Frameless",
      type: "StaticText",
    });

    expect(mapped.label).toBe("Frameless");
    expect(mapped.centerX).toBeUndefined();
    expect(mapped.centerY).toBeUndefined();
    expect(mapped.frame).toBeUndefined();
  });
});
