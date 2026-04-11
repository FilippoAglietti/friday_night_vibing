const BASE_URL = "https://www.syllabi.online";

const blogPosts = [
  {
    title: "AI Audio Lessons Are Here — Turn Your Course into a Podcast",
    description:
      "Pro Max users can now generate professional voice narration for every lesson. Choose from multiple AI voices and let your students learn on the go.",
    date: "2026-04-08",
    category: "Product",
  },
  {
    title: "How to Create a Lead Magnet Mini-Course in 60 Seconds",
    description:
      "The fastest way to grow your email list: create a free mini-course, add email capture, and share the link. Here's exactly how to do it with Syllabi.",
    date: "2026-04-02",
    category: "Guide",
  },
  {
    title: "Introducing Notion Export: Paste Your Course Directly into Notion",
    description:
      "Notion export — your entire course, formatted as Notion blocks, ready to paste in one click. No more manual reformatting.",
    date: "2026-03-28",
    category: "Product",
  },
  {
    title: "How to Write Better Course Prompts: 7 Tips from Our Power Users",
    description:
      "The quality of your AI-generated course depends heavily on what you put in. Seven proven strategies our top users use to get outstanding results.",
    date: "2026-03-20",
    category: "Guide",
  },
  {
    title: "The Course Creator's 2026 Landscape: Why AI-First Tools Are Winning",
    description:
      "The online education market has shifted dramatically. Why course creators who adopt AI tools early are seeing 3x faster production cycles.",
    date: "2026-03-12",
    category: "Insights",
  },
  {
    title: "From Syllabus to Sale: Packaging Your Course for Platforms",
    description:
      "A step-by-step guide to turning your Syllabi output into a sellable product on Teachable, Kajabi, or your own site.",
    date: "2026-03-04",
    category: "Guide",
  },
  {
    title: "PDF Export Is Here — Print-Ready Courses in One Click",
    description:
      "Share polished course outlines with clients, co-creators, and students without leaving Syllabi.",
    date: "2026-02-24",
    category: "Product",
  },
  {
    title: "What Makes a Great Online Course? We Analyzed 500 Top Courses",
    description:
      "We studied 500 highly-rated online courses across categories to find common structural patterns.",
    date: "2026-02-15",
    category: "Insights",
  },
];

export async function GET() {
  const items = blogPosts
    .map(
      (post) => `    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.description}]]></description>
      <link>${BASE_URL}/blog</link>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <category>${post.category}</category>
    </item>`
    )
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Syllabi Blog — AI Course Generator</title>
    <description>Product updates, guides, and insights about AI-powered course creation from the Syllabi team.</description>
    <link>${BASE_URL}/blog</link>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <image>
      <url>${BASE_URL}/apple-touch-icon.png</url>
      <title>Syllabi</title>
      <link>${BASE_URL}</link>
    </image>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
