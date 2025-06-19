const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma.js"); // Using CommonJS require
const authService = require("./auth.service.js"); // Using CommonJS require

const signup = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Email and password required");
  }

  try {
    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).send("Email already in use");
    }

    // 2. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create the new user
    const user = await prisma.user.create({
      data: {
        email,
        password_hash: hashedPassword,
      },
    });

    // 4. Generate tokens and save the refresh token
    const { accessToken, refreshToken, refreshTokenJti } =
      authService.generateTokens(user);
    await authService.saveRefreshToken(refreshTokenJti, user.id);

    // 5. Set cookies
    res.cookie("accessToken", accessToken, authService.accessCookieOptions);
    res.cookie("refreshToken", refreshToken, authService.refreshCookieOptions);

    // 6. Send the response
    return res.status(201).json({
      user: { id: user.id, email: user.email },
      accessToken,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).send("Internal server error");
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Email and password required");
  }

  // Find the user by their unique email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Check if user exists and if the password is correct
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).send("Invalid credentials");
  }

  // Generate tokens, save refresh token, and set cookies
  const { accessToken, refreshToken, refreshTokenJti } =
    authService.generateTokens(user);
  await authService.saveRefreshToken(refreshTokenJti, user.id);

  res.cookie("accessToken", accessToken, authService.accessCookieOptions);
  res.cookie("refreshToken", refreshToken, authService.refreshCookieOptions);

  res.status(200).json({
    user: { id: user.id, email: user.email },
    accessToken,
  });
};

const refresh = async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;
  if (!incomingRefreshToken) {
    return res.status(401).send("Refresh token not found");
  }

  try {
    const decoded = authService.verifyRefreshToken(incomingRefreshToken);
    const tokenInDb = await authService.findRefreshToken(decoded.jti);

    if (!tokenInDb) {
      await authService.deleteAllUserTokens(decoded.sub);
      return res.status(403).send("Forbidden: Token reuse detected.");
    }

    await authService.deleteRefreshToken(decoded.jti);
    const { accessToken, refreshToken, refreshTokenJti } =
      authService.generateTokens({ id: decoded.sub });
    await authService.saveRefreshToken(refreshTokenJti, decoded.sub);

    res.cookie("accessToken", accessToken, authService.accessCookieOptions);
    res.cookie("refreshToken", refreshToken, authService.refreshCookieOptions);

    const userData = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, email: true },
    });

    if (!userData) {
      return res.status(401).send("User not found for this token");
    }

    res.json({ accessToken, user: userData });
  } catch (err) {
    console.error("Refresh error:", err);
    return res.status(401).send("Unauthorized: Invalid refresh token");
  }
};

const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    try {
      const decoded = authService.verifyRefreshToken(refreshToken);
      await authService.deleteRefreshToken(decoded.jti);
    } catch (error) {
      // Ignore errors.
    }
  }
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(204).send();
};

// Export all functions using module.exports for CommonJS
module.exports = {
  login,
  signup,
  refresh,
  logout,
};
