import { Router } from "express";
import GameController from "../controllers/game.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const gamesRouter = Router();

// Publico: catalogo de jogos pode ser consultado sem token.
gamesRouter.get("/", GameController.list);
gamesRouter.get("/:id", GameController.get);

// Protegido: manutencao de jogos exige autenticacao.
gamesRouter.post("/", authMiddleware, GameController.create);
gamesRouter.put("/:id", authMiddleware, GameController.update);
gamesRouter.delete("/:id", authMiddleware, GameController.remove);

export default gamesRouter;
