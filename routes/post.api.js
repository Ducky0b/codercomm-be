const express = require("express");
const router = express.Router();

const { loginRequired } = require("../middleware/authentication");
const validators = require("../middleware/validators");
const { body, param } = require("express-validator");
const {
  createPost,
  updatePost,
  getSinglePostById,
  deletePost,
  getCommentsOfPost,
  getAllPostsOfUser,
  getAllPostssWithPagination,
} = require("../controllers/post.controllers");
/**
 * @route GET /posts/users?page=1&limit=10
 * @description Get all post an user can see with pagination
 * @body
 * @access Login required
 */
router.get("/users", loginRequired, getAllPostssWithPagination);
/**
 * @route GET /posts/users/:userId?page=1&limit=10
 * @description Get all post an user can see with pagination
 * @body
 * @access Login required
 */
router.get("/users/:userId", loginRequired, getAllPostsOfUser);
/**
 * @route POST /posts
 * @description Create a new post
 * @body {content , image}
 * @access Login required
 */
router.post(
  "/",
  loginRequired,
  validators.validate([body("content", "Missing content").exists().notEmpty()]),
  createPost
);
/**
 * @route PUT /posts/:id
 * @description Update a post
 * @body {content , image}
 * @access Login required
 */
router.put(
  "/:id",
  loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  updatePost
);
/**
 * @route DELETE /posts/:id
 * @description Delete a post
 * @body
 * @access Login required
 */
router.delete(
  "/:id",
  loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  deletePost
);
/**
 * @route GET /posts/:id
 * @description Get a single post
 * @body
 * @access Login required
 */
router.get(
  "/:id",
  loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  getSinglePostById
);
/**
 * @route GET /posts/:id/comments
 * @description Get comment of a post
 * @body
 * @access Login required
 */
router.get(
  "/:id/comments",
  loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  getCommentsOfPost
);
module.exports = router;
