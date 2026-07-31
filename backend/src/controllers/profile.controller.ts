import { Request, Response, NextFunction } from "express";
import { ProfileService } from "../services/profile.service";
import { sendSuccess } from "../utils/apiResponse";
import { AuthenticatedRequest } from "../middleware/auth";
import { AppError } from "../utils/AppError";

export class ProfileController {
  static checkIsAdmin(req: AuthenticatedRequest): boolean {
    return req.user?.isAdmin === true;
  }

  static async getProfiles(req: Request, res: Response, next: NextFunction) {
    try {
      const isAdmin = ProfileController.checkIsAdmin(req as AuthenticatedRequest);
      
      if (!isAdmin) {
        req.query.status = 'PUBLISHED';
      }

      const profiles = await ProfileService.getProfiles(req.query, isAdmin);
      sendSuccess(res, profiles);
    } catch (err) {
      next(err);
    }
  }

  static async getProfileBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const isAdmin = ProfileController.checkIsAdmin(req as AuthenticatedRequest);
      const isPreview = req.query.preview === "true";
      const profile = await ProfileService.getProfileBySlug(req.params.slug, isAdmin, isPreview);
      sendSuccess(res, profile);
    } catch (err) {
      next(err);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as AuthenticatedRequest).user;
      if (!user) {
        throw new AppError("Unauthorized", 401);
      }
      const profile = await ProfileService.getProfileByOwnerId(user.id);
      sendSuccess(res, profile || {});
    } catch (err) {
      next(err);
    }
  }

  static async getMeCompletion(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as AuthenticatedRequest).user;
      if (!user) {
        throw new AppError("Unauthorized", 401);
      }
      const completion = await ProfileService.calculateProfileCompletion(user.id);
      sendSuccess(res, { completion });
    } catch (err) {
      next(err);
    }
  }

  static async patchMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as AuthenticatedRequest).user;
      if (!user) {
        throw new AppError("Unauthorized", 401);
      }
      const id = await ProfileService.patchProfileByOwnerId(user.id, req.body);
      sendSuccess(res, { success: true, id });
    } catch (err) {
      next(err);
    }
  }

  static async saveProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      if (!authReq.user || !authReq.user.isAdmin) {
        return res.status(403).json({ error: "Forbidden: Admin access required" });
      }
      const id = await ProfileService.saveProfile(req.body);
      sendSuccess(res, { success: true, id });
    } catch (err) {
      next(err);
    }
  }

  static async deleteProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      if (!authReq.user || !authReq.user.isAdmin) {
        return res.status(403).json({ error: "Forbidden: Admin access required" });
      }
      await ProfileService.deleteProfile(parseInt(req.params.id, 10));
      sendSuccess(res, { success: true });
    } catch (err) {
      next(err);
    }
  }

  static async getProfessionalExpertise(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const profileId = parseInt(req.params.id, 10);
      
      const { getPool } = require("../database/db");
      const pool = getPool();
      const profileRes = await pool.query("SELECT owner_id FROM profiles WHERE id = $1", [profileId]);
      if (profileRes.rows.length === 0) {
        return res.status(404).json({ error: "Profile not found" });
      }
      const ownerId = profileRes.rows[0].owner_id;
      if (ownerId !== authReq.user?.id && !authReq.user?.isAdmin) {
        return res.status(403).json({ error: "Forbidden: You do not own this profile" });
      }

      const data = await ProfileService.getProfessionalExpertise(profileId);
      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }

  static async saveProfessionalExpertise(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const profileId = parseInt(req.params.id, 10);
      
      const { getPool } = require("../database/db");
      const pool = getPool();
      const profileRes = await pool.query("SELECT owner_id FROM profiles WHERE id = $1", [profileId]);
      if (profileRes.rows.length === 0) {
        return res.status(404).json({ error: "Profile not found" });
      }
      const ownerId = profileRes.rows[0].owner_id;
      if (ownerId !== authReq.user?.id && !authReq.user?.isAdmin) {
        return res.status(403).json({ error: "Forbidden: You do not own this profile" });
      }

      const id = await ProfileService.saveProfessionalExpertise(profileId, req.body);
      sendSuccess(res, { success: true, id });
    } catch (err) {
      next(err);
    }
  }

  static async getFamilyDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const profileId = parseInt(req.params.id, 10);
      
      const { getPool } = require("../database/db");
      const pool = getPool();
      const profileRes = await pool.query("SELECT owner_id FROM profiles WHERE id = $1", [profileId]);
      if (profileRes.rows.length === 0) {
        return res.status(404).json({ error: "Profile not found" });
      }
      const ownerId = profileRes.rows[0].owner_id;
      if (ownerId !== authReq.user?.id && !authReq.user?.isAdmin) {
        return res.status(403).json({ error: "Forbidden: You do not own this profile" });
      }

      const data = await ProfileService.getFamilyDetails(profileId);
      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }

  static async saveFamilyDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const profileId = parseInt(req.params.id, 10);
      
      const { getPool } = require("../database/db");
      const pool = getPool();
      const profileRes = await pool.query("SELECT owner_id FROM profiles WHERE id = $1", [profileId]);
      if (profileRes.rows.length === 0) {
        return res.status(404).json({ error: "Profile not found" });
      }
      const ownerId = profileRes.rows[0].owner_id;
      if (ownerId !== authReq.user?.id && !authReq.user?.isAdmin) {
        return res.status(403).json({ error: "Forbidden: You do not own this profile" });
      }

      const id = await ProfileService.saveFamilyDetails(profileId, req.body);
      sendSuccess(res, { success: true, id });
    } catch (err) {
      next(err);
    }
  }

  // ============================================================================
  // ADMIN REVIEW & PUBLISHING ACTIONS (PHASE 4)
  // ============================================================================

  static async approveAndPublish(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ error: "Forbidden: Admin access required" });
      }
      
      const profileId = parseInt(req.params.id, 10);
      const { reviewNotes } = req.body;
      const adminId = req.user.id;
      
      const result = await ProfileService.approveAndPublish(profileId, adminId, reviewNotes);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  static async requestChanges(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ error: "Forbidden: Admin access required" });
      }
      
      const profileId = parseInt(req.params.id, 10);
      const { reviewNotes } = req.body;
      const adminId = req.user.id;
      
      const result = await ProfileService.requestChanges(profileId, adminId, reviewNotes);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  static async archiveProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ error: "Forbidden: Super Admin access required" });
      }
      
      const profileId = parseInt(req.params.id, 10);
      const { reason } = req.body;
      const adminId = req.user.id;
      
      const result = await ProfileService.archiveProfile(profileId, adminId, reason);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  static async getProfileVersions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ error: "Forbidden: Admin access required" });
      }
      const profileId = parseInt(req.params.id, 10);
      const versions = await ProfileService.getProfileVersions(profileId);
      sendSuccess(res, versions);
    } catch (err) {
      next(err);
    }
  }
  static async rollbackVersion(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ error: "Forbidden: Admin access required" });
      }
      const profileId = parseInt(req.params.id, 10);
      const versionId = parseInt(req.params.versionId, 10);
      const adminId = req.user.id;
      const result = await ProfileService.rollbackVersion(profileId, versionId, adminId);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
}
