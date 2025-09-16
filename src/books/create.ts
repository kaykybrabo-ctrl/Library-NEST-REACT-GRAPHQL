import { Request, Response } from 'express';
import { executeQuery } from '../DB/connection';

export async function create(req: Request, res: Response) {
    const { author_id } = req.body;
    let { title } = req.body;

    if (!author_id || !title || typeof title !== 'string') {
        return res.sendStatus(400);
    }

    title = title.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());

    try {
        await executeQuery('INSERT INTO books (author_id, title) VALUES (?, ?)', [author_id, title]);
        res.sendStatus(201);
    } catch {
        res.sendStatus(500);
    }
}
