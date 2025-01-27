const FriendRequest = require('../models/friendRequest');
const Friendship = require('../models/friendship');
const BlockList = require('../models/blockList');
const User = require('../models/user');
const { Op } = require('sequelize');

// Send Friend Request
exports.sendFriendRequest = async (req, res) => {
    const userId = req.session.userId;
    const receiverId = req.body.receiverId;

    try {
        const existingRequest = await FriendRequest.findOne({
            where: {
                sender_id: userId,
                receiver_id: receiverId,
                status: 'pending'
            }
        });

        if (!existingRequest) {
            await FriendRequest.create({
                sender_id: userId,
                receiver_id: receiverId,
                status: 'pending'
            });
        }

       
        res.status(204).send();  // HTTP status 204 ka matlab  "No Content" (no response body)

    } catch (err) {
        res.status(500).json({ success: false, message: 'Error sending friend request' });
    }
};

// Accept Friend Request
exports.acceptFriendRequest = async (req, res) => {
    const userId = req.session.userId;
    const requestId = req.params.id;

    try {
        const friendRequest = await FriendRequest.findByPk(requestId);

        if (friendRequest && friendRequest.receiver_id === userId && friendRequest.status === 'pending') {
            await FriendRequest.update(
                { status: 'accepted' },
                { where: { id: requestId } }
            );

            const existingFriendship = await Friendship.findOne({
                where: {
                    [Op.or]: [
                        { user_id: userId, friend_id: friendRequest.sender_id },
                        { user_id: friendRequest.sender_id, friend_id: userId }
                    ]
                }
            });

            if (!existingFriendship) {
                await Friendship.create({
                    user_id: userId,
                    friend_id: friendRequest.sender_id
                });
            }

            res.status(204).send();  
        } else {
            res.status(400).json({ success: false, message: 'Invalid request' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error accepting friend request' });
    }
};

// Reject Friend Request
exports.rejectFriendRequest = async (req, res) => {
    const userId = req.session.userId;
    const requestId = req.params.id;

    try {
        const friendRequest = await FriendRequest.findByPk(requestId);

        if (friendRequest && friendRequest.receiver_id === userId && friendRequest.status === 'pending') {
            await FriendRequest.destroy({ where: { id: requestId } });
            res.status(204).send(); 
        } else {
            res.status(400).json({ success: false, message: 'Invalid request' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error rejecting friend request' });
    }
};

// Undo Friend Request
exports.undoFriendRequest = async (req, res) => {
    const userId = req.session.userId;
    const receiverId = req.body.receiverId;

    try {
        const friendRequest = await FriendRequest.findOne({
            where: {
                sender_id: userId,
                receiver_id: receiverId,
                status: 'pending'
            }
        });

        if (friendRequest) {
            await friendRequest.destroy();
            res.status(204).send();  
        } else {
            res.status(400).json({ success: false, message: 'No pending request found' });
        }

    } catch (err) {
        res.status(500).json({ success: false, message: 'Error undoing friend request' });
    }
};

// Block User
exports.blockUser = async (req, res) => {
    const userId = req.session.userId;
    const userIdToBlock = req.body.userIdToBlock;

    try {
        await BlockList.create({
            blocked_by_id: userId,
            blocked_whom_id: userIdToBlock
        });

        await Friendship.destroy({
            where: {
                [Op.or]: [
                    { user_id: userId, friend_id: userIdToBlock },
                    { user_id: userIdToBlock, friend_id: userId }
                ]
            }
        });

        await FriendRequest.destroy({
            where: {
                [Op.or]: [
                    { sender_id: userIdToBlock, receiver_id: userId },
                    { sender_id: userId, receiver_id: userIdToBlock }
                ]
            }
        });

        res.status(204).send(); 
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error blocking user' });
    }
};

// Unblock User
exports.unblockUser = async (req, res) => {
    const userId = req.session.userId;
    const blockedUserId = req.body.blockedId;  // Fixed variable name error

    try {
        await BlockList.destroy({
            where: {
                blocked_by_id: userId,
                blocked_whom_id: blockedUserId  // Fixed variable name error
            }
        });

        res.status(204).send(); 
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error unblocking user' });
    }
};

// Render the friends list page
exports.getFriendsList = async (req, res) => {
    const userId = req.session.userId;

    try {
        const currentUserDetails = await User.findOne({  // Fixed variable name error
            where: { id: userId },
            attributes: ['id', 'username', 'profilePic']
        });

        const friendships = await Friendship.findAll({
            where: {
                [Op.or]: [
                    { user_id: userId },
                    { friend_id: userId }
                ]
            }
        });

        const friends = friendships.map(friendship =>
            friendship.user_id === userId ? friendship.friend_id : friendship.user_id
        );

        const friendDetails = await User.findAll({
            where: { id: { [Op.in]: friends } },
            attributes: ['id', 'username', 'profilePic']
        });

        res.render('myFriends', { friends: friendDetails, currentUser:currentUserDetails });  
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving friends');
    }
};
