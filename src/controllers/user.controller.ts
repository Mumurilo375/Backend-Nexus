import { Request, Response } from "express";
import User from "../models/User";

class UserController {
    static async findAll(req: Request, res: Response) {
        const users = await User.findAll();

        res.send(users);
    }

    static async getById(req: Request, res: Response) {
        const { id } = req.params;
        const user = await User.findByPk(Number(id));
        res.send(user);
    }

    static async create(req: Request, res: Response) {
        const { name/*, email*/ } = req.body;

        const user = await User.create({ name: name/*, email: email*/ });
        res.send(user);
    }
}

export default UserController;