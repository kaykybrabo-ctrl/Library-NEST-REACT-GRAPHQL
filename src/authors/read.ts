import { Request, Response } from 'express';
import { executeQuery } from '../DB/connection';

export async function read(req: Request, res: Response) {
    let limit = Number(req.query.limit);
    let offset = Number(req.query.offset);
    if (isNaN(limit) || limit <= 0) limit = 5;
    if (isNaN(offset) || offset < 0) offset = 0;

    try {
        const authors = await executeQuery(`SELECT * FROM authors LIMIT ${limit} OFFSET ${offset}`);
        res.json(authors);
    } catch {
        res.sendStatus(500);
    }
}
