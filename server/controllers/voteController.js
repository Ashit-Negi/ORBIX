const prisma = require("../config/db");
const sendNotification = require("../utils/sendNotification");
// VOTE POST
exports.votePost = async (req, res) => {
  try {
    const { postId, value } = req.body;

    const userId = req.user.userId;

    if (value !== 1) {
      return res.status(400).json({
        message: "Invalid value",
      });
    }

    const io = req.app.get("io");

    // CHECK EXISTING LIKE
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    let action = "liked";

    // UNLIKE
    if (existingVote) {
      await prisma.vote.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });

      action = "unliked";
    } else {
      // CREATE LIKE
      // CREATE LIKE
      await prisma.vote.create({
        data: {
          userId,
          postId,
          value: 1,
        },
      });

      // GET POST
      const post = await prisma.post.findUnique({
        where: {
          id: postId,
        },

        select: {
          authorId: true,
        },
      });

      // LIKE NOTIFICATION
      const io = req.app.get("io");

      await sendNotification({
        io,

        type: "POST_LIKE",

        senderId: userId,

        receiverId: post.authorId,

        postId,

        message: `${req.user.username} liked your post`,
      });
    }

    // GET UPDATED POST
    const updatedPost = await prisma.post.findUnique({
      where: {
        id: postId,
      },

      include: {
        votes: true,
      },
    });

    // REALTIME
    io.emit("post-liked", {
      postId,
      userId,
      action,
      votes: updatedPost.votes,
    });

    res.status(200).json({
      message: "Vote updated",
      votes: updatedPost.votes,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
