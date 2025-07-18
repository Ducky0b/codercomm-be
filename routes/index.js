var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.send("Welcome to CoderComm BE")
});
//auth
const authRouter = require("./auth.api");
router.use("/auth", authRouter);
//user
const userRouter = require("./user.api");
router.use("/users", userRouter);
// //friends
const friendRouter = require("./friend.api");
router.use("/friends", friendRouter);
//comments
const commentRouter = require("./comment.api");
router.use("/comments", commentRouter);
//post
const postRouter = require("./post.api");
router.use("/posts", postRouter);
// //reaction
const reactionRouter = require("./reaction.api");
router.use("/reactions", reactionRouter);

module.exports = router;
