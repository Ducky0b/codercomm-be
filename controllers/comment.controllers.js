const Comment = require("../models/Comment");
const Post = require("../models/Post");
const { AppError, sendResponse } = require("../helpers/utils");

const commentControllers = {};

const calculatorCommentCount = async (postId) => {
  const count = await Comment.countDocuments({
    post: postId,
    isDeleted: false,
  });
  await Post.findByIdAndUpdate(postId, { commentCount: count });
};

commentControllers.createComment = async (req, res, next) => {
  try {
    const { content, postId } = req.body;
    const { userId } = req;

    const post = await Post.findById(postId);
    if (!post)
      throw new AppError(400, "Bad Request", "Create new comment error");

    let comment = await Comment.create({
      author: userId,
      post: postId,
      content,
    });
    if (!comment)
      throw new AppError(400, "Bad Request", "Create comment error");

    await calculatorCommentCount(postId);
    comment = await comment.populate("author");

    sendResponse(
      res,
      200,
      true,
      { comment },
      null,
      "Create comment successful"
    );
  } catch (error) {
    next(error);
  }
};

commentControllers.updateComment = async (req, res, next) => {
  try {
    const { userId } = req;
    const commentId = req.params.id;
    const { content } = req.body;

    const comment = await Comment.findOneAndUpdate(
      { _id: commentId, author: userId },
      { content },
      { new: true }
    );
    console.log(comment);
    if (!comment)
      throw new AppError(400, "Bad Request", "Update comment error");

    sendResponse(
      res,
      200,
      true,
      { comment },
      null,
      "Update comment successful"
    );
  } catch (error) {
    next(error);
  }
};

commentControllers.deleteComment = async (req, res, next) => {
  try {
    const { userId } = req;
    const commentId = req.params.id;

    const comment = await Comment.findOneAndDelete({
      _id: commentId,
      author: userId,
    });
    console.log(comment);
    if (!comment)
      throw new AppError(400, "Bad Request", "Delete comment error");

    await calculatorCommentCount(comment.post);

    sendResponse(
      res,
      200,
      true,
      { comment },
      null,
      "Delete comment successful"
    );
  } catch (error) {
    next(error);
  }
};

commentControllers.getSingleComment = async (req, res, next) => {
  try {
    const { userId } = req;
    const commentId = req.params.id;

    const comment = await Comment.findById(commentId);

    if (!comment)
      throw new AppError(400, "Bad Request", "Get single comment error");

    await calculatorCommentCount(comment.post);

    sendResponse(
      res,
      200,
      true,
      { comment },
      null,
      "Get single comment successful"
    );
  } catch (error) {
    next(error);
  }
};



module.exports = commentControllers;
