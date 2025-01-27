
const Comment = require('../models/comment');
const User = require('../models/user'); // Make sure to include the User model
const Post = require('../models/post'); // Make sure to include the Post model


exports.addComment = async (req, res) => {
  const userId = req.session.userId; // Use session-based user ID
  const postId = req.params.postId;
  const { content } = req.body;

  try {
      // Create the comment in the database
      const comment = await Comment.create({ postId, userId, content });

      // Find the user who posted the comment
      const user = await User.findByPk(userId);

      // Find the post that the comment belongs to (to check if the user is the post owner)
      const post = await Post.findByPk(postId);

      // Send back the newly created comment, the user's username, and ownership flags
      res.json({
          success: true,
          content: comment.content,
          username: user.username,
          commentId: comment.id, // Send the comment ID
          isOwner: comment.userId === userId, // Check if the current user is the comment owner
          isPostOwner: post.userId === userId // Check if the current user is the post owner
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to add comment' });
  }
};
// Delete a comment from a post
exports.deleteComment = async (req, res) => {
  const userId = req.session.userId; // Get the user ID from the session
  const commentId = req.params.commentId; // Get the comment ID from the route parameter
  try {
      // Fetch comment by ID with associated Post
      const comment = await Comment.findOne({
        where: { id: commentId },
        include: [{
          model: Post,
          as: 'post'  // Make sure to use the alias here
        }]
      });
  
      // If the comment does not exist, return an error
      if (!comment) {
          return res.status(404).json({ error: 'Comment not found' });
      }

      // Check if the user is the one who made the comment or if it's their post
      if (comment.userId !== userId && comment.post.userId !== userId) {
          return res.status(403).json({ error: 'You cannot delete this comment' });
      }

      // Delete the comment
      await comment.destroy();

      // Respond with success
      res.json({success: true});
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete comment' });
  }
}