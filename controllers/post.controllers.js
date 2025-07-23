const { sendResponse, AppError } = require("../helpers/utils");
const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");
const Friend = require("../models/Friend");

const postControllers = {};

const calculatorPostCount = async (userId) => {
  const count = await Post.countDocuments({
    author: userId,
    isDeleted: false,
  });
  await User.findByIdAndUpdate(userId, { postCount: count });
};

postControllers.createPost = async (req, res, next) => {
  try {
    const { userId } = req;
    const { content, image } = req.body;

    let post = await Post.create({ content, image, author: userId });

    await calculatorPostCount(userId);
    post = await post.populate("author");

    sendResponse(res, 200, true, post, null, "Create new post succesful");
  } catch (error) {
    next(error);
  }
};
postControllers.updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    let post = await Post.findById(id);

    if (!post.author.equals(userId))
      throw new AppError(400, "Only author can edit post", "Update post error");

    if (!post) throw new AppError(400, "Bad Request", "Update post error");

    const allows = ["content", "image"];

    allows.forEach((field) => {
      if (req.body[field] !== undefined) post[field] = req.body[field];
    });
    await post.save();

    sendResponse(res, 200, true, post, null, "Update User Succesful");
  } catch (error) {
    next(error);
  }
};
postControllers.getSinglePostById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    let post = await Post.findById(id).populate("author");
    if (!post) throw new AppError(400, "Bad Request", "Get single post error");

    post = post.toJSON();
    post.comments = await Comment.find({ post: post._id }).populate("author");

    sendResponse(res, 200, true, post, null, "Get Single Post Succesful");
  } catch (error) {
    next(error);
  }
};
postControllers.getAllPostssWithPagination = async (req, res, next) => {
  try {
    let { page, limit } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    const filterConditions = [{ isDeleted: false }];

    const filterCriteria = filterConditions.length
      ? { $and: filterConditions }
      : {};

    const count = await Post.countDocuments(filterCriteria);
    const totalPage = Math.ceil(count / limit);
    const offset = limit * (page - 1);

    const post = await Post.find(filterCriteria)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate("author");
    if (!post) throw new AppError(400, "Bad Request", "Get all post error");

    sendResponse(
      res,
      200,
      true,
      { post, totalPage, count },
      null,
      "Get All Post Succesful"
    );
  } catch (error) {
    next(error);
  }
};
postControllers.getAllPostsOfUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    let { page, limit, ...filter } = { ...req.query };

    let user = await User.findById(userId);
    if (!user) throw new AppError(400, "User not found", "Get posts error");

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    const filterConditions = [{ isDeleted: false }, { author: userId }];

    const filterCriteria = filterConditions.length
      ? { $and: filterConditions }
      : {};

    const count = await Post.countDocuments(filterCriteria);
    const totalPage = Math.ceil(count / limit);
    const offset = limit * (page - 1);

    const post = await Post.find(filterCriteria)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate("author");
    if (!post) throw new AppError(400, "Bad Request", "Get all post error");

    sendResponse(
      res,
      200,
      true,
      { post, totalPage, count },
      null,
      "Get All Post Succesful"
    );
  } catch (error) {
    next(error);
  }
};
postControllers.deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    const post = await Post.findOneAndUpdate(
      {
        _id: id,
        author: userId,
      },
      { isDeleted: true },
      { new: true }
    );
    if (!post) throw new AppError(400, "Bad Request", "Delete post error");

    await calculatorPostCount(userId);
  } catch (error) {
    next(error);
  }
};

postControllers.getCommentsOfPost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const post = await Post.findById(postId);
    if (!post)
      throw new AppError(400, "Bad Request", "Get comments of post error");

    const count = await Comment.countDocuments({ post: postId });
    const totalPage = Math.ceil(count / limit);
    const offset = limit * (page - 1);

    const comments = await Comment.find({ post: postId })
      .sort({
        createdAt: -1,
      })
      .skip(offset)
      .limit(limit)
      .populate("author");

    sendResponse(
      res,
      200,
      true,
      { comments, totalPage, count },
      null,
      "Get comments of post successful"
    );
  } catch (error) {
    next(error);
  }
};
module.exports = postControllers;
