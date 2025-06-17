const db = require("../db.js");

const getProfile = async (req, res) => {
  const user = await db("users")
    .where({ id: req.user.id })
    .select("id", "email")
    .first();
  if (!user) return res.status(404).send("User not found");
  res.json(user);
};

module.exports = {
  getProfile,
};
