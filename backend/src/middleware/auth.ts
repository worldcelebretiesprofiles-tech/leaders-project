import { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";
import { query } from "../database/db";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://placeholder-url.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "placeholder-key";

// Use Supabase client for JWT verification
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    auth_user_id: string;
    email: string;
    role: string;
    status: string;
    isAdmin: boolean;
  };
}

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // 1. Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.warn("Supabase JWT Verification Failed:", error?.message);
      return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
    }

    // 2. Fetch application-specific user details from our DB
    const result = await query("SELECT id, auth_user_id, email, role, status FROM app_users WHERE auth_user_id = $1 AND deleted_at IS NULL", [user.id]);
    
    let appUser;
    
    if (result.rows.length === 0) {
      // Auto-provision user on first valid login (User Sync)
      const insertResult = await query(
        "INSERT INTO app_users (auth_user_id, email, role, status) VALUES ($1, $2, 'CLIENT', 'ACTIVE') RETURNING id, auth_user_id, email, role, status",
        [user.id, user.email]
      );
      appUser = insertResult.rows[0];
    } else {
      appUser = result.rows[0];
    }

    // 3. Enforce status (e.g., prevent suspended users)
    if (appUser.status === 'SUSPENDED' || appUser.status === 'REJECTED') {
      return res.status(403).json({ error: "Forbidden: Account is not active" });
    }

    // 4. Attach to Request
    const isAdmin = appUser.role === 'SUPER_ADMIN' || appUser.role === 'ADMIN';
    
    req.user = {
      id: appUser.id,
      auth_user_id: appUser.auth_user_id,
      email: appUser.email,
      role: appUser.role,
      status: appUser.status,
      isAdmin,
    };

    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    return res.status(500).json({ error: "Internal Server Error during authentication" });
  }
}
