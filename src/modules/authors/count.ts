import { Request, Response } from "express";
import { executeQuery } from "@/infrastructure/DB/connection";

export async function count(_req: Request, res: Response) {
  try {
    const result = await executeQuery(
      "SELECT COUNT(*) AS total FROM authors WHERE deleted_at IS NULL",
    );
    res.json({ total: result[0].total });
  } catch {
    res.sendStatus(500);
  }
}
