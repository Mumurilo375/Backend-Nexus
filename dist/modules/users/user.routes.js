"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const async_handler_1 = require("../../middlewares/async-handler");
const user_controller_1 = __importDefault(require("./user.controller"));
const userRouter = (0, express_1.Router)();
userRouter.get("/", (0, async_handler_1.asyncHandler)(user_controller_1.default.findAll));
userRouter.post("/", (0, async_handler_1.asyncHandler)(user_controller_1.default.create));
userRouter.get("/:id", (0, async_handler_1.asyncHandler)(user_controller_1.default.getById));
exports.default = userRouter;
