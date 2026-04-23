import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { Certificate } from "../Core/Certificate";

const base = {
  courseTitle: "Intro to Machine Learning",
  totalLessons: 24,
  totalHours: 20,
  completedAt: "2026-04-23",
};

describe("<Certificate />", () => {
  it("renders the course title", () => {
    const html = renderToString(<Certificate {...base} issuer="Maria Rossi" />);
    expect(html).toContain("Intro to Machine Learning");
  });

  it("renders the issuer as the creator name — never Syllabi", () => {
    const html = renderToString(<Certificate {...base} issuer="Maria Rossi" />);
    expect(html).toContain("Maria Rossi");
    expect(html.toLowerCase()).not.toContain("syllabi");
  });

  it("omits the issuer line entirely when null", () => {
    const html = renderToString(<Certificate {...base} issuer={null} />);
    expect(html).not.toMatch(/issued by/i);
  });

  it("renders completion metadata", () => {
    const html = renderToString(<Certificate {...base} issuer="Maria Rossi" />);
    expect(html).toContain("24");
    expect(html).toContain("20");
    expect(html).toContain("2026-04-23");
  });

  it("applies certificate class so print.css isolates it on its own page", () => {
    const html = renderToString(<Certificate {...base} issuer={null} />);
    expect(html).toContain("certificate");
  });
});
