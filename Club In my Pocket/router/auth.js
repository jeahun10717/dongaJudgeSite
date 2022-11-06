import express from "express";
import { body } from "express-validator";
import * as authController from "../controller/auth.js";
import { validate } from "../middleware/validator.js";

const router = express.Router();

//로그인
const validateCredential = [
  body("email")
    .trim()
    .notEmpty()
    .isEmail()
    .normalizeEmail()
    .withMessage("이메일을 올바르지 않습니다."),
  body("password").trim().notEmpty().withMessage("올바른 비밀번호를 치세요."),
];

//학번, 이름, 학과, 이메일, 비밀번호
const validateSignup = [
  body("id").trim().notEmpty().isLength(7).withMessage("학번을 치세요."),
  body("email")
    .trim()
    .notEmpty()
    .isEmail()
    .normalizeEmail()
    .withMessage("올바른 이메일을 치세요."),
  body("password")
    .trim()
    .notEmpty()
    .isLength({ min: 5 })
    .withMessage("올바른 비밀번호를 치세요."),
  body("username").trim().notEmpty().withMessage("이름을 치세요."),
  body("department").trim().notEmpty().withMessage("학과를 치세요."),
  validate,
];
//회원가입
router.post("/signup", validateSignup, authController.signup);
// //로그인
router.post("/login", validateCredential, authController.login);

export default router;
