import { Request, Response, NextFunction } from "express";
import { SitemapService } from "../services/sitemap.service";

export class SitemapController {
  static async getSitemap(req: Request, res: Response, next: NextFunction) {
    try {
      const frontendUrl = process.env.FRONTEND_URL || "https://globalleadersphere.com";
      const xml = await SitemapService.generateSitemap(frontendUrl);
      
      res.header("Content-Type", "application/xml");
      res.status(200).send(xml);
    } catch (err) {
      next(err);
    }
  }
}
