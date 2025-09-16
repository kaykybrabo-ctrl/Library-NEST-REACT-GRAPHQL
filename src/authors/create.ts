import { Request, Response } from 'express';
import { executeQuery } from '../DB/connection';

export async function create(req: Request, res: Response) {
    let { name_author } = req.body;

    if (!name_author || typeof name_author !== 'string') {
        return res.sendStatus(400);
    }

    name_author = name_author.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());

    try {
        await executeQuery('INSERT INTO authors (name_author) VALUES (?)', [name_author]);
        res.sendStatus(201);
    } catch {
        res.sendStatus(500);
    }
}
