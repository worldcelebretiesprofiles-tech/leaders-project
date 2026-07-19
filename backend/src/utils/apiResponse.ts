import { Response } from "express";

export const sendSuccess = (res: Response, data: any, statusCode: number = 200) => {
  res.status(statusCode).json(data);
};

export const sendError = (res: Response, message: string, statusCode: number = 500) => {
  res.status(statusCode).json({ error: message });
};
