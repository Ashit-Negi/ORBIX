const prisma = require("../config/db");

// TOGGLE COMMENT LIKE
exports.toggleCommentLike = async (req, res) => {
  try {
    const { commentId } = req.body;

    // SOCKET IO
    const io = req.app.get("io");

    // FIND COMMENT
    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
    });

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    // CHECK EXISTING LIKE
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId: req.user.userId,
          commentId,
        },
      },
    });

    // REMOVE LIKE
    if (existingLike) {
      await prisma.commentLike.delete({
        where: {
          id: existingLike.id,
        },
      });

      // GET UPDATED COMMENT
      const updatedComment = await prisma.comment.findUnique({
        where: {
          id: commentId,
        },

        include: {
          likes: true,
        },
      });

      // REALTIME
      io.emit("comment-liked", {
        commentId,
        postId: comment.postId,
        likes: updatedComment.likes,
      });

      return res.status(200).json({
        message: "Like removed",
      });
    }

    // CREATE LIKE
    await prisma.commentLike.create({
      data: {
        userId: req.user.userId,
        commentId,
      },
    });

    // GET UPDATED COMMENT
    const updatedComment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },

      include: {
        likes: true,
      },
    });

    // REALTIME
    io.emit("comment-liked", {
      commentId,
      postId: comment.postId,
      likes: updatedComment.likes,
    });

    res.status(201).json({
      message: "Comment liked",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
