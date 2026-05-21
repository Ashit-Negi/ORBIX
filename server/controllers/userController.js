const prisma = require("../config/db");

exports.searchUsers = async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    const query = req.query.q || "";

    if (!query.trim()) {
      return res.json([]);
    }

    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                name: {
                  contains: query,
                  mode: "insensitive",
                },
              },

              {
                username: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            ],
          },

          {
            NOT: {
              id: currentUserId,
            },
          },
        ],
      },

      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        image: true,
      },

      take: 8,
    });

    res.json(users);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Search failed",
    });
  }
};

exports.getSuggestedUsers = async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    const users = await prisma.user.findMany({
      where: {
        NOT: {
          id: currentUserId,
        },
      },

      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        image: true,
      },

      take: 5,
    });

    res.json(users);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to fetch users",
    });
  }
};
