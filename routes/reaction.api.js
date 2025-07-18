const express = require("express");
const router = express.Router();
const { loginRequired } = require("../middleware/authentication");
const validators = require("../middleware/validators");
const { body, param } = require("express-validator");
const { saveReaction } = require("../controllers/reaction.controllers");

/**
 * @route POST /reactions
 * @description Save reaction
 * @body {targetType: 'Post' or 'Comment', targetId, emoji: 'like' or 'dislike' }
 * @access Login required
 */
router.post(
  "/",
  loginRequired,
  validators.validate([
    body("targetType", "Invalid targetType").exists().isIn(["Post", "Comment"]),
    body("targetId", "Invalid targetId")
      .exists()
      .custom(validators.checkObjectId),
    body("emoji", "Invalid emoji").exists().isIn(["like", "dislike"]),
  ]),
  saveReaction
);

module.exports = router;
