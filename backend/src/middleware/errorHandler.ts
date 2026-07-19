import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import * as Sentry from "@sentry/node";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Log unexpected errors
  console.error("Unhandled Error:", err);
  
  // Send to Sentry if available
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(err);
  }

  res.status(500).json({ error: "An unexpected error occurred" });
};
