// Import required models and packages
const User = require('../models/user'); // User model for fetching user data
const FriendRequest = require('../models/friendRequest'); // FriendRequest model for managing friend requests
const Friendship = require('../models/friendship'); // Friendship model for managing friendships
const BlockList = require('../models/blockList'); // BlockList model for managing blocked users
const bcrypt = require('bcrypt'); // Package for password encryption
const { Op } = require('sequelize'); // Sequelize operators for database queries


// User's Directory k liye 
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll(); // Fetch all users from the database
        res.render('usersDirectory', { users }); // Render the userDirectory view with the users
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching users'); // Error handling if fetching users fails
    }
};

// Dashboard View - Displays the user's dashboard with all relevant data
exports.dashboard = async (req, res) => {
    try {
        const userId = req.session.userId; 
        const user = await User.findByPk(userId); 

        //  Get all the friend requests for the logged-in user
        // Fetch sent friend requests (requests initiated by the logged-in user)
        const sentRequests = await FriendRequest.findAll({
            where: { sender_id: userId, status: 'pending' }, // Get sent requests that are still pending
            include: [{ model: User, as: 'receiver' }] // Include the receiver data with each request
        });
        //all user k liye filtering karney k liye 
        const sentRequestIds = sentRequests.map(request => request.receiver_id); // Extract the receiver IDs from the sent requests

        // Fetch received friend requests (requests received by the logged-in user)
        const receivedRequests = await FriendRequest.findAll({
            where: { receiver_id: userId, status: 'pending' }, // Get received requests that are still pending
            include: [{ model: User, as: 'sender' }] // Include the sender data with each request
        });
        const receivedRequestIds = receivedRequests.map(request => request.sender_id); // Extract the sender IDs from the received requests

        // Get all the users blocked by the logged-in user
        const blockedUsers = await BlockList.findAll({
            where: { blocked_by_id: userId }, // Get users who have been blocked by the logged-in user
            include: [{ model: User, as: 'blocked_by' }] // Include the blocked user data
        });
        const blockedUserIds = blockedUsers.map(block => block.blocked_by.id); // Extract the IDs of the blocked users
        const blockedUsersList = blockedUsers.map(block => block.blocked_by); // Extract the full blocked user details

        //  Get all the users who have blocked the logged-in user
        const blockingUsers = await BlockList.findAll({
            where: { blocked_whom_id: userId }, // Get users who have blocked the logged-in user
            include: [{ model: User, as: 'blocked' }] // Include the user data who blocked the logged-in user
        });
        const blockingUserIds = blockingUsers.map(block => block.blocked.id); // Extract the IDs of users who have blocked the logged-in user

        //  Get all the friends of the logged-in user
        const friends = await Friendship.findAll({
            where: {
                [Op.or]: [{ user_id: userId }, { friend_id: userId }] // Fetch friendships where the logged-in user is involved
            },
            include: [
                { model: User, as: 'user' }, // Include the user data
                { model: User, as: 'friend' } // Include the friend data
            ]
        });

        // Extract the friend IDs (exclude the logged-in user)
        const friendIds = friends.map(friendship => {
            return friendship.user_id === userId ? friendship.friend_id : friendship.user_id;
        });

        // Filter the friends (excluding blocked users and the logged-in user)
        const filteredFriends = friends.map(friendship => {
            return friendship.user_id === userId ? friendship.friend : friendship.user;
        }).filter(friend => friend.id !== userId && !blockedUserIds.includes(friend.id)); // Only return friends who are not blocked

        //  Get all users excluding the logged-in user
        const allUsers = await User.findAll({
            where: {
                id: { [Op.ne]: userId } // Exclude the logged-in user from the list of all users
            }
        });

        //Filter out users who are friends, have sent/received requests, or are blocked
        const usersToDisplay = allUsers.filter(user => {
            return !friendIds.includes(user.id)  // Exclude friends
                && !sentRequestIds.includes(user.id)  // Exclude users who have received sent requests
                && !receivedRequestIds.includes(user.id) // Exclude users who have sent requests
                && !blockedUserIds.includes(user.id) // Exclude users who have been blocked
                && !blockingUserIds.includes(user.id); // Exclude users who have blocked the logged-in user
        });

        // Render the dashboard view, passing the collected data to the template for display
        res.render('dashboard', {
            currentUser: user, // Display current logged-in user's data
            allUsers: usersToDisplay, // Display list of all users (filtered)
            friends: filteredFriends, // Display the list of friends (filtered)
            blockedUsers: blockedUsersList, // Display the list of blocked users
            sentRequestsList: sentRequests, // Display sent friend requests
            incomingRequestsList: receivedRequests // Display received friend requests
        });
    } catch (error) {
        // Handle any errors that occur during the dashboard data retrieval
        console.error("Error in dashboard:", error);
        res.status(500).send('Error fetching dashboard data'); // Send error response if something goes wrong
    }
};


// Function to render the profile update form (GET request)
exports.renderUpdateProfile = async (req, res) => {
    const userId = req.session.userId;
    try {
        const user = await User.findByPk(userId);
        res.render('updateProfile', { currentUser: user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading profile page');
    }
};


// Update Profile
exports.updateProfile = async (req, res) => {
    const { username, age } = req.body;
    const userId = req.session.userId;

    try {
        const user = await User.findByPk(userId);

        if (username) {
            const existingUsername = await User.findOne({ where: { username, id: { [Op.ne]: userId } } });
            if (existingUsername) {
                return res.json({ success: false, error: 'Username is already taken. Please try a new one.' });
            }
            user.username = username; // Update username
        }

        if (age) user.age = age;
        if (req.file) user.profilePic = '/uploads/' + req.file.filename; // Update profilePic if new one is uploaded

        await user.save();
        res.json({ success: true, message: 'Profile updated successfully.', updatedUser: user }); // Return success message
    } catch (error) {
        console.error(error);
        res.json({ success: false, error: 'Error updating profile. Please try again.' }); // Return error message
    }
};

// Verify Current Password
exports.verifyCurrentPassword = async (req, res) => {
    const userId = req.session.userId;
    const { currentPassword } = req.body;

    try {
        const user = await User.findByPk(userId);
        const isMatch = await bcrypt.compare(currentPassword, user.password); // Compare the provided password with the stored hash

        if (isMatch) {
            return res.json({ success: true }); // Password is correct
        } else {
            return res.json({ success: false, error: 'Current password is incorrect.' }); // Password is incorrect
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Error verifying password.' });
    }
};


// Update Password
exports.updatePassword = async (req, res) => {
    const userId = req.session.userId; 
    const { password } = req.body; 

    try {
        const user = await User.findByPk(userId); 
        if (!user) {
            return res.status(404).json({ success: false, error: 'User  not found.' });
        }


      // Compare the new password with the old password
        const isSamePassword = await bcrypt.compare(password, user.password);
         if (isSamePassword) {
         return res.status(400).json({ success: false, error: 'Password is the same as the previous one. Please try a different password.' });
       }


        
        user.password = await bcrypt.hash(password, 10);
        await user.save();

        
        req.session.destroy(err => {
            if (err) {
                console.log('Error destroying session', err);
                return res.status(500).json({ success: false, error: 'Error logging out.' });
            }
           
       // json format m bhej diya maid id and message.
       return res.json({ success: true, message: 'Password updated successfully. Please log in again.', email: user.email });
        });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ success: false, error: 'Error updating password.' });
    }
};


