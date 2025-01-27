const User = require('./user');
const Post = require('./post');
const Comment = require('./comment');
const PostLikes = require('./postLikes');
const FriendRequest = require('./friendRequest');
const Friendship = require('./friendship');
const BlockList = require('./blockList');

//////////////////////////////////////////////////////////////////////////////
// Associations

// User Associations
User.hasMany(FriendRequest, { foreignKey: 'sender_id', as: 'sentRequests' });
User.hasMany(FriendRequest, { foreignKey: 'receiver_id', as: 'receivedRequests' });
User.hasMany(Friendship, { foreignKey: 'user_id', as: 'friendships' });
User.hasMany(Friendship, { foreignKey: 'friend_id', as: 'friends' });
User.hasMany(BlockList, { foreignKey: 'blocked_by_id', as: 'blocker' });
User.hasMany(BlockList, { foreignKey: 'blocked_whom_id', as: 'blocked' });
User.hasMany(Post, { foreignKey: 'userId', as: 'posts' });
User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });

// FriendRequest Associations
FriendRequest.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
FriendRequest.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });

// Friendship Associations
Friendship.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Friendship.belongsTo(User, { foreignKey: 'friend_id', as: 'friend' });

// BlockList Associations
BlockList.belongsTo(User, { foreignKey: 'blocked_by_id', as: 'blocked' });
BlockList.belongsTo(User, { foreignKey: 'blocked_whom_id', as: 'blocked_by' });

// Post Associations
Post.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Post.hasMany(Comment, { 
  foreignKey: 'postId', 
  as: 'comments', 
  onDelete: 'CASCADE' // Ensures comments are deleted when a post is deleted
});
Post.hasMany(PostLikes, { 
  foreignKey: 'postId', 
  as: 'likes', 
  onDelete: 'CASCADE' // Ensures likes are deleted when a post is deleted
});
Post.belongsToMany(User, { 
  through: PostLikes, 
  foreignKey: 'postId', 
  as: 'likedBy' // Alias for the relationship
});
PostLikes.belongsTo(Post, { foreignKey: 'postId' });

// Comment Associations
Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

// User Associations (Post Likes)
PostLikes.belongsTo(User, { foreignKey: 'userId' });
User.belongsToMany(Post, { through: PostLikes, foreignKey: 'userId', as: 'likedPosts' });

module.exports = () => {
  // Associations are loaded in this file after the models are defined
};
