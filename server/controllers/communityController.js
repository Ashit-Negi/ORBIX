const prisma = require("../config/db");

// CREATE COMMUNITY
exports.createCommunity = async (req, res) => {
  try {
    const { name, description, image } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Community name is required",
      });
    }

    // GENERATE SLUG
    const slug = name.toLowerCase().trim().replace(/\s+/g, "-");

    // CHECK EXISTING
    const existingCommunity = await prisma.community.findFirst({
      where: {
        OR: [
          {
            name: {
              equals: name,
              mode: "insensitive",
            },
          },

          {
            slug,
          },
        ],
      },
    });

    if (existingCommunity) {
      return res.status(400).json({
        message: "Community already exists",
      });
    }

    // CREATE COMMUNITY
    const community = await prisma.community.create({
      data: {
        name,
        slug,
        description,
        image,

        creatorId: req.user.userId,

        // AUTO JOIN CREATOR
        memberships: {
          create: {
            userId: req.user.userId,
          },
        },
      },

      include: {
        creator: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },

        _count: {
          select: {
            memberships: true,
            posts: true,
          },
        },
      },
    });

    // SOCKET IO
    const io = req.app.get("io");

    io.emit("new-community", community);

    res.status(201).json({
      message: "Community created successfully",

      community,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET ALL COMMUNITIES
exports.getCommunities = async (req, res) => {
  try {
    const communities = await prisma.community.findMany({
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },

        _count: {
          select: {
            memberships: true,
            posts: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(communities);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET SINGLE COMMUNITY
exports.getSingleCommunity = async (req, res) => {
  try {
    const { slug } = req.params;

    const community = await prisma.community.findUnique({
      where: {
        slug,
      },

      include: {
        creator: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },

        memberships: true,

        posts: {
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
        },

        _count: {
          select: {
            memberships: true,
            posts: true,
          },
        },
      },
    });

    if (!community) {
      return res.status(404).json({
        message: "Community not found",
      });
    }

    res.status(200).json(community);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET COMMUNITY POSTS
exports.getCommunityPosts = async (req, res) => {
  try {
    const { slug } = req.params;

    const community = await prisma.community.findUnique({
      where: {
        slug,
      },

      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,

        creatorId: true,

        memberships: true,

        _count: {
          select: {
            memberships: true,
            posts: true,
          },
        },
      },
    });

    if (!community) {
      return res.status(404).json({
        message: "Community not found",
      });
    }

    // USER ID
    let userId = null;

    // OPTIONAL AUTH
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(" ")[1];

        const jwt = require("jsonwebtoken");

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        userId = decoded.userId;
      } catch (error) {
        userId = null;
      }
    }

    // BOOLEAN CHECKS
    const isMember = community.memberships.some(
      (member) => member.userId === userId,
    );

    const isAdmin = community.creatorId === userId;

    // QUERY
    let whereClause = {
      communityId: community.id,
    };

    // GUEST
    if (!isAdmin && !isMember) {
      whereClause.visibility = "PUBLIC";
    }

    // MEMBER
    if (!isAdmin && isMember) {
      whereClause = {
        communityId: community.id,

        OR: [
          {
            visibility: "PUBLIC",
          },

          {
            visibility: "MEMBERS_ONLY",
          },
        ],
      };
    }

    const posts = await prisma.post.findMany({
      where: whereClause,

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

    res.status(200).json({
      community,
      posts: formattedPosts,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// JOIN COMMUNITY
exports.joinCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;

    const existingMembership = await prisma.membership.findUnique({
      where: {
        userId_communityId: {
          userId: req.user.userId,

          communityId,
        },
      },
    });

    if (existingMembership) {
      return res.status(400).json({
        message: "Already joined",
      });
    }

    await prisma.membership.create({
      data: {
        userId: req.user.userId,

        communityId,
      },
    });

    // SOCKET IO
    const io = req.app.get("io");

    io.emit("community-joined", {
      communityId,
    });

    res.status(200).json({
      message: "Community joined",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// LEAVE COMMUNITY
exports.leaveCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;

    const existingMembership = await prisma.membership.findUnique({
      where: {
        userId_communityId: {
          userId: req.user.userId,

          communityId,
        },
      },
    });

    if (!existingMembership) {
      return res.status(400).json({
        message: "Not a member",
      });
    }

    await prisma.membership.delete({
      where: {
        userId_communityId: {
          userId: req.user.userId,

          communityId,
        },
      },
    });

    // SOCKET IO
    const io = req.app.get("io");

    io.emit("community-left", {
      communityId,
    });

    res.status(200).json({
      message: "Community left",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
