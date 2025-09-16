import { Request, Response } from 'express';
import { executeQuery } from '../DB/connection';

export async function count(req: Request, res: Response) {
    const search = req.query.search as string | undefined;

    try {
        let query = 'SELECT COUNT(*) AS total FROM books';
        const params: any[] = [];

        if (search) {
            query += ' WHERE title LIKE ?';
            params.push(`%${search}%`);
        }

        const result = await executeQuery(query, params);
        res.json({ total: result[0].total });
    } catch {
        res.sendStatus(500);
    }
}
