const User = require("../models/User");
const Friend = require("../models/Friend");
const { AppError, sendResponse } = require("../helpers/utils");
const bcrypt = require("bcryptjs");
const userControllers = {};

userControllers.register = async (req, res, next) => {
  try {
    //Get data from request
    let { name, password, email } = req.body;
    //Validation
    let user = await User.findOne({ email });
    if (user)
      throw new AppError(400, "User already exists", "Resgistration Error");
    //Process
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);
    user = await User.create({ name, password, email });
    const accessToken = await user.generateToken();
    //Response
    sendResponse(
      res,
      200,
      true,
      { user, accessToken },
      null,
      "Register Successful"
    );
  } catch (error) {
    next(error);
  }
};
userControllers.getUsers = async (req, res, next) => {
  try {
    const { userId } = req;
    let { page, limit, ...filter } = { ...req.query };

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    const filterConditions = [{ isDeleted: false }];
    if (filter.name) {
      filterConditions.push({
        name: { $regex: filter.name, $options: "i" },
      });
    }
    const filterCriteria = filterConditions.length
      ? { $and: filterConditions }
      : {};
    const count = await User.countDocuments(filterCriteria);
    const totalPage = Math.ceil(count / limit);
    const offset = limit * (page - 1);

    const user = await User.find(filterCriteria)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);
    if (!user) throw new AppError(400, "Bad Request", "Get all user error");

    const promises = user.map(async (user) => {
      let temp = user.toJSON();
      temp.friendship = await Friend.findOne({
        $or: [
          { from: userId, to: user._id },
          { from: user._id, to: userId },
        ],
      });
      return temp;
    });

    const userWithFriendShip = await Promise.all(promises);
    sendResponse(
      res,
      200,
      true,
      { users: userWithFriendShip, totalPage, count },
      null,
      "Get All User Succesful"
    );
  } catch (error) {
    next(error);
  }
};
userControllers.getCurrentUser = async (req, res, next) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId);
    if (!user) throw new AppError(400, "Bad Request", "Get current user error");
    sendResponse(res, 200, true, user, null, "Get Current User Succesful");
  } catch (error) {
    next(error);
  }
};
userControllers.getSingleUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    let user = await User.findById(id);
    if (!user) throw new AppError(400, "Bad Request", "Get single user error");
    user = user.toJSON();
    user.friendship = await Friend.findOne({
      $or: [
        { from: userId, to: user._id },
        { from: user._id, to: userId },
      ],
    });
    sendResponse(res, 200, true, user, null, "Get Single User Succesful");
  } catch (error) {
    next(error);
  }
};
userControllers.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    if (userId !== id)
      throw new AppError(400, "Permission required", "Update user error");

    let user = await User.findById(id);
    if (!user) throw new AppError(400, "Bad Request", "Update user error");

    const allows = [
      "name",
      "avatarUrl",
      "coverUrl",
      "aboutMe",
      "city",
      "country",
      "company",
      "jobTitle",
      "facebookLink",
      "instagramLink",
      "linkedinLink",
      "twitterLink",
    ];

    allows.forEach((field) => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });
    await user.save();

    sendResponse(res, 200, true, user, null, "Update User Succesful");
  } catch (error) {
    next(error);
  }
};

module.exports = userControllers;
