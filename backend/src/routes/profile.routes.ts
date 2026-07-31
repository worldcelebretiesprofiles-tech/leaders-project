import { Router } from "express";
import { ProfileController } from "../controllers/profile.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Profile basic CRUD
router.get("/", ProfileController.getProfiles);
router.post("/", authMiddleware, ProfileController.saveProfile);

// Me routes for dashboard
router.get("/me", authMiddleware, ProfileController.getMe);
router.get("/me/completion", authMiddleware, ProfileController.getMeCompletion);
router.patch("/me", authMiddleware, ProfileController.patchMe);

// This must come before /:id routes so "slug" doesn't get treated as an ID
router.get("/:slug", ProfileController.getProfileBySlug);

router.delete("/:id", authMiddleware, ProfileController.deleteProfile);

// Profile extensions (Expertise & Family)
router.get("/:id/professional-expertise", authMiddleware, ProfileController.getProfessionalExpertise);
router.post("/:id/professional-expertise", authMiddleware, ProfileController.saveProfessionalExpertise);

router.get("/:id/family", authMiddleware, ProfileController.getFamilyDetails);
router.post("/:id/family", authMiddleware, ProfileController.saveFamilyDetails);

// Admin Review Routes
router.get("/:id/versions", authMiddleware, ProfileController.getProfileVersions);
router.post("/:id/versions/:versionId/rollback", authMiddleware, ProfileController.rollbackVersion);
router.post("/:id/publish", authMiddleware, ProfileController.approveAndPublish);
router.post("/:id/request-changes", authMiddleware, ProfileController.requestChanges);
router.post("/:id/archive", authMiddleware, ProfileController.archiveProfile);

export default router;
