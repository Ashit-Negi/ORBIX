const prisma = require("../config/db");

// GET USER PROFILE
exports.getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;

    console.log("USERNAME:", username);

    const user = await prisma.user.findUnique({
      where: {
        username,
      },

      include: {
        posts: {
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
                slug: true,
                name: true,
              },
            },

            _count: {
              select: {
                votes: true,
                comments: true,
              },
            },
          },

          orderBy: {
            createdAt: "desc",
          },
        },

        comments: {
          orderBy: {
            createdAt: "desc",
          },

          take: 10,
        },

        createdCommunities: true,

        memberships: {
          include: {
            community: true,
          },
        },

        _count: {
          select: {
            posts: true,
            comments: true,
            memberships: true,
            createdCommunities: true,

            sentRequests: {
              where: {
                status: "ACCEPTED",
              },
            },

            receivedRequests: {
              where: {
                status: "ACCEPTED",
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // FORMAT POSTS
    const formattedPosts = user.posts.map((post) => ({
      ...post,

      voteCount: post._count.votes,

      commentCount: post._count.comments,
    }));

    res.status(200).json({
      user: {
        id: user.id,

        username: user.username,

        name: user.name,

        bio: user.bio,

        image: user.image,

        role: user.role,

        website: user.website,

        github: user.github,

        location: user.location,

        createdAt: user.createdAt,

        posts: formattedPosts,

        comments: user.comments,

        createdCommunities: user.createdCommunities,

        memberships: user.memberships,

        counts: {
          ...user._count,

          connections: user._count.sentRequests + user._count.receivedRequests,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    console.log(req.body);

    console.log(req.file);

    const { name, bio, role, website, github, location } = req.body;

    const updatedUser = await prisma.user.update({
      where: {
        id: req.user.userId,
      },

      data: {
        name,
        bio,
        role,
        website,
        github,
        location,

        ...(req.file && {
          image: req.file.path,
        }),
      },
    });

    res.status(200).json({
      message: "Profile updated successfully",

      user: updatedUser,
    });
  } catch (error) {
    console.log("FULL ERROR:", JSON.stringify(error, null, 2));
    console.log("ERROR MESSAGE:", error.message);
    console.log("ERROR STACK:", error.stack);

    res.status(500).json({
      message: error.message,
    });
  }
};
