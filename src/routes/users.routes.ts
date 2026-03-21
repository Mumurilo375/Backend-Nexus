import { Router } from "express";
import UserController from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const usersRouter = Router();

// Publico: listagem e cadastro podem ser acessados sem token.
usersRouter.get("/", UserController.list);
usersRouter.post("/", UserController.create);

// Publico: consulta de perfil por id.
usersRouter.get("/:id", UserController.get);

// Protegido: apenas usuario autenticado pode atualizar/remover conta.
usersRouter.put("/:id", authMiddleware, UserController.update);
usersRouter.delete("/:id", authMiddleware, UserController.remove);

export default usersRouter;