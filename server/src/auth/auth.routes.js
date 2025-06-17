const { Router } = require("express");
const { login, signup, refresh, logout } = require("./auth.controller.js");

const router = Router();

router.post("/login", login);
router.post("/signup", signup);
router.post("/refresh", refresh);
router.post("/logout", logout);

module.exports = router;
