import { Request, Response } from "express";
import { executeQuery } from "@/infrastructure/DB/connection";

export async function deletea(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (isNaN(id) || id <= 0) return res.sendStatus(400);

  try {
    const result = await executeQuery(
      "UPDATE authors SET deleted_at = NOW() WHERE author_id = ? AND deleted_at IS NULL",
      [id],
    );

    if ((result as any).affectedRows === 0) return res.sendStatus(404);

    res.sendStatus(200);
  } catch {
    res.sendStatus(500);
  }
}
