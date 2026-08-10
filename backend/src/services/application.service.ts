import { createClient } from "@supabase/supabase-js";
import { ApplicationRepository } from "../repositories/application.repository";
import { AuthRepository } from "../repositories/auth.repository";
import { getClient, query } from "../database/db";
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
    
    try {
      return await ApplicationRepository.createApplication(data);
    } catch (err: any) {
      if (err.code === '23505' && err.constraint === 'applications_email_key') {
        throw new AppError("An application with this email address has already been submitted.", 400);
      }
      throw err;
    }
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
      return app; // Already approved, idempotent response
    }

    if (status !== 'APPROVED') {
      // Non-approval transitions can just happen directly without provisioning
      return await ApplicationRepository.updateApplicationStatus(id, status, adminNotes);
    }

    // --- APPROVAL WORKFLOW ---
    
    // 1. Provision / Resolve Supabase Auth User
    let authUserId: string;
    
    // Try to invite the user
    const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(app.email);
    
    if (inviteError) {
      if (inviteError.message.includes('rate limit')) {
        throw new AppError("Failed to provision auth user: Supabase email rate limit exceeded. Please try again later.", 429);
      }
      
      // If it fails, maybe the user already exists. Let's try to fetch them.
      const { data: usersData, error: fetchError } = await supabase.auth.admin.listUsers();
      if (fetchError) {
        throw new AppError("Failed to verify existing auth user", 500);
      }
      const existingUser = usersData.users.find((u: any) => u.email === app.email);
      
      if (!existingUser) {
        console.error("Supabase invite error:", inviteError);
        throw new AppError(`Failed to provision auth user during approval: ${inviteError.message}`, 500);
      }
      authUserId = existingUser.id;
    } else {
      if (!inviteData.user) {
        throw new AppError("Failed to provision auth user: No user data returned", 500);
      }
      authUserId = inviteData.user.id;
    }

    // 2. Perform DB operations inside a transaction
    const client = await getClient();
    try {
      await client.query('BEGIN');
      
      // A. Create or reuse app_users record
      const appUserInsert = await client.query(
        `INSERT INTO app_users (auth_user_id, email, role, status) 
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO NOTHING
         RETURNING id`,
        [authUserId, app.email, "LEADER", "ACTIVE"]
      );

      let appUserId;
      if (appUserInsert.rows.length > 0) {
        appUserId = appUserInsert.rows[0].id;
      } else {
        // Fetch existing
        const existingAppUser = await client.query('SELECT id FROM app_users WHERE email = $1', [app.email]);
        if (existingAppUser.rows.length === 0) {
          throw new AppError("Failed to create or find app_user record", 500);
        }
        appUserId = existingAppUser.rows[0].id;
      }

      // B. Create empty Profile with DRAFT status
      let baseSlug = app.first_name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + app.last_name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      let slug = baseSlug;
      let counter = 1;
      let profileId = null;
      
      while (!profileId) {
        // Try inserting the profile with the current slug
        const profileInsert = await client.query(
          `INSERT INTO profiles (slug, name, title, data, owner_id, status)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (slug) DO NOTHING
           RETURNING id`,
          [
            slug, 
            `${app.first_name} ${app.last_name}`, 
            app.job_title || null, 
            JSON.stringify({}), 
            authUserId, 
            "DRAFT"
          ]
        );

        if (profileInsert.rows.length > 0) {
          profileId = profileInsert.rows[0].id;
        } else {
          // Slug conflict occurred, try the next one
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
      }
      
      // C. Update application status ONLY after successful provisioning
      const updatedAppResult = await client.query(
        "UPDATE applications SET status = $1, admin_notes = $2, updated_at = NOW() WHERE id = $3 RETURNING *",
        [status, adminNotes, id]
      );
      
      await client.query('COMMIT');
      return updatedAppResult.rows[0];
      
    } catch (err: any) {
      await client.query('ROLLBACK');
      console.error("Transaction failed during application approval:", err);
      throw new AppError(`Approval transaction failed: ${err.message}`, 500);
    } finally {
      client.release();
    }
  }

  static async deleteApplication(id: number) {
    const app = await ApplicationRepository.getApplicationById(id);
    if (!app) throw new AppError("Application not found", 404);
    
    // We only allow deleting applications from the DB to clean up rejected or pending applications
    // If it's already APPROVED, deleting it would leave orphaned users/profiles.
    if (app.status === 'APPROVED') {
      throw new AppError("Cannot delete an application that has already been approved. Please delete the user's profile instead.", 400);
    }

    await ApplicationRepository.deleteApplication(id);
  }
}
