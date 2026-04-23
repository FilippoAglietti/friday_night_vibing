import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { isExportV2Enabled } from "../flags";

describe("isExportV2Enabled", () => {
  const original = process.env.EXPORT_V2_ENABLED;
  afterEach(() => {
    if (original === undefined) delete process.env.EXPORT_V2_ENABLED;
    else process.env.EXPORT_V2_ENABLED = original;
  });

  it("is false when env var is unset", () => {
    delete process.env.EXPORT_V2_ENABLED;
    expect(isExportV2Enabled()).toBe(false);
  });

  it("is true only when env var is exactly 'true'", () => {
    process.env.EXPORT_V2_ENABLED = "true";
    expect(isExportV2Enabled()).toBe(true);
  });

  it("is false for other truthy-looking values", () => {
    for (const v of ["1", "yes", "True", "TRUE", " true"]) {
      process.env.EXPORT_V2_ENABLED = v;
      expect(isExportV2Enabled()).toBe(false);
    }
  });
});
