const prisma = require("../config/db");

// ADD EXPERIENCE
exports.addExperience = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      title,
      company,
      employmentType,
      location,
      startDate,
      endDate,
      currentlyWorking,
      description,
      skills,
    } = req.body;

    if (!title || !company || !startDate) {
      return res.status(400).json({
        message: "Title, company and start date are required",
      });
    }

    const experience = await prisma.experience.create({
      data: {
        title,
        company,
        employmentType,
        location,
        startDate: new Date(startDate),

        endDate: endDate ? new Date(endDate) : null,

        currentlyWorking,

        description,

        skills: skills || [],

        userId,
      },
    });

    res.status(201).json(experience);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to add experience",
    });
  }
};

// GET USER EXPERIENCES
exports.getUserExperiences = async (req, res) => {
  try {
    const { userId } = req.params;

    const experiences = await prisma.experience.findMany({
      where: {
        userId,
      },

      orderBy: {
        startDate: "desc",
      },
    });

    res.status(200).json(experiences);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to fetch experiences",
    });
  }
};

// UPDATE EXPERIENCE
exports.updateExperience = async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    const { experienceId } = req.params;

    const existingExperience = await prisma.experience.findUnique({
      where: {
        id: experienceId,
      },
    });

    if (!existingExperience) {
      return res.status(404).json({
        message: "Experience not found",
      });
    }

    if (existingExperience.userId !== currentUserId) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    const updatedExperience = await prisma.experience.update({
      where: {
        id: experienceId,
      },

      data: req.body,
    });

    res.status(200).json(updatedExperience);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to update experience",
    });
  }
};

// DELETE EXPERIENCE
exports.deleteExperience = async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    const { experienceId } = req.params;

    const existingExperience = await prisma.experience.findUnique({
      where: {
        id: experienceId,
      },
    });

    if (!existingExperience) {
      return res.status(404).json({
        message: "Experience not found",
      });
    }

    if (existingExperience.userId !== currentUserId) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    await prisma.experience.delete({
      where: {
        id: experienceId,
      },
    });

    res.status(200).json({
      message: "Experience deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to delete experience",
    });
  }
};
