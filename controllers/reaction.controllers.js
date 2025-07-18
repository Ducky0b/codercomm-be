const { default: mongoose } = require("mongoose");
const { sendResponse, AppError } = require("../helpers/utils");
const Reaction = require("../models/Reaction");

const reactionControllers = {};

const calculatorReactions = async (targetType, targetId) => {
  const stats = await Reaction.aggregate([
    {
      $match: { targetId: new mongoose.Types.ObjectId(targetId) },
    },
    {
      $group: {
        _id: "$targetId",
        like: {
          $sum: {
            $cond: [{ $eq: ["$emoji", "like"] }, 1, 0],
          },
        },
        dislike: {
          $sum: {
            $cond: [{ $eq: ["$emoji", "dislike"] }, 1, 0],
          },
        },
      },
    },
  ]);
  const reactions = {
    like: (stats[0] && stats[0].like) || 0,
    dislike: (stats[0] && stats[0].dislike) || 0,
  };

  await mongoose.model(targetType).findByIdAndUpdate(targetId, { reactions });
  return reactions;
};

reactionControllers.saveReaction = async (req, res, next) => {
  try {
    const { targetType, targetId, emoji } = req.body;
    const { userId } = req;

    const targetObj = await mongoose.model(targetType).findById(targetId);
    if (!targetObj)
      throw new AppError(
        400,
        `${targetType} not found`,
        "Create reaction error"
      );
    //Find the reaction if exists
    let reaction = await Reaction.findOne({
      targetType,
      targetId,
      author: userId,
    });
    //If there is no reaction in the DB -> create new reaction
    if (!reaction) {
      reaction = await Reaction.create({
        targetType,
        targetId,
        author: userId,
        emoji,
      });
    } else {
      //If there is a previous reaction in the DB -> compare the emojis
      if (reaction.emoji === emoji) {
        //If they are the same -> delete the reaction
        await reaction.deleteOne();
      } else {
        //If they are different -> update the reaction
        reaction.emoji = emoji;
        await reaction.save();
      }
    }

    const reactions = await calculatorReactions(targetType, targetId);

    sendResponse(res, 200, true, reactions, null, "Save reaction succesful");
  } catch (error) {
    next(error);
  }
};

module.exports = reactionControllers;
