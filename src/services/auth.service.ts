import Users from "../models/Users";
import { AppError } from "../utils/app-error";
import { comparePassword } from "../utils/password";
import { generateToken } from "../utils/jwt";
import { LoginInput } from "../validators/auth.validator";

export async function loginUser(input: LoginInput) {
  const user = await Users.findOne({ where: { email: input.email } });

  if (!user || !comparePassword(input.password, user.passwordHash)) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  const token = generateToken({ id: user.id, email: user.email });

  const { passwordHash, ...userData } = user.toJSON();
  return { user: userData, token };
}