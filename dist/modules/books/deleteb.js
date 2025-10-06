"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteb = deleteb;
const connection_1 = require("../../infrastructure/DB/connection");
async function deleteb(req, res) {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0)
        return res.sendStatus(400);
    try {
        const result = await (0, connection_1.executeQuery)("UPDATE books SET deleted_at = NOW() WHERE book_id = ? AND deleted_at IS NULL", [id]);
        if (result.affectedRows === 0)
            return res.sendStatus(404);
        res.sendStatus(200);
    }
    catch {
        res.sendStatus(500);
    }
}
