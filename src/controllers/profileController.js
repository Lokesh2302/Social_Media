const Post = require('../models/post'); // Post model to interact with posts in the database
const User = require('../models/user'); // User model to get user data
const Comment = require('../models/comment'); // Comment model to handle comments related to posts
const Friendship = require('../models/friendship'); // Friendship model to manage friendships between users
const PostLikes = require('../models/postLikes');
const BlockList = require('../models/blockList')
const moment = require('moment');  // Im
const { Op } = require('sequelize'); // Sequelize operators for querying the database

//Render the main profile page for a user (prfoile.ejs)
exports.getProfilePosts = async (req, res) => {
    const userId = req.params.id; // Get the userId from the route parameter
    const user = await User.findByPk(userId); // Fetch the current user's data from the database
    console.log('Requested profile for user:', userId);

    try {
        // Step 1: Get all friend IDs where the current user is the user_id
        const friendshipsAsUser  = await Friendship.findAll({
            where: {
                user_id: userId // Current user is the user in the friendship
            }
        });

        // Step 2: Get all friend IDs where the current user is the friend_id
        const friendshipsAsFriend = await Friendship.findAll({
            where: {
                friend_id: userId // Current user is the friend in the friendship
            }
        });

        // Step 3: Merge the two lists of friend IDs
        const friendIds = [
            ...friendshipsAsUser .map(friendship => friendship.friend_id), // Friends where current user is user_id
            ...friendshipsAsFriend.map(friendship => friendship.user_id)  // Friends where current user is friend_id
        ];

        // Log friend IDs to ensure correctness
        console.log('Friend IDs for userId', userId, friendIds);

        // Step 4: Fetch posts from both the user and their friends
        const posts = await Post.findAll({
            where: {
                userId: {
                    [Op.in]: [userId, ...friendIds] // Fetch posts of current user and their friends
                }
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['username', 'profilePic']
                },
                {
                    model: User,
                    as: 'likedBy',
                    attributes: ['id']
                },
                {
                    model: Comment,
                    as: 'comments',
                    include: [{
                        model: User,
                        as: 'user',
                        attributes: ['username']
                    }]
                }
            ],
            order: [['createdAt', 'DESC']] // Order posts by creation date descending
        });
/*...................*/
 // Function to check if a user is blocked by or has blocked another user
 const isBlocked = async (userId, targetUserId) => {
    const blockRecord = await BlockList.findOne({
        where: {
            [Op.or]: [
                { blocked_by_id: userId, blocked_whom_id: targetUserId }, // userId blocked targetUserId
                { blocked_by_id: targetUserId, blocked_whom_id: userId }  // targetUserId blocked userId
            ]
        }
    });
    return blockRecord !== null;  // Return true if there is a block relationship
};

// Filter comments to remove blocked users' comments
for (let post of posts) {
    const filteredComments = [];

    for (const comment of post.comments) {
        // Check if the logged-in user or the commented user is blocked
        const blocked = await isBlocked(userId, comment.userId);

        // Add the comment only if it's not blocked
        if (!blocked) {
            filteredComments.push(comment);
        }
    }

    post.comments = filteredComments;
}
/*...................*/
        // Calculate like counts and check if the current user liked the post
        posts.forEach(post => {
            post.likeCount = post.likedBy.length;
            post.likedByCurrentUser  = post.likedBy.some(user => user.id === req.session.userId);
        });

        // Render the profile with posts if there are any
        res.render('profile', { 
            posts, 
            currentUser :user,
            message: null,  // Reset the message when posts are found
            moment,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
};

//Render  create Post
exports.renderCreatePost = async(req,res)=>{
    const userId = req.session.userId;
    const user = await User.findByPk(userId);
    res.render('createPost', {currentUser: user})
}
// post request for creating Posts
exports.createPost = async (req, res) => {

    const userId = req.session.userId;
    const { caption } = req.body;


    const imageUrl = req.file ? '/uploads/' + req.file.filename : null;
 
    try
    {
    const newPost = await Post.create({
        userId: userId,
        imageUrl: imageUrl,
        caption: caption
    });

    res.redirect(`/profile/${userId}`); // Redirect to the user's profile after creating the post
} catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create post' });
}
};


// Like a post
exports.likePost = async (req, res) => {
    const userId = req.session.userId; // Use session-based user ID
    const postId = req.params.postId;
  
    try {
     
      const existingLike = await PostLikes.findOne({
        where: {
          userId: userId,
          postId: postId,
        },
      });
  
      if (existingLike) {
        
        await existingLike.destroy();
      } else {
        
        await PostLikes.create({
          userId: userId,
          postId: postId,
        });
      }

const post = await Post.findByPk(postId, {
    include: [
      {
        model: User,
        as: 'likedBy',
        attributes: ['id'],
      },
    ],
  });
  const likeCount = post.likedBy.length;
    const liked = post.likedBy.some(user => user.id === userId);

    
    res.json({
      liked: liked,
      likeCount: likeCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to like/unlike post' });
  }
};
  ///////////////////////////

  // Get "my posts"  ---> "CURRENT USER POSTS" posts
exports.getCurrentUserPosts = async (req, res) => {
    const userId = req.session.userId; // Get the logged-in user's ID from the session
    const user = await User.findByPk(userId); // Fetch the current user's data from the database
    
    try {
        // Fetch posts created by the current user (newest to oldest)
        const posts = await Post.findAll({
            where: { userId: userId },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['username', 'profilePic']
                },
                {
                    model: Comment,
                    as: 'comments',
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['username']
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']] // Order posts by creation date (newest first)
        });

        res.render('currentuserPosts', { posts, currentUser: user ,moment: moment,});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
};



// Render Edit Caption
exports.renderEditCaption = async (req, res) => {
    const postId = req.params.postId;
    const post = await Post.findByPk(postId); // Fetch the post to edit
    const user = await User.findByPk(req.session.userId); // Get the current user

    if (!post || post.userId !== req.session.userId) {
        return res.status(404).json({ error: 'Post not found or you are not authorized to edit this post' });
    }

    res.render('editCaption', { post, currentUser :user });
};

// Route to handle caption update
exports.updateCaption = async (req, res) => {
    const postId = req.params.postId;
    const { caption } = req.body;
    try {
        const post = await Post.findByPk(postId);

        if (!post || post.userId !== req.session.userId) {
            return res.status(404).json({ error: 'Post not found or you are not authorized to edit this post' });
        }
        console.log('Before update:', post.caption);
        // Update the caption
        post.caption = caption;
        await post.save();
        console.log('After update:', post.caption);
        res.redirect(`/profile/${req.session.userId}/myPosts`); // Redirect to the user's posts after updating the caption
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update caption' });
    }
};


// Delete a post
exports.deletePost = async (req, res) => {
    const postId = req.params.postId;
    const userId = req.session.userId; // Get the logged-in user's ID from session

    try {
        // Find the post by its ID
        const post = await Post.findByPk(postId);

        // Check if the post exists and if the logged-in user is the owner
        if (!post || post.userId !== userId) {
            return res.status(404).json({ error: 'Post not found or you are not authorized to delete this post' });
        }

        // Delete the post
        await post.destroy(); // This will also cascade and delete associated comments and likes

        // Redirect back to the user's profile page after deleting the post
        res.redirect(`/profile/${userId}/myPosts`);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete post' });
    }
};


// Fetch friend's profile and posts
exports.getFriendProfilePosts = async (req, res) => {
    const friendId = req.params.id; // Get the friend's user ID from the route parameter
    const currentUserId = req.session.userId; // Get the logged-in user's ID from the session

    // Fetch the friend data
    const friend = await User.findByPk(friendId);
    if (!friend) {
        return res.status(404).json({ error: 'Friend not found' });
    }

    // Fetch posts created by the friend
    const friendPosts = await Post.findAll({
        where: { userId: friendId },
        include: [
            {
                model: User,
                as: 'user',
                attributes: ['username', 'profilePic']
            },
            {
                                model: Comment,
                                as: 'comments',
                                include: [
                                    {
                                        model: User,
                                        as: 'user',
                                        attributes: ['username']
                                    }
                                ]
                            }
                        ],
                    
                        order: [['createdAt', 'DESC']]
                    });

    // Fetch current user details
    const currentUser  = await User.findByPk(currentUserId, {
        attributes: ['id', 'username', 'profilePic']
    });

    // Check if currentUser  is found
    if (!currentUser ) {
        return res.status(404).json({ error: 'Current user not found' });
    }

    // Render the friend's profile with their posts
    res.render('friendProfile', { friend, friendPosts, currentUser, moment:moment  });
};
   