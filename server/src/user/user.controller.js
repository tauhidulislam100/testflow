const prisma = require("../lib/prisma.js");

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) return res.status(404).send("User not found");

    res.json({ user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).send("Server error");
  }
};

module.exports = {
  getProfile,
};
