// Two runtimes: Cloud Run uses playwright; Vercel uses playwright-core + @sparticuz/chromium

const isVercel = process.env.VERCEL === "1";

export async function renderPdf(html: string): Promise<Buffer> {
  if (isVercel) {
    return renderWithServerlessChromium(html);
  }
  return renderWithFullPlaywright(html);
}

async function renderWithFullPlaywright(html: string): Promise<Buffer> {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.emulateMedia({ media: "print" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
    });
    return pdf;
  } finally {
    await browser.close();
  }
}

async function renderWithServerlessChromium(html: string): Promise<Buffer> {
  const { chromium } = await import("playwright-core");
  const sparticuz = await import("@sparticuz/chromium");

  const browser = await chromium.launch({
    args: sparticuz.default.args,
    executablePath: await sparticuz.default.executablePath(),
    headless: true,
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.emulateMedia({ media: "print" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
    });
    return pdf;
  } finally {
    await browser.close();
  }
}
