const User = require("../models/User");
const Friend = require("../models/Friend");
const { AppError, sendResponse } = require("../helpers/utils");

const friendControllers = {};

const calculatorFriendCount = async (userId) => {
  const friendCount = await Friend.countDocuments({
    $or: [{ from: userId }, { to: userId }],
    status: "accepted",
  });
  await User.findByIdAndUpdate(userId, { friendCount: friendCount });
};

friendControllers.sendRequest = async (req, res, next) => {
  try {
    const { userId } = req;
    const toUserId = req.body.to;

    const user = await User.findById(userId);
    if (!user)
      throw new AppError(400, "Bad Request", "Send friend request error");

    let friend = await Friend.findOne({
      $or: [
        { from: toUserId, to: userId },
        { from: userId, to: toUserId },
      ],
    });
    if (!friend) {
      //Create friend request
      friend = await Friend.create({
        from: userId,
        to: toUserId,
        status: "pending",
      });
      return sendResponse(
        res,
        200,
        true,
        friend,
        null,
        "Request has been sent"
      );
    } else {
      switch (friend.status) {
        //status === pending => error: already sent
        case "pending":
          if (friend.from.equals(userId)) {
            throw new AppError(
              400,
              "You have already sent a request to this user",
              "Add friend error"
            );
          } else {
            throw new AppError(
              400,
              "You have received a request from this user",
              "Add friend error"
            );
          }
        //status === accepted => error: already friend
        case "accepted":
          throw new AppError(
            400,
            "Users are already friend",
            "Add friend error"
          );
        //status === declined => update status to pending
        case "declined":
          friend.from = userId;
          friend.to = toUserId;
          friend.status = "pending";
          friend.updatedAt = new Date();
          await friend.save();
          return sendResponse(
            res,
            200,
            true,
            friend,
            null,
            "Request has been sent"
          );

        default:
          throw new AppError(
            400,
            "Friend status undefined",
            "Add friend error"
          );
      }
    }
  } catch (error) {
    next(error);
  }
};
friendControllers.getReceivedFriendRequestList = async (req, res, next) => {
  try {
    let { page, limit, ...filter } = { ...req.query };
    const { userId } = req;

    let requestList = await Friend.find({
      to: userId,
      status: "pending",
    });
    const requestIDs = requestList.map((request) => {
      if (request.from._id.equals(userId)) return request.to;
      return request.from;
    });

    const filterConditions = [{ _id: { $in: requestIDs } }];
    if (filter.name) {
      filterConditions.push({
        ["name"]: { $regex: filter.name, $options: "i" },
      });
    }

    const filterCriteria = filterConditions.length
      ? { $and: filterConditions }
      : {};

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const count = await User.countDocuments(filterCriteria);
    const totalPage = Math.ceil(count / page);
    const offset = limit * (page - 1);

    const users = await User.find(filterCriteria)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

    const usersWithFriendship = users.map((user) => {
      let temp = user.toJSON();
      temp.friendship = requestList.find((friendship) => {
        if (
          friendship.from.equals(user._id) ||
          friendship.to.equals(user._id)
        ) {
          return { status: friendship.status };
        }
        return false;
      });
      return temp;
    });
    sendResponse(
      res,
      200,
      true,
      { users: usersWithFriendship, totalPage, count },
      null,
      null
    );
  } catch (error) {
    next(error);
  }
};
friendControllers.getSentFriendRequestList = async (req, res, next) => {
  try {
    let { page, limit, ...filter } = { ...req.query };
    const { userId } = req;

    let requestList = await Friend.find({
      from: userId,
      status: "pending",
    });
    const recipientIDs = requestList.map((request) => {
      if (request.from._id.equals(userId)) return request.to;
      return request.from;
    });

    const filterConditions = [{ _id: { $in: recipientIDs } }];
    if (filter.name) {
      filterConditions.push({
        ["name"]: { $regex: filter.name, $options: "i" },
      });
    }

    const filterCriteria = filterConditions.length
      ? { $and: filterConditions }
      : {};

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const count = await User.countDocuments(filterCriteria);
    const totalPage = Math.ceil(count / page);
    const offset = limit * (page - 1);

    const users = await User.find(filterCriteria)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

    const usersWithFriendship = users.map((user) => {
      let temp = user.toJSON();
      temp.friendship = requestList.find((friendship) => {
        if (
          friendship.from.equals(user._id) ||
          friendship.to.equals(user._id)
        ) {
          return { status: friendship.status };
        }
        return false;
      });
      return temp;
    });
    sendResponse(
      res,
      200,
      true,
      { users: usersWithFriendship, totalPage, count },
      null,
      null
    );
  } catch (error) {
    next(error);
  }
};
friendControllers.getFriendList = async (req, res, next) => {
  try {
    let { page, limit, ...filter } = { ...req.query };
    const { userId } = req;

    let friendList = await Friend.find({
      $or: [{ from: userId }, { to: userId }],
      status: "accepted",
    });
    const friendIDs = friendList.map((friend) => {
      if (friend.from._id.equals(userId)) return friend.to;
      return friend.from;
    });

    const filterConditions = [{ _id: { $in: friendIDs } }];
    if (filter.name) {
      filterConditions.push({
        ["name"]: { $regex: filter.name, $options: "i" },
      });
    }

    const filterCriteria = filterConditions.length
      ? { $and: filterConditions }
      : {};

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const count = await User.countDocuments(filterCriteria);
    const totalPage = Math.ceil(count / page);
    const offset = limit * (page - 1);

    const users = await User.find(filterCriteria)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

    const usersWithFriendship = users.map((user) => {
      let temp = user.toJSON();
      temp.friendship = friendList.find((friendship) => {
        if (
          friendship.from.equals(user._id) ||
          friendship.to.equals(user._id)
        ) {
          return { status: friendship.status };
        }
        return false;
      });
      return temp;
    });

    sendResponse(
      res,
      200,
      true,
      { users: usersWithFriendship, totalPage, count },
      null,
      "Get list friends successful"
    );
  } catch (error) {
    next(error);
  }
};
friendControllers.reactionFriendRequest = async (req, res, next) => {
  try {
    const { userId } = req;
    const fromUserId = req.params.userId;
    const { status } = req.body;

    let friend = await Friend.findOne({
      from: fromUserId,
      to: userId,
      status: "pending",
    });
    if (!friend)
      throw new AppError(
        400,
        "Friend request not found",
        "Reaction reques error"
      );
    friend.status = status;
    await friend.save();

    if (status === "accepted") {
      await calculatorFriendCount(userId);
      await calculatorFriendCount(fromUserId);
    }

    sendResponse(res, 200, true, friend, null, "Reaction request successful");
  } catch (error) {
    next(error);
  }
};
friendControllers.cancelFriendRequest = async (req, res, next) => {
  try {
    const { userId } = req;
    const toUserId = req.params.userId;

    const friend = await Friend.findOne({
      from: userId,
      to: toUserId,
      status: "pending",
    });

    if (!friend)
      throw new AppError(
        400,
        "Friend request not found",
        "Cancel request error"
      );

    await Friend.deleteOne({
      from: userId,
      to: toUserId,
      status: "pending",
    });

    sendResponse(
      res,
      200,
      true,
      friend,
      null,
      "Friend request has been cancelled"
    );
  } catch (error) {
    next(error);
  }
};
friendControllers.deleteFriendRequest = async (req, res, next) => {
  try {
    const { userId } = req;
    const friendId = req.params.userId;

    const friend = await Friend.findOne({
      $or: [
        { from: userId, to: friendId },
        { from: friendId, to: userId },
      ],
      status: "accepted",
    });
    if (!friend)
      throw new AppError(400, "Friend not found", "Delete friend error");

    await friend.deleteOne();
    await calculatorFriendCount(userId);
    await calculatorFriendCount(friendId);

    sendResponse(res, 200, true, friend, null, "Delete friend successful");
  } catch (error) {
    next(error);
  }
};
module.exports = friendControllers;
