import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ProfileService } from "../services/profile.service";
import { sendSuccess } from "../utils/apiResponse";

const JWT_SECRET = process.env.JWT_SECRET || "default_dev_secret_key_change_in_prod";

export class ProfileController {
  static checkIsAdmin(req: Request): boolean {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        jwt.verify(token, JWT_SECRET);
        return true;
      } catch (err) {}
    }
    return false;
  }

  static async getProfiles(req: Request, res: Response, next: NextFunction) {
    try {
      const isAdmin = ProfileController.checkIsAdmin(req);
      const profiles = await ProfileService.getProfiles(req.query, isAdmin);
      sendSuccess(res, profiles);
    } catch (err) {
      next(err);
    }
  }

  static async getProfileBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const isAdmin = ProfileController.checkIsAdmin(req);
      const isPreview = req.query.preview === "true";
      const profile = await ProfileService.getProfileBySlug(req.params.slug, isAdmin, isPreview);
      sendSuccess(res, profile);
    } catch (err) {
      next(err);
    }
  }

  static async saveProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const id = await ProfileService.saveProfile(req.body);
      sendSuccess(res, { success: true, id });
    } catch (err) {
      next(err);
    }
  }

  static async deleteProfile(req: Request, res: Response, next: NextFunction) {
    try {
      await ProfileService.deleteProfile(parseInt(req.params.id, 10));
      sendSuccess(res, { success: true });
    } catch (err) {
      next(err);
    }
  }

  static async getProfessionalExpertise(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ProfileService.getProfessionalExpertise(parseInt(req.params.id, 10));
      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }

  static async saveProfessionalExpertise(req: Request, res: Response, next: NextFunction) {
    try {
      const id = await ProfileService.saveProfessionalExpertise(parseInt(req.params.id, 10), req.body);
      sendSuccess(res, { success: true, id });
    } catch (err) {
      next(err);
    }
  }

  static async getFamilyDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ProfileService.getFamilyDetails(parseInt(req.params.id, 10));
      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }

  static async saveFamilyDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const id = await ProfileService.saveFamilyDetails(parseInt(req.params.id, 10), req.body);
      sendSuccess(res, { success: true, id });
    } catch (err) {
      next(err);
    }
  }
}
