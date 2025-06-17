const { Router } = require("express");
const { getProfile } = require("./user.controller.js");
const authenticate = require("../middleware/authenticate.js");

const router = Router();
router.get("/profile", authenticate, getProfile);

module.exports = router;
