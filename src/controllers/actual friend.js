const FriendRequest = require('../models/friendRequest');
const Friendship = require('../models/friendship');
const BlockList = require('../models/blockList');
const User = require('../models/user')
const Message = require('../models/message'); // Assuming a Message model exists
const { Op } = require('sequelize');

// Send friend request
exports.sendFriendRequest = async (req, res) => {
    const userId = req.session.userId; // Get the logged-in user's ID from session
    const receiverId = req.body.receiverId; // Get the receiver's ID from the request body

    try {
        // Check if a pending friend request already exists between the two users
        const existingRequest = await FriendRequest.findOne({
            where: {
                sender_id: userId, // The current user is the sender
                receiver_id: receiverId, // The target user is the receiver
                status: 'pending' // Only check for pending requests
            }
        });

        // If no existing pending request, create a new friend request
        if (!existingRequest) {
            await FriendRequest.create({
                sender_id: userId,
                receiver_id: receiverId,
                status: 'pending' // Set the request status to pending
            });
        }

        res.redirect('/dashboard'); // Redirect to dashboard after sending the request
    } catch (err) {
        res.status(500).send({ message: 'Error sending friend request' }); // Error handling
    }
};


// Accept friend request
exports.acceptFriendRequest = async (req, res) => {
    const userId = req.session.userId; // Get the logged-in user's ID from session
    const requestId = req.params.id; // Get the request ID from the URL parameters
console.log(userId,requestId );
    try {
        // Find the specific friend request by its ID
        const friendRequest = await FriendRequest.findByPk(requestId);
        
        // Ensure the request exists and the logged-in user is the receiver of the request
        if (friendRequest && friendRequest.receiver_id === userId && friendRequest.status === 'pending') {
            // Update the request status to 'accepted'
            await FriendRequest.update(
                { status: 'accepted' },
                { where: { id: requestId } }
            );

            // Check if the friendship already exists
            const existingFriendship = await Friendship.findOne({
                where: {
                    [Op.or]: [
                        { user_id: userId, friend_id: friendRequest.sender_id },
                        { user_id: friendRequest.sender_id, friend_id: userId }
                    ]
                }
            });

            // If no existing friendship, create a new one for both users
            if (!existingFriendship) {
                await Friendship.create({
                    user_id: userId, // The logged-in user becomes user1
                    friend_id: friendRequest.sender_id // The sender of the request becomes user2
                });
            }

            res.redirect('/dashboard'); // Redirect to dashboard after accepting the request
        } else {
            res.status(400).send({ message: 'Invalid request' }); // Handle invalid request scenario
        }
    } catch (err) {
        res.status(500).send({ message: 'Error accepting friend request' }); // Error handling
    }
};
// Reject friend request
exports.rejectFriendRequest = async (req, res) => {
    const userId = req.session.userId; // Get the logged-in user's ID from session
    const requestId = req.params.id; // Get the request ID from the URL parameters

    try {
        // Find the specific friend request by its ID
        const friendRequest = await FriendRequest.findByPk(requestId);
        
        // Ensure the request exists and the logged-in user is the receiver of the request
        if (friendRequest && friendRequest.receiver_id === userId && friendRequest.status === 'pending') {
            // Delete the friend request (reject it)
            await FriendRequest.destroy({ where: { id: requestId } });

            res.redirect('/dashboard'); // Redirect to dashboard after rejecting the request
        } else {
            res.status(400).send({ message: 'Invalid request' }); // Handle invalid request scenario
        }
    } catch (err) {
        res.status(500).send({ message: 'Error rejecting friend request' }); // Error handling
    }
};
// Undo Friend Request (Cancel Sent Request)
exports.undoFriendRequest = async (req, res) => {
    const userId = req.session.userId; // Get the logged-in user's ID from session
    const receiverId = req.body.receiverId; // Get receiver ID from the form body in ejs

    console.log('Receiver ID:', receiverId);  // Log to check if receiverId is being passed

    try {
        // Ensure receiverId is provided
        if (!receiverId) {
            return res.status(400).send('Receiver ID is required');
        }

        // Find and delete the sent friend request
        const friendRequest = await FriendRequest.findOne({
            where: {
                sender_id: userId,
                receiver_id: receiverId,
                status: 'pending'
            }
        });

        if (friendRequest) {
            // Delete the request if it exists
            await friendRequest.destroy();
        }

        // Redirect to dashboard after undoing request
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error undoing friend request');
    }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Block User
exports.blockUser = async (req, res) => {
    const userId = req.session.userId; // Get the logged-in user's ID from the session
    const userIdToBlock = req.body.userIdToBlock; // Get the ID of the user to block

    try {
        // Block the user
        await BlockList.create({
            blocked_by_id: userId,
            blocked_whom_id: userIdToBlock
        });

        // Remove friendship if it exists
        await Friendship.destroy({
            where: {
                [Op.or]: [
                    { user_id: userId, friend_id: userIdToBlock },
                    { user_id: userIdToBlock, friend_id: userId }
                ]
            }
        });

        // Remove any incoming friend requests from the blocked user
        await FriendRequest.destroy({
            where: {
                [Op.or]: [
                    { sender_id: userIdToBlock, receiver_id: userId },
                    { sender_id: userId, receiver_id: userIdToBlock }
                ]
            }
        });
         // Remove any messages between the users (you should have a message model in your database)
         await Message.destroy({
            where: {
                [Op.or]: [
                    { sender_id: userId, receiver_id: userIdToBlock },
                    { sender_id: userIdToBlock, receiver_id: userId }
                ]
            }
        });

        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error blocking user');
    }
};

// Unblock User
exports.unblockUser = async (req, res) => {
    const userId = req.session.userId;
    const blockedUserId = req.body.blockedId;

    try {
        // Remove the user from the block list
        await BlockList.destroy({
            where: {
                blocked_by_id: userId,
                blocked_whom_id: blockedUserId
            }
        });

        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error unblocking user');
    }
};


// Render the friends list page
exports.getFriendsList = async (req, res) => {
    const userId = req.session.userId;  // Get the logged-in user's ID from session
// Get the current user’s details, including the profilePic
    const currentUserDetails = await User.findOne({
        where: {
            id: userId
        },
        attributes: ['id', 'username', 'profilePic'] // Include profilePic
    });


    try {
        // Retrieve all friendships where the current user is either user_id or friend_id
        const friendships = await Friendship.findAll({
            where: {
                [Op.or]: [
                    { user_id: userId },
                    { friend_id: userId }
                ]
            }
        });

        // Get the list of friends (either user_id or friend_id should not be the logged-in user)
        const friends = friendships.map(friendship => 
            friendship.user_id === userId ? friendship.friend_id : friendship.user_id
        );

        // Assuming you have a User model to get the details of each friend
        const friendDetails = await User.findAll({
            where: {
                id: {
                    [Op.in]: friends
                }
            },
            attributes: ['id', 'username', 'profilePic'] // Assuming these fields exist
        });

        // Render friends page with the friend details
        res.render('myFriends', { friends: friendDetails,  currentUser: currentUserDetails});
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving friends');
    }
};
