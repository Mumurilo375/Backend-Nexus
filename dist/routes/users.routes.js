"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const usersRouter = (0, express_1.Router)();
usersRouter.get("/", user_controller_1.default.findAll);
usersRouter.post("/", user_controller_1.default.create);
usersRouter.get("/:id", user_controller_1.default.getById);
exports.default = usersRouter;
