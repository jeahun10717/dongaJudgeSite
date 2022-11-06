import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { config } from "../config.js";
import * as userRepository from "../data/auth.js";

function createJwtToken(id) {
  return jwt.sign({ id }, config.jwt.secretKey, {
    expiresIn: config.jwt.expiresInSec,
  });
}

//학번, 이름, 학과, 이메일, 비밀번호
export async function signup(req, res) {
  const { id, email, password, username, department } = req.body;
  const found = await userRepository.findByEmail(email);
  if (found) {
    return res.status(409).json({ message: ` ${email} 이미 존재합니다.` });
  }
  const hashed = await bcrypt.hash(password, config.bcrypt.saltRounds);
  const userId = await userRepository.createUser({
    id,
    password: hashed,
    username,
    email,
    department,
  });

  const token = createJwtToken(userId);
  res.status(201).json({ token, id });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await userRepository.findByEmail(email);
  if (!user) {
    return res
      .status(401)
      .json({ message: "유효하지 않은 이메일 또는 비밀번호입니다." });
  }
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res
      .status(401)
      .json({ message: "유효하지 않은 이메일 또는 비밀번호입니다." });
  }
  const username = user.username;
  const token = createJwtToken(user.id);
  res.status(200).json({ token, username });
}
