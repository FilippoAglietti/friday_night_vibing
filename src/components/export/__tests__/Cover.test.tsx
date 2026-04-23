import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { Cover } from "../Core/Cover";
import type { Curriculum } from "@/types/curriculum";

const fixture: Pick<Curriculum, "title" | "subtitle" | "modules"> & {
  totalHours: number;
  totalLessons: number;
} = {
  title: "Intro to Machine Learning",
  subtitle: "From first principles to a deployed model",
  modules: [],
  totalHours: 20,
  totalLessons: 24,
};

describe("<Cover />", () => {
  it("renders the course title", () => {
    const html = renderToString(
      <Cover curriculum={fixture as never} branding={{ displayName: null, logoUrl: null, accent: null, heroUrl: null, footer: null }} volume={1} />
    );
    expect(html).toContain("Intro to Machine Learning");
  });

  it("renders the creator name when provided", () => {
    const html = renderToString(
      <Cover
        curriculum={fixture as never}
        branding={{ displayName: "Maria Rossi", logoUrl: null, accent: null, heroUrl: null, footer: null }}
        volume={1}
      />
    );
    expect(html).toContain("Maria Rossi");
  });

  it("omits the 'by' byline when creator name is null", () => {
    const html = renderToString(
      <Cover
        curriculum={fixture as never}
        branding={{ displayName: null, logoUrl: null, accent: null, heroUrl: null, footer: null }}
        volume={1}
      />
    );
    expect(html).not.toMatch(/\bby\b/i);
  });

  it("renders course stats (lessons, hours)", () => {
    const html = renderToString(
      <Cover curriculum={fixture as never} branding={{ displayName: null, logoUrl: null, accent: null, heroUrl: null, footer: null }} volume={1} />
    );
    expect(html).toContain("24");
    expect(html).toContain("20");
  });

  it("never contains the string 'Syllabi'", () => {
    const html = renderToString(
      <Cover curriculum={fixture as never} branding={{ displayName: null, logoUrl: null, accent: null, heroUrl: null, footer: null }} volume={1} />
    );
    expect(html.toLowerCase()).not.toContain("syllabi");
  });
});
