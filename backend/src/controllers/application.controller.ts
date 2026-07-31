import { Request, Response, NextFunction } from "express";
import { ApplicationService } from "../services/application.service";
import { sendSuccess } from "../utils/apiResponse";

export class ApplicationController {
  static async submitApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const app = await ApplicationService.submitApplication(req.body);
      sendSuccess(res, app, 201);
    } catch (err) {
      next(err);
    }
  }

  static async listApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as string;
      const apps = await ApplicationService.listApplications(status);
      sendSuccess(res, apps);
    } catch (err) {
      next(err);
    }
  }

  static async getApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const app = await ApplicationService.getApplication(id);
      sendSuccess(res, app);
    } catch (err) {
      next(err);
    }
  }

  static async reviewApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const { status, adminNotes } = req.body;
      const app = await ApplicationService.reviewApplication(id, status, adminNotes);
      sendSuccess(res, app);
    } catch (err) {
      next(err);
    }
  }
}
