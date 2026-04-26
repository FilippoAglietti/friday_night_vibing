import { describe, it, expect } from "vitest";
import { resolveBranding, resolveCreatorLabel } from "../branding";

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

  it("returns null displayName when profile is null and no email", () => {
    const result = resolveBranding(null);
    expect(result).toEqual({
      displayName: null,
      logoUrl: null,
      accent: null,
      heroUrl: null,
      footer: null,
    });
  });

  it("returns null displayName when full_name is empty or whitespace and no email", () => {
    expect(resolveBranding({ full_name: "" } as never).displayName).toBeNull();
    expect(resolveBranding({ full_name: "   " } as never).displayName).toBeNull();
  });

  it("trims display name whitespace", () => {
    expect(resolveBranding({ full_name: "  Maria Rossi  " } as never).displayName)
      .toBe("Maria Rossi");
  });

  it("falls back to email prefix when full_name is missing", () => {
    expect(resolveBranding(null, "maria@example.com").displayName).toBe("maria");
    expect(resolveBranding({ full_name: null } as never, "maria@example.com").displayName)
      .toBe("maria");
    expect(resolveBranding({ full_name: "  " } as never, "maria@example.com").displayName)
      .toBe("maria");
  });

  it("prefers full_name over email prefix", () => {
    expect(
      resolveBranding({ full_name: "Maria Rossi" } as never, "maria@example.com").displayName,
    ).toBe("Maria Rossi");
  });

  it("ignores malformed emails (no @)", () => {
    expect(resolveBranding(null, "not-an-email").displayName).toBeNull();
  });

  it("never contains the string 'Syllabi' anywhere in the output", () => {
    const result = resolveBranding({ full_name: "Maria Rossi" } as never);
    const json = JSON.stringify(result);
    expect(json.toLowerCase()).not.toContain("syllabi");
  });
});

describe("resolveCreatorLabel", () => {
  it("returns the display name when present", () => {
    expect(resolveCreatorLabel({ full_name: "Maria Rossi" } as never)).toBe("Maria Rossi");
  });

  it("returns email prefix when full_name is missing", () => {
    expect(resolveCreatorLabel(null, "maria@example.com")).toBe("maria");
  });

  it("falls back to 'Author' when nothing is resolvable", () => {
    expect(resolveCreatorLabel(null)).toBe("Author");
    expect(resolveCreatorLabel(null, "")).toBe("Author");
    expect(resolveCreatorLabel({ full_name: "" } as never)).toBe("Author");
  });

  it("never returns a string containing 'Syllabi'", () => {
    expect(resolveCreatorLabel(null).toLowerCase()).not.toContain("syllabi");
  });
});
