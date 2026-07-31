import { createClient } from "@supabase/supabase-js";
import { ApplicationRepository } from "../repositories/application.repository";
import { AuthRepository } from "../repositories/auth.repository";
import { AppError } from "../utils/AppError";
import crypto from "crypto";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://placeholder-url.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export class ApplicationService {
  static async submitApplication(data: any) {
    if (!data.first_name || !data.last_name || !data.email) {
      throw new AppError("First name, last name, and email are required.", 400);
    }
    
    // In a real app, you would check if email already exists in applications or app_users
    
    return await ApplicationRepository.createApplication(data);
  }

  static async listApplications(status?: string) {
    return await ApplicationRepository.getApplications(status);
  }

  static async getApplication(id: number) {
    const app = await ApplicationRepository.getApplicationById(id);
    if (!app) throw new AppError("Application not found", 404);
    return app;
  }

  static async reviewApplication(id: number, status: string, adminNotes?: string) {
    const validStatuses = ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      throw new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    const app = await ApplicationRepository.getApplicationById(id);
    if (!app) throw new AppError("Application not found", 404);

    if (app.status === 'APPROVED') {
      throw new AppError("Application is already approved", 400);
    }

    const updatedApp = await ApplicationRepository.updateApplicationStatus(id, status, adminNotes);

    if (status === 'APPROVED') {
      // 1. Provision Supabase Auth User via Invitation
      const { data: authData, error } = await supabase.auth.admin.inviteUserByEmail(app.email);

      if (error || !authData.user) {
        console.error("Failed to invite Supabase user:", error);
        throw new AppError("Failed to provision auth user during approval", 500);
      }

      // 2. Create app_users record with LEADER role
      await AuthRepository.createAppUser(authData.user.id, app.email, "LEADER", "ACTIVE");

      // 3. Create empty Profile with DRAFT status
      const { ProfileRepository } = require("../repositories/profile.repository");
      const slug = app.first_name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + app.last_name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      await ProfileRepository.createProfile(
        { slug, name: `${app.first_name} ${app.last_name}`, title: app.job_title },
        null, // categoryId
        null, // subcategoryId
        authData.user.id,
        "DRAFT"
      );
    }

    return updatedApp;
  }
}
