import { Router } from "express";
import { ProfileController } from "../controllers/profile.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Profile basic CRUD
router.get("/", ProfileController.getProfiles);
router.post("/", authMiddleware, ProfileController.saveProfile);

// This must come before /:id routes so "slug" doesn't get treated as an ID
router.get("/:slug", ProfileController.getProfileBySlug);

router.delete("/:id", authMiddleware, ProfileController.deleteProfile);

// Profile extensions (Expertise & Family)
router.get("/:id/professional-expertise", authMiddleware, ProfileController.getProfessionalExpertise);
router.post("/:id/professional-expertise", authMiddleware, ProfileController.saveProfessionalExpertise);

router.get("/:id/family", authMiddleware, ProfileController.getFamilyDetails);
router.post("/:id/family", authMiddleware, ProfileController.saveFamilyDetails);

export default router;
