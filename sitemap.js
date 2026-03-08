// functions/sitemap.js
export async function onRequest(context) {
  const SHEET_JSON_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQjYTihNa3l9tQBxXa3b_9gxroJuay4KddElBbGy9e8gZh2MyHdNosN8K8OkuAlF9pi6l0faaZdbvY7/gviz/tq?tqx=out:json";

  // Use your primary domain (not pages.dev) for SEO
  const BASE_URL = "https://globalworkvisajobs.com";

  try {
    const res = await fetch(SHEET_JSON_URL);
    const text = await res.text();

    // Parse JSON from Google Sheet wrapper
    const jsonText = text.replace(/^.*setResponse\((.*)\);?$/s, "$1");
    const data = JSON.parse(jsonText);

    // Map jobs data
    const jobs = data.table.rows.map((row) => {
      const cells = row.c.map((cell) => (cell ? cell.v : ""));
      return {
        id: cells[0],
        country: cells[1],
        title: cells[3],
        date_added: cells[9] || new Date().toISOString().split("T")[0],
      };
    });

    // Extract unique countries
    const countrySet = new Set();
    jobs.forEach((job) => {
      if (job.country) {
        countrySet.add(job.country.toLowerCase().replace(/\s+/g, "-"));
      }
    });
    const countries = Array.from(countrySet);

    // Hard‑coded blog paths
    const blogUrls = [
      "/blog/relocating-to-europe-from-africa",
      "/blog/best-european-countries-africans",
      "/blog/work-visa-guide",
      "/blog/top-countries-visa-sponsorship",
      "/blog/avoid-job-scams",
      "/blog/interview-preparation",
      "/blog/cv-writing-europe",
      "/blog/relocation-checklist",
      "/blog/housing-guide",
      "/blog/cultural-adaptation",
      "/blog/schengen-visa-changes-2026",
    ];

    // Build complete URL list
    const urls = [
      `${BASE_URL}/`,             // homepage
      `${BASE_URL}/blog`,         // main blog page
      ...blogUrls.map((slug) => `${BASE_URL}${slug}`),
      ...countries.map((c) => `${BASE_URL}/jobs/${c}`),
      ...jobs.map((job) => `${BASE_URL}/job/${job.id}`),
    ];

    // Build sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `<url>
  <loc>${url}</loc>
  <changefreq>daily</changefreq>
  <priority>0.8</priority>
</url>`
  )
  .join("\n")}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=0, must-revalidate",
      },
    });

  } catch (err) {
    return new Response("Error generating sitemap: " + err.message, {
      status: 500,
    });
  }
}
