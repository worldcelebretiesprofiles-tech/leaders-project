import { ProfileRepository } from "../repositories/profile.repository";
import { AppError } from "../utils/AppError";

export class ProfileService {
  static filterUnpublishedData(row: any, isAdmin: boolean, isPreview: boolean = false) {
    const status = row.status;
    const shouldStrip = status && status !== "published" && !(isAdmin && isPreview) && !isAdmin;

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
    const { category_id, subcategory_id, limit, offset, sort_by, order } = query;
    
    const catId = category_id ? parseInt(category_id as string, 10) : undefined;
    const subId = subcategory_id ? parseInt(subcategory_id as string, 10) : undefined;
    
    const validSortColumns = ["id", "name", "created_at", "updated_at"];
    const sortBy = validSortColumns.includes(sort_by as string) ? (sort_by as string) : "id";
    const sortOrder = (order as string)?.toUpperCase() === "DESC" ? "DESC" : "ASC";
    
    const lim = limit ? parseInt(limit as string, 10) : undefined;
    const off = offset ? parseInt(offset as string, 10) : undefined;

    const rows = await ProfileRepository.getProfiles(catId, subId, sortBy, sortOrder, lim, off);

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

    // Since we use the same filter logic for singular profile, except it considers isPreview
    const status = row.status;
    const shouldStrip = status && status !== "published" && !(isAdmin && isPreview);

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
      return {
        ...basicProfile,
        is_published: false
      };
    }
    
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
}
