const Message = require('../models/message'); // Assuming you have a Message model
const User = require('../models/user'); // User model to fetch user details
const { Op } = require('sequelize');

// Get messages between the current user and a friend
exports.getMessages = async (req, res) => {
    const userId = req.session.userId;
    const friendId = req.params.friendId;

    try {
        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { sender_id: userId, receiver_id: friendId }, // Use snake_case
                    { sender_id: friendId, receiver_id: userId }  // Use snake_case
                ]
            },
            order: [['createdAt', 'ASC']]
        });

        const friend = await User.findByPk(friendId);
        res.render('message', { messages, friend, currentUser:  { id: userId } });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching messages');
    }
};

// Send a message
exports.sendMessage = async (req, res) => {
    const senderId = req.session.userId;
    const receiverId = req.params.friendId;
    const { message } = req.body;

    console.log("Message received:", message); // Log the message

    // Check if the message is empty
    if (!message || message.trim() === '') {
        return res.status(400).send('Message cannot be empty');
    }

    try {
        await Message.create({
            sender_id: senderId,
            receiver_id: receiverId,
            message: message // Ensure this matches the model field name
        });
        res.redirect(`/messages/${receiverId}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error sending message');
    }
};
