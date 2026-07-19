import { Router } from "express";
import { SitemapController } from "../controllers/sitemap.controller";

const router = Router();

router.get("/", SitemapController.getSitemap);

export default router;
