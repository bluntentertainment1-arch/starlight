addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request))
})

// Google Sheet JSON (publish to web using gviz/tq URL)
const SHEET_JSON_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQjYTihNa3l9tQBxXa3b_9gxroJuay4KddElBbGy9e8gZh2MyHdNosN8K8OkuAlF9pi6l0faaZdbvY7/gviz/tq?tqx=out:json";

async function handleRequest(request) {
  try {
    const res = await fetch(SHEET_JSON_URL);
    const text = await res.text();

    // Parse JSON from Google Sheet wrapper
    const jsonText = text.replace(/^.*setResponse\((.*)\);?$/s, "$1");
    const data = JSON.parse(jsonText);

    const jobs = data.table.rows.map(row => {
      const cells = row.c.map(cell => (cell ? cell.v : ""));
      return {
        id: cells[0],
        country: cells[1],
        category: cells[2],
        title: cells[3],
        location: cells[4],
        salary: cells[5],
        description: cells[6],
        visa_tag: cells[7],
        apply_url: cells[8],
        date_added: cells[9] || new Date().toISOString().split('T')[0],
        featured: cells[10] || "no",
        apply_url_translated: cells[11]
      };
    });

    // Generate sitemap XML
    const urls = jobs.map(job => `
  <url>
    <loc>https://globalworkvisajobs.pages.dev/job/${job.id}</loc>
    <lastmod>${job.date_added}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`).join("\n");

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    return new Response(sitemap, {
      headers: { "Content-Type": "application/xml" }
    });

  } catch (err) {
    return new Response("Error generating sitemap: " + err.message, { status: 500 });
  }
}
