import { NextFunction, Request, Response } from "express";
import { isAppError } from "../utils/app-error";

type PayloadTooLargeError = {
  type?: string;
  status?: number;
  statusCode?: number;
};

function isPayloadTooLargeError(error: unknown): error is PayloadTooLargeError {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as PayloadTooLargeError;
  return (
    candidate.type === "entity.too.large" ||
    candidate.status === 413 ||
    candidate.statusCode === 413
  );
}

function translateErrorMessage(message: string): string {
  if (!message) {
    return "Ocorreu um erro na solicitação.";
  }

  if (message.includes("Email is already in use")) {
    return "Este email já está em uso.";
  }

  if (message.includes("Username is already in use")) {
    return "Este nome de usuário já está em uso.";
  }

  if (message.includes("CPF is already in use")) {
    return "Este CPF já está cadastrado.";
  }

  if (message.includes("Email cannot be changed")) {
    return "O email não pode ser alterado.";
  }

  if (message.includes("Invalid email or password")) {
    return "Email ou senha incorretos.";
  }

  if (message.includes("Invalid email format")) {
    return "Formato de email inválido.";
  }

  if (
    message.includes("Invalid CPF") ||
    message.includes("CPF must have 11 digits")
  ) {
    return "CPF inválido. Verifique os dados informados.";
  }

  if (message.includes("Password must")) {
    return "A senha deve ter no mínimo 8 caracteres, com maiúscula, minúscula, número e caractere especial.";
  }

  if (message.includes("avatarUrl is too large")) {
    return "A imagem de perfil é muito grande. Escolha uma imagem menor.";
  }

  if (message.includes("User not found")) {
    return "Usuário não encontrado.";
  }

  if (message.includes("User not authenticated")) {
    return "Usuário não autenticado.";
  }

  if (message.includes("You can only manage your own account")) {
    return "Você só pode gerenciar sua própria conta.";
  }

  if (message.includes("You can only view your own account")) {
    return "Você só pode visualizar sua própria conta.";
  }

  if (message.includes("Request body must be an object")) {
    return "Corpo da requisição inválido.";
  }

  if (message.includes("is required")) {
    return "Há campos obrigatórios não preenchidos.";
  }

  if (message.includes("not found")) {
    return "Recurso não encontrado.";
  }

  return "Ocorreu um erro na solicitação.";
}

export function notFoundMiddleware(req: Request, res: Response): void {
  res.status(404).json({
    code: "ROUTE_NOT_FOUND",
    message: `Rota ${req.method} ${req.originalUrl} não encontrada`,
  });
}

export function errorMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (isPayloadTooLargeError(error)) {
    res.status(413).json({
      code: "PAYLOAD_TOO_LARGE",
      message: "O envio de dados é muito grande.",
    });
    return;
  }

  if (isAppError(error)) {
    res.status(error.statusCode).json({
      code: error.code,
      message: translateErrorMessage(error.message),
    });
    return;
  }

  console.error("Unhandled error:", error);

  res.status(500).json({
    code: "INTERNAL_SERVER_ERROR",
    message: "Erro interno do servidor.",
  });
}
