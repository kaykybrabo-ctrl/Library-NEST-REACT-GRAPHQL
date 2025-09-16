import { Request, Response } from 'express';
import { executeQuery } from '../DB/connection';

export async function read(req: Request, res: Response) {
    let limit = Number(req.query.limit);
    let offset = Number(req.query.offset);
    const search = req.query.search as string | undefined;

    if (isNaN(limit) || limit <= 0) limit = 5;
    if (isNaN(offset) || offset < 0) offset = 0;

    try {
        let query = 'SELECT * FROM books';
        const params: any[] = [];

        if (search) {
            query += ' WHERE title LIKE ?';
            params.push(`%${search}%`);
        }

        query += ` LIMIT ${limit} OFFSET ${offset}`;
        const books = await executeQuery(query, params);
        res.json(books);
    } catch {
        res.sendStatus(500);
    }
}