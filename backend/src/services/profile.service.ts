import { ProfileRepository } from "../repositories/profile.repository";
import { AppError } from "../utils/AppError";

import { EmailService } from "./email.service";

export class ProfileService {
  static filterUnpublishedData(row: any, isAdmin: boolean, isPreview: boolean = false) {
    const status = row.status;
    const shouldStrip = status && status.toUpperCase() !== "PUBLISHED" && !(isAdmin && isPreview) && !isAdmin;

    if (shouldStrip) {
      const {
        roles, expertise_areas, services_offered, industries_served, who_i_help,
        languages, years_experience, professional_summary, keywords,
        is_available_for_consultation, cta_text, impact_statistics, achievements,
        featured_services, is_published, published_at, published_by,
        section_visibility, contact_types, professional_journey, current_activities,
        how_i_help, services_consultations, professional_gallery, publications,
        media_interviews, testimonials, organizations_associations, contact_collaboration,
        ...basicProfile
      } = row;
      // Strip status from basic profile for public view? No, keeping basicProfile as it was in original
      return {
        ...basicProfile,
        is_published: false
      };
    }
    return row;
  }

  static async getProfiles(query: any, isAdmin: boolean) {
    const { category_id, subcategory_id, limit, offset, sort_by, order, status } = query;
    
    const catId = category_id ? parseInt(category_id as string, 10) : undefined;
    const subId = subcategory_id ? parseInt(subcategory_id as string, 10) : undefined;
    
    const validSortColumns = ["id", "name", "created_at", "updated_at"];
    const sortBy = validSortColumns.includes(sort_by as string) ? (sort_by as string) : "id";
    const sortOrder = (order as string)?.toUpperCase() === "DESC" ? "DESC" : "ASC";
    
    const lim = limit ? parseInt(limit as string, 10) : undefined;
    const off = offset ? parseInt(offset as string, 10) : undefined;

    const rows = await ProfileRepository.getProfiles(catId, subId, sortBy, sortOrder, lim, off, status as string | undefined);

    return rows.map(row => this.filterUnpublishedData(row, isAdmin));
  }

  static async getProfileBySlug(slug: string, isAdmin: boolean, isPreview: boolean) {
    // Normalize slug
    if (
      slug === "dr-ravuru-balaraju" || 
      slug === "ravuru-balaraju" || 
      slug === "ravuri-balaraju"
    ) {
      slug = "dr-ravuri-balaraju";
    }

    const row = await ProfileRepository.getProfileBySlug(slug);
    if (!row) {
      throw new AppError("Leader profile not found", 404);
    }

    // Serve the live published version if applicable
    if (row.is_published && !isPreview && row.current_version_id) {
      const version = await ProfileRepository.getProfileVersion(row.current_version_id);
      if (version) {
        return {
          id: row.id,
          slug: version.slug,
          name: version.name,
          title: version.title,
          subtitle: version.subtitle,
          portrait: version.portrait,
          category_id: version.category_id,
          subcategory_id: version.subcategory_id,
          status: 'PUBLISHED',
          is_published: true,
          ...version.data
        };
      }
    }

    // If we get here and it's a public request, verify it's allowed to be seen
    if (!isAdmin && !isPreview) {
      if (!row.is_published || row.status === 'ARCHIVED') {
        throw new AppError("Leader profile not found or not published", 404);
      }
    }

    // Otherwise, we are an admin previewing the draft, so return the raw draft row
    return row;
  }

  static async saveProfile(profile: any) {
    if (!profile.name || !profile.slug) {
      throw new AppError("Name and Slug are required fields", 400);
    }

    const categoryId = profile.category_id ? parseInt(profile.category_id, 10) : null;
    const subcategoryId = profile.subcategory_id ? parseInt(profile.subcategory_id, 10) : null;

    if (profile.id) {
      await ProfileRepository.updateProfile(profile.id, profile, categoryId, subcategoryId);
      return profile.id;
    } else {
      return await ProfileRepository.createProfile(profile, categoryId, subcategoryId);
    }
  }

  static async getProfileByOwnerId(ownerId: string) {
    const row = await ProfileRepository.getProfileByOwnerId(ownerId);
    return row;
  }

