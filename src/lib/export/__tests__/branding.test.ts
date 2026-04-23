import { describe, it, expect } from "vitest";
import { resolveBranding } from "../branding";

describe("resolveBranding", () => {
  it("returns a name-only shape when profile is minimal", () => {
    const result = resolveBranding({ full_name: "Maria Rossi" } as never);
    expect(result).toEqual({
      displayName: "Maria Rossi",
      logoUrl: null,
      accent: null,
      heroUrl: null,
      footer: null,
    });
  });

  it("returns null displayName when profile is null", () => {
    const result = resolveBranding(null);
    expect(result).toEqual({
      displayName: null,
      logoUrl: null,
      accent: null,
      heroUrl: null,
      footer: null,
    });
  });

  it("returns null displayName when full_name is empty or whitespace", () => {
    expect(resolveBranding({ full_name: "" } as never).displayName).toBeNull();
    expect(resolveBranding({ full_name: "   " } as never).displayName).toBeNull();
  });

  it("trims display name whitespace", () => {
    expect(resolveBranding({ full_name: "  Maria Rossi  " } as never).displayName)
      .toBe("Maria Rossi");
  });

  it("never contains the string 'Syllabi' anywhere in the output", () => {
    // Hard constraint §7 of the spec.
    const result = resolveBranding({ full_name: "Maria Rossi" } as never);
    const json = JSON.stringify(result);
    expect(json.toLowerCase()).not.toContain("syllabi");
  });
});
