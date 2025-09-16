import { Request, Response } from 'express';
import { executeQuery } from '../DB/connection';

export async function update(req: Request, res: Response) {
    const id = Number(req.params.id);
    const { author_id } = req.body;
    let { title } = req.body;

    if (!author_id || !title || typeof title !== 'string' || title.trim() === '') {
        return res.sendStatus(400);
    }

    if (isNaN(id) || id <= 0 || isNaN(Number(author_id)) || Number(author_id) <= 0) {
        return res.sendStatus(400);
    }

    title = title.trim().toLowerCase().replace(/\b\w/g, char => char.toUpperCase());

    try {
        const result = await executeQuery(
            'UPDATE books SET author_id = ?, title = ? WHERE book_id = ?',
            [Number(author_id), title, id]
        );

        if ((result as any).affectedRows === 0) {
            return res.sendStatus(404);
        }

        res.sendStatus(200);
    } catch {
        res.sendStatus(500);
    }
}
