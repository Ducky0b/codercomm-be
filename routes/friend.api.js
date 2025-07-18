const express = require("express");
const router = express.Router();
const { loginRequired } = require("../middleware/authentication");
const validators = require("../middleware/validators");
const { body, param } = require("express-validator");
const {
  sendRequest,
  getReceivedFriendRequestList,
  getSentFriendRequestList,
  getFriendList,
  reactionFriendRequest,
  deleteFriendRequest,
  cancelFriendRequest,
} = require("../controllers/friend.controllers");
/**
 * @route POST /friends/requests
 * @description Send a friend request
 * @body {to: User ID}
 * @access Login Required
 */
router.post(
  "/requests",
  loginRequired,
  validators.validate([
    body("to").exists().isString().custom(validators.checkObjectId),
  ]),
  sendRequest
);
/**
 * @route GET /friends/requests/incoming
 * @description Get the list of received pending requests
 * @body
 * @access Login Required
 */
router.get("/requests/incoming", loginRequired, getReceivedFriendRequestList);
/**
 * @route GET /friends/requests/outgoing
 * @description Get the list of sent pending requests
 * @body
 * @access Login Required
 */
router.get("/requests/outgoing", loginRequired, getSentFriendRequestList);

/**
 * @route GET /friends
 * @description Get the list of friends
 * @body
 * @access Login Required
 */
router.get("/", loginRequired, getFriendList);
/**
 * @route PUT /friends/requests/:userId
 * @description Accept/Reject a received pending requests
 * @body { status : 'accepted' or 'declined' }
 * @access Login Required
 */
router.put(
  "/requests/:userId",
  loginRequired,
  validators.validate([
    param("userId").exists().isString().custom(validators.checkObjectId),
    body("status").exists().isString().isIn(["accepted", "declined"]),
  ]),
  reactionFriendRequest
);
/**
 * @route DELETE /friends/requests/:userId
 * @description Cancel a friend request
 * @body
 * @access Login Required
 */
router.delete(
  "/requests/:userId",
  loginRequired,
  validators.validate([
    param("userId").exists().isString().custom(validators.checkObjectId),
  ]),
  cancelFriendRequest
);
/**
 * @route DELETE /friends/requests/:userId
 * @description Remove a friend request
 * @body
 * @access Login Required
 */
router.delete(
  "/:userId",
  loginRequired,
  validators.validate([
    param("userId").exists().isString().custom(validators.checkObjectId),
  ]),
  deleteFriendRequest
);
module.exports = router;
