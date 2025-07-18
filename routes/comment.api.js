const express = require("express");
const router = express.Router();
const { loginRequired } = require("../middleware/authentication");
const validators = require("../middleware/validators");
const { body, param } = require("express-validator");
const {
  createComment,
  updateComment,
  deleteComment,
  getSingleComment,
} = require("../controllers/comment.controllers");

/**
 * @route POST /comments
 * @description Create new comment
 * @body { content , postId }
 * @access Login required
 */
router.post(
  "/",
  loginRequired,
  validators.validate([
    body("content", "Missing content").exists().notEmpty(),
    body("postId", "Missing postId")
      .exists()
      .isString()
      .custom(validators.checkObjectId),
  ]),
  createComment
);
/**
 * @route PUT /comments/:id
 * @description Update comment
 * @body { content }
 * @access Login required
 */
router.put(
  "/:id",
  loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
    body("content", "Missing content").exists().notEmpty(),
  ]),
  updateComment
);
/**
 * @route DELETE /comments/:id
 * @description DELETE comment
 * @body
 * @access Login required
 */
router.delete(
  "/:id",
  loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  deleteComment
);
/**
 * @route GET /comments/:id
 * @description Get details of a comment
 * @body
 * @access Login required
 */
router.get(
  "/:id",
  loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  getSingleComment
);

module.exports = router;