  static async calculateProfileCompletion(ownerId: string) {
    const row = await ProfileRepository.getProfileByOwnerId(ownerId);
    if (!row) {
      return {
        percentage: 0,
        completedFields: 0,
        totalFields: 22,
        missing: ["Profile Data Not Found"]
      };
    }

    const expectedFields = [
      { key: "name", label: "Leader Name" },
      { key: "title", label: "Title/Designation" },
      { key: "category_id", label: "Primary Category" },
      { key: "portrait", label: "Profile Photo" },
      { key: "slug", label: "Profile Slug" }
    ];

    const expectedDataFields = [
      { key: "biography", label: "Biography" },
      { key: "bio", label: "Bio Metrics (Stats)" },
      { key: "roles", label: "Roles" },
      { key: "timeline", label: "Timeline" },
      { key: "orgFocus", label: "Organization Focus" },
      { key: "initiatives", label: "Initiatives" },
      { key: "awards", label: "Awards" },
      { key: "recent", label: "Recent Activities" },
      { key: "inspirations", label: "Inspirations" },
      { key: "connect", label: "Contact Information" }
    ];

    const missing: string[] = [];
    let completedFields = 0;
    const totalFields = expectedFields.length + expectedDataFields.length + 1; // +1 for expertise

    expectedFields.forEach(f => {
      if (row[f.key] && String(row[f.key]).trim() !== "") {
        completedFields++;
      } else {
        missing.push(f.label);
      }
    });

    const data = row.data || {};
    expectedDataFields.forEach(f => {
      let isComplete = false;
      const val = data[f.key];
      if (val) {
        if (Array.isArray(val) && val.length > 0) isComplete = true;
        else if (typeof val === "object" && Object.keys(val).length > 0) isComplete = true;
        else if (typeof val === "string" && val.trim() !== "") isComplete = true;
      }
      if (isComplete) completedFields++;
      else missing.push(f.label);
    });

    // Check professional expertise
    const expertise = await ProfileRepository.getProfessionalExpertise(row.id);
    if (expertise && expertise.professional_summary && expertise.professional_summary.trim() !== "") {
      completedFields++;
    } else {
      missing.push("Professional Expertise Summary");
    }

    const percentage = Math.round((completedFields / totalFields) * 100);

    return {
      percentage,
      completedFields,
      totalFields,
      missing
    };
  }

  static async patchProfileByOwnerId(ownerId: string, partialData: any) {
    let row = await ProfileRepository.getProfileByOwnerId(ownerId);
    let id: number;
    if (!row) {
      // Create new draft
      const slug = partialData.slug || `user-${ownerId}`;
      id = await ProfileRepository.createProfile({ slug, ...partialData }, null, null, ownerId, 'DRAFT');
    } else {
      id = row.id;
      await ProfileRepository.updateProfilePartial(id, partialData);
    }
    return id;
  }

  static async deleteProfile(id: number) {
    await ProfileRepository.deleteProfile(id);
  }

  static async getProfessionalExpertise(profileId: number) {
    const expertise = await ProfileRepository.getProfessionalExpertise(profileId);
    if (!expertise) {
      return {
        profile_id: profileId,
        roles: [],
        expertise_areas: [],
        services_offered: [],
        industries_served: [],
        who_i_help: [],
        languages: [],
        years_experience: "",
        professional_summary: "",
        keywords: [],
        is_available_for_consultation: false,
        cta_text: "Book Consultation",
        impact_statistics: [],
        achievements: [],
        featured_services: [],
        is_published: false,
        status: "draft",
        published_at: null,
        published_by: null,
        section_visibility: {},
        contact_types: [],
        professional_journey: [],
        current_activities: [],
        how_i_help: [],
        services_consultations: [],
        professional_gallery: [],
        publications: [],
        media_interviews: [],
        testimonials: [],
        organizations_associations: [],
        contact_collaboration: {}
      };
    }
    return expertise;
  }

  static async saveProfessionalExpertise(profileId: number, data: any) {
    const exists = await ProfileRepository.checkProfileExistsById(profileId);
    if (!exists) {
      throw new AppError("Profile not found", 404);
    }
    return await ProfileRepository.upsertProfessionalExpertise(profileId, data);
  }

  static async getFamilyDetails(profileId: number) {
    const family = await ProfileRepository.getFamilyDetails(profileId);
    if (!family) {
      return {
        profile_id: profileId,
        father_name: "",
        mother_name: "",
        spouse_name: "",
        children: [],
        background: "",
        images: []
      };
    }
    return family;
  }

