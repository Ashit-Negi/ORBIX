const prisma = require("../config/db");

// CREATE POST
exports.createPost = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,

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

        votes: true,

        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Post created",
      post,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET ALL POSTS
// GET ALL POSTS
exports.getPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },

        votes: true,

        comments: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    // TOTAL COMMENT COUNT
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
