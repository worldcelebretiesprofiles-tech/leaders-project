import { ProfileRepository } from "../repositories/profile.repository";

export class SitemapService {
  static async generateSitemap(frontendUrl: string) {
    const { profiles, categories } = await ProfileRepository.getSitemapData();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    xml += `  <url>\n`;
    xml += `    <loc>${frontendUrl}/</loc>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>1.0</priority>\n`;
    xml += `  </url>\n`;

    for (const cat of categories) {
      xml += `  <url>\n`;
      xml += `    <loc>${frontendUrl}/category/${cat.slug}</loc>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }

    for (const profile of profiles) {
      const lastMod = profile.updated_at
        ? new Date(profile.updated_at).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];
      xml += `  <url>\n`;
      xml += `    <loc>${frontendUrl}/leader/${profile.slug}</loc>\n`;
      xml += `    <lastmod>${lastMod}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>\n`;
    return xml;
  }
}
