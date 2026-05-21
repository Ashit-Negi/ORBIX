const prisma = require("../config/db");

// CREATE POST
exports.createPost = async (req, res) => {
  try {
    const { title, content, communityId, type, imageUrl, visibility } =
      req.body;

    if (!title || !content) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // DEFAULT VISIBILITY
    let postVisibility = "PUBLIC";

    // CHECK COMMUNITY
    if (communityId) {
      const existingCommunity = await prisma.community.findUnique({
        where: {
          id: communityId,
        },
      });

      if (!existingCommunity) {
        return res.status(404).json({
          message: "Community not found",
        });
      }

      // ONLY CREATOR CAN POST
      if (existingCommunity.creatorId !== req.user.userId) {
        return res.status(403).json({
          message: "Only community admin can create posts",
        });
      }

      // COMMUNITY POSTS CAN HAVE VISIBILITY
      postVisibility = visibility || "PUBLIC";
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        imageUrl,
        type,

        // VISIBILITY
        visibility: postVisibility,

        // OPTIONAL COMMUNITY
        communityId: communityId || null,

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

        // COMMUNITY
        community: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },

        votes: true,

        comments: true,
      },
    });

    // SOCKET IO
    const io = req.app.get("io");

    io.emit("new-post", {
      ...post,

      commentCount: post.comments.length,
    });

    res.status(201).json({
      message: "Post created successfully",

      post: {
        ...post,

        commentCount: post.comments.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET ALL POSTS
exports.getPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      // ONLY GLOBAL PUBLIC POSTS
      where: {
        communityId: null,

        visibility: "PUBLIC",
      },

      include: {
        author: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },

        // COMMUNITY
        community: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },

        votes: true,

        comments: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    // FORMAT POSTS
    const formattedPosts = posts.map((post) => {
      return {
        ...post,

        commentCount: post.comments.length,
      };
    });

    res.status(200).json(formattedPosts);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// EDIT POST
exports.editPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const { title, content, visibility } = req.body;

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },

      include: {
        community: true,
      },
    });

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    // OWNER OR COMMUNITY ADMIN
    const isOwner = post.authorId === req.user.userId;

    const isCommunityAdmin =
      post.community && post.community.creatorId === req.user.userId;

    if (!isOwner && !isCommunityAdmin) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    const updatedPost = await prisma.post.update({
      where: {
        id: postId,
      },

      data: {
        title: title || post.title,

        content: content || post.content,

        visibility: visibility || post.visibility,
      },

      include: {
        author: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },

        community: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },

        votes: true,

        comments: true,
      },
    });

    // SOCKET IO
    const io = req.app.get("io");

    io.emit("post-updated", {
      ...updatedPost,

      commentCount: updatedPost.comments.length,
    });

    res.status(200).json({
      message: "Post updated successfully",

      post: {
        ...updatedPost,

        commentCount: updatedPost.comments.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE POST
exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },

      include: {
        community: true,
      },
    });

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    // OWNER OR COMMUNITY ADMIN
    const isOwner = post.authorId === req.user.userId;

    const isCommunityAdmin =
      post.community && post.community.creatorId === req.user.userId;

    if (!isOwner && !isCommunityAdmin) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    // DELETE COMMENTS FIRST
    await prisma.comment.deleteMany({
      where: {
        postId,
      },
    });

    // DELETE VOTES
    await prisma.vote.deleteMany({
      where: {
        postId,
      },
    });

    // DELETE POST
    await prisma.post.delete({
      where: {
        id: postId,
      },
    });

    // SOCKET IO
    const io = req.app.get("io");

    io.emit("post-deleted", {
      postId,
    });

    res.status(200).json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET SINGLE POST
exports.getSinglePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },

      include: {
        author: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },

        community: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },

        votes: true,

        comments: true,
      },
    });

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    res.json({
      ...post,

      commentCount: post.comments.length,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
