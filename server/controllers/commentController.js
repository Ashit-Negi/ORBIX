const prisma = require("../config/db");

// CREATE COMMENT
exports.createComment = async (req, res) => {
  try {
    const { content, postId, parentId } = req.body;

    if (!content || !postId) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        parentId: parentId || null,
        authorId: req.user.userId,
      },

      include: {
        author: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },

        likes: true,

        replies: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                image: true,
              },
            },

            likes: true,
          },
        },
      },
    });

    // SOCKET IO
    const io = req.app.get("io");

    // REALTIME
    io.emit("new-comment", {
      ...comment,
      postId,
    });

    res.status(201).json({
      message: "Comment created",
      comment,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET COMMENTS BY POST
exports.getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;

    // SORT QUERY
    const sort = req.query.sort || "newest";

    let orderBy = {
      createdAt: "desc",
    };

    // OLDEST FIRST
    if (sort === "oldest") {
      orderBy = {
        createdAt: "asc",
      };
    }

    let comments = await prisma.comment.findMany({
      where: {
        postId,
        parentId: null,
      },

      include: {
        author: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },

        likes: true,

        replies: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                image: true,
              },
            },

            likes: true,
          },

          orderBy: {
            createdAt: "asc",
          },
        },
      },

      orderBy,
    });

    // TOP COMMENTS
    if (sort === "top") {
      comments = comments.sort(
        (a, b) =>
          b.likes.length -
          a.likes.length,
      );
    }

    res.status(200).json(
      comments,
    );
  } catch (error) {
    res.status(500).json({
      message:
        error.message,
    });
  }
};

// UPDATE COMMENT
exports.updateComment = async (
  req,
  res,
) => {
  try {
    const { commentId } =
      req.params;

    const { content } =
      req.body;

    const existingComment =
      await prisma.comment.findUnique(
        {
          where: {
            id: commentId,
          },
        },
      );

    if (!existingComment) {
      return res
        .status(404)
        .json({
          message:
            "Comment not found",
        });
    }

    // OWNER CHECK
    if (
      existingComment.authorId !==
      req.user.userId
    ) {
      return res
        .status(403)
        .json({
          message:
            "Unauthorized",
        });
    }

    const updatedComment =
      await prisma.comment.update(
        {
          where: {
            id: commentId,
          },

          data: {
            content,
          },
        },
      );

    // SOCKET IO
    const io =
      req.app.get("io");

    // REALTIME
    io.emit(
      "comment-updated",
      {
        commentId,
        postId:
          existingComment.postId,
      },
    );

    res.status(200).json({
      message:
        "Comment updated",
      updatedComment,
    });
  } catch (error) {
    res.status(500).json({
      message:
        error.message,
    });
  }
};

// DELETE COMMENT
exports.deleteComment = async (
  req,
  res,
) => {
  try {
    const { commentId } =
      req.params;

    const existingComment =
      await prisma.comment.findUnique(
        {
          where: {
            id: commentId,
          },
        },
      );

    if (!existingComment) {
      return res
        .status(404)
        .json({
          message:
            "Comment not found",
        });
    }

    // OWNER CHECK
    if (
      existingComment.authorId !==
      req.user.userId
    ) {
      return res
        .status(403)
        .json({
          message:
            "Unauthorized",
        });
    }

    // FIND DIRECT REPLIES
    const replies =
      await prisma.comment.findMany(
        {
          where: {
            parentId:
              commentId,
          },
        },
      );

    // GET REPLY IDS
    const replyIds =
      replies.map(
        (reply) =>
          reply.id,
      );

    // DELETE REPLY LIKES
    await prisma.commentLike.deleteMany(
      {
        where: {
          commentId: {
            in: replyIds,
          },
        },
      },
    );

    // DELETE REPLIES
    await prisma.comment.deleteMany(
      {
        where: {
          parentId:
            commentId,
        },
      },
    );

    // DELETE MAIN COMMENT LIKES
    await prisma.commentLike.deleteMany(
      {
        where: {
          commentId,
        },
      },
    );

    // DELETE MAIN COMMENT
    await prisma.comment.delete(
      {
        where: {
          id: commentId,
        },
      },
    );

    // SOCKET IO
    const io =
      req.app.get("io");

    // REALTIME
    io.emit(
      "comment-deleted",
      {
        commentId,
        postId:
          existingComment.postId,
        deletedReplies:
          replyIds.length,
      },
    );

    res.status(200).json({
      message:
        "Comment deleted",
    });
  } catch (error) {
    res.status(500).json({
      message:
        error.message,
    });
  }
};