const express = require("express");
const authControllers = require("../controllers/auth.controllers");
const { body } = require("express-validator");
const router = express.Router();
const validators = require("../middleware/validators");
/**
 * @route POST /auth/login
 * @description Log in with email and password
 * @body { email , password}
 * @access Public
 */
router.post(
  "/login",
  validators.validate([
    body("email", "Invalid email")
      .exists()
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: false }),
    body("password", "Invalid password").exists().notEmpty(),
  ]),
  authControllers.loginWithEmail
);

module.exports = router;