  static async saveFamilyDetails(profileId: number, data: any) {
    const exists = await ProfileRepository.checkProfileExistsById(profileId);
    if (!exists) {
      throw new AppError("Profile not found", 404);
    }
    return await ProfileRepository.upsertFamilyDetails(profileId, data);
  }

  // ============================================================================
  // ADMIN REVIEW & PUBLISHING ACTIONS (PHASE 4)
  // ============================================================================
  
  static async approveAndPublish(profileId: number, adminId: string, reviewNotes?: string) {
    const { getPool } = require("../database/db");
    const pool = getPool();
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 1. Fetch current draft
      const profileRes = await client.query(`SELECT * FROM profiles WHERE id = $1`, [profileId]);
      const row = profileRes.rows[0];
      if (!row) throw new AppError("Leader profile not found", 404);

      // Validate status
      if (row.status !== "SUBMITTED" && row.status !== "CHANGES_REQUESTED" && row.status !== "DRAFT") {
        throw new AppError("Cannot publish profile in current status", 400);
      }

      const versionNumber = (row.latest_version_number || 0) + 1;

      // Extract raw relational fields out from standard snapshot
      const {
        id, owner_id, status, is_published, current_version_id, latest_version_number,
        submitted_at, last_published_at, change_summary,
        created_at, updated_at,
        category_name, category_slug, subcategory_name, subcategory_slug,
        ...snapshotData
      } = row;

      // 2. Insert into profile_versions
      const versionQuery = `
        INSERT INTO profile_versions (
          profile_id, version_number, status, slug, name, title, subtitle, portrait,
          category_id, subcategory_id, data, change_summary, review_notes, approved_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING id
      `;
      const versionResult = await client.query(versionQuery, [
        row.id, versionNumber, 'PUBLISHED', row.slug, row.name, row.title, row.subtitle, row.portrait,
        row.category_id, row.subcategory_id, JSON.stringify(snapshotData), row.change_summary, reviewNotes, adminId
      ]);
      const versionId = versionResult.rows[0].id;

      // 3. Update profiles table
      await client.query(`
        UPDATE profiles 
        SET current_version_id = $1, 
            latest_version_number = $2, 
            is_published = true, 
            status = 'DRAFT', 
            last_published_at = CURRENT_TIMESTAMP 
        WHERE id = $3
      `, [versionId, versionNumber, row.id]);

      // 4. Create Audit Log
      await client.query(`
        INSERT INTO audit_logs (actor_id, entity_type, entity_id, action, previous_state, new_state, metadata)
        VALUES ($1, 'PROFILE', $2, 'PUBLISH', $3, $4, $5)
      `, [
        adminId, 
        row.id, 
        JSON.stringify({ version: row.latest_version_number, status: row.status }), 
        JSON.stringify({ version: versionNumber, status: 'PUBLISHED', version_id: versionId }),
        JSON.stringify({ review_notes: reviewNotes, change_summary: row.change_summary })
      ]);

      // 5. Create Notification for Leader
      await client.query(`
        INSERT INTO notifications (user_id, title, message, type, priority, metadata)
        VALUES ($1, 'Portfolio Published', 'Your portfolio has been approved and is now live.', 'PUBLISHED', 'HIGH', $2)
      `, [row.owner_id, JSON.stringify({ version: versionNumber, profile_slug: row.slug })]);

      // 6. Send Email Notification
      if (row.owner_id) {
        const userRes = await client.query(`SELECT email FROM app_users WHERE id = $1`, [row.owner_id]);
        if (userRes.rows[0]?.email) {
          // Fire and forget (don't await to avoid blocking the transaction commit, though it's safe to await here since it's just a mock right now)
          EmailService.sendProfilePublished(userRes.rows[0].email, row.name || 'Leader', versionNumber).catch(e => console.error(e));
        }
      }

      await client.query("COMMIT");
      return { versionId, versionNumber };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  static async requestChanges(profileId: number, adminId: string, reviewNotes: string) {
    if (!reviewNotes || reviewNotes.trim().length === 0) {
      throw new AppError("Review notes are required when requesting changes", 400);
    }
    const { getPool } = require("../database/db");
    const pool = getPool();
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 1. Fetch current draft
      const profileRes = await client.query(`SELECT * FROM profiles WHERE id = $1`, [profileId]);
      const row = profileRes.rows[0];
      if (!row) throw new AppError("Leader profile not found", 404);

      // 2. Update status
      await client.query(`
        UPDATE profiles 
        SET status = 'CHANGES_REQUESTED'
        WHERE id = $1
      `, [row.id]);

      // 3. Create Audit Log
      await client.query(`
        INSERT INTO audit_logs (actor_id, entity_type, entity_id, action, previous_state, new_state, metadata)
        VALUES ($1, 'PROFILE', $2, 'REQUEST_CHANGES', $3, $4, $5)
      `, [
        adminId, 
        row.id, 
        JSON.stringify({ status: row.status }), 
        JSON.stringify({ status: 'CHANGES_REQUESTED' }),
        JSON.stringify({ review_notes: reviewNotes })
      ]);

      // 4. Create Notification for Leader
      await client.query(`
        INSERT INTO notifications (user_id, title, message, type, priority, metadata)
        VALUES ($1, 'Changes Requested', 'An administrator has requested changes to your portfolio submission.', 'CHANGES_REQUESTED', 'NORMAL', $2)
      `, [row.owner_id, JSON.stringify({ review_notes: reviewNotes, profile_slug: row.slug })]);

      // 5. Send Email Notification
      if (row.owner_id) {
        const userRes = await client.query(`SELECT email FROM app_users WHERE id = $1`, [row.owner_id]);
        if (userRes.rows[0]?.email) {
          EmailService.sendChangesRequested(userRes.rows[0].email, row.name || 'Leader', reviewNotes).catch(e => console.error(e));
        }
      }

      await client.query("COMMIT");
      return { status: 'CHANGES_REQUESTED' };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  static async archiveProfile(profileId: number, adminId: string, reason?: string) {
    const { getPool } = require("../database/db");
    const pool = getPool();
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      
      const profileRes = await client.query(`SELECT * FROM profiles WHERE id = $1`, [profileId]);
      const row = profileRes.rows[0];
      if (!row) throw new AppError("Leader profile not found", 404);

      await client.query(`UPDATE profiles SET status = 'ARCHIVED' WHERE id = $1`, [row.id]);

      await client.query(`
        INSERT INTO audit_logs (actor_id, entity_type, entity_id, action, metadata)
        VALUES ($1, 'PROFILE', $2, 'ARCHIVE', $3)
      `, [adminId, row.id, JSON.stringify({ reason })]);

      await client.query("COMMIT");
      return { status: 'ARCHIVED' };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  static async getProfileVersions(profileId: number) {
    const { getPool } = require("../database/db");
    const pool = getPool();
    const result = await pool.query(`
      SELECT 
        v.id, v.version_number, v.status, v.change_summary, v.review_notes, v.published_at,
        u.email as approved_by_email
      FROM profile_versions v
      LEFT JOIN app_users u ON v.approved_by = u.id
      WHERE v.profile_id = $1
      ORDER BY v.version_number DESC
    `, [profileId]);
    return result.rows;
  }

  // ============================================================================
  // VERSION ROLLBACK (PHASE 5)
  // ============================================================================
  
  static async rollbackVersion(profileId: number, versionId: number, adminId: string) {
    const { getPool } = require("../database/db");
    const pool = getPool();
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 1. Get the version to restore
      const versionRes = await client.query(`SELECT * FROM profile_versions WHERE id = $1 AND profile_id = $2`, [versionId, profileId]);
      const version = versionRes.rows[0];
      if (!version) throw new AppError("Version not found", 404);

      // 2. Overwrite the working draft with the version's data
      const data = typeof version.data === 'string' ? JSON.parse(version.data) : version.data;

      await client.query(`
        UPDATE profiles
        SET name = $1, title = $2, subtitle = $3, portrait = $4,
            category_id = $5, subcategory_id = $6, data = $7,
            status = 'DRAFT'
        WHERE id = $8
      `, [
        version.name, version.title, version.subtitle, version.portrait,
        version.category_id, version.subcategory_id, data,
        profileId
      ]);

      // 3. Create Audit Log
      await client.query(`
        INSERT INTO audit_logs (actor_id, entity_type, entity_id, action, metadata)
        VALUES ($1, 'PROFILE', $2, 'ROLLBACK_DRAFT', $3)
      `, [adminId, profileId, JSON.stringify({ restored_version_id: versionId, restored_version_number: version.version_number })]);

      await client.query("COMMIT");
      return { success: true, restored_version_number: version.version_number };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }
}
