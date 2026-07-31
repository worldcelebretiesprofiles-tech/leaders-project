import { query } from "../database/db";

export class ApplicationRepository {
  static async createApplication(data: any) {
    const res = await query(
      `INSERT INTO applications (first_name, last_name, email, company, job_title, linkedin_url, motivation, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'SUBMITTED')
       RETURNING *`,
      [data.first_name, data.last_name, data.email, data.company, data.job_title, data.linkedin_url, data.motivation]
    );
    return res.rows[0];
  }

  static async getApplications(status?: string) {
    let q = "SELECT * FROM applications";
    const params: any[] = [];
    if (status) {
      q += " WHERE status = $1";
      params.push(status);
    }
    q += " ORDER BY created_at DESC";
    
    const res = await query(q, params);
    return res.rows;
  }

  static async getApplicationById(id: number) {
    const res = await query("SELECT * FROM applications WHERE id = $1", [id]);
    return res.rows.length > 0 ? res.rows[0] : null;
  }

  static async updateApplicationStatus(id: number, status: string, adminNotes?: string) {
    const res = await query(
      `UPDATE applications 
       SET status = $1, admin_notes = COALESCE($2, admin_notes), updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [status, adminNotes || null, id]
    );
    return res.rows[0];
  }
}
