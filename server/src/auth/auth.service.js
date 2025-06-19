const jwt = require("jsonwebtoken");
const { randomUUID } = require("crypto");
const prisma = require("../lib/prisma.js"); // Use the Prisma client

const {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRATION,
  REFRESH_TOKEN_EXPIRATION,
} = process.env;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // only send over https
  sameSite: "lax",
};

// This function has no database logic and remains unchanged.
const generateTokens = (user) => {
  const accessToken = jwt.sign({ sub: user.id }, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRATION,
  });
  const refreshTokenJti = randomUUID();
  const refreshToken = jwt.sign(
    { sub: user.id, jti: refreshTokenJti },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRATION }
  );
  return { accessToken, refreshToken, refreshTokenJti };
};

// Replaces Knex 'insert' with Prisma 'create'
const saveRefreshToken = async (jti, userId) => {
  const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await prisma.refreshToken.create({
    data: {
      jti,
      userId, // Prisma uses camelCase for relation scalar fields by convention
      expires_at,
    },
  });
};

// Replaces Knex 'where().first()' with Prisma 'findUnique'
const findRefreshToken = (jti) => {
  return prisma.refreshToken.findUnique({
    where: { jti },
  });
};

// Replaces Knex 'del()' with Prisma 'delete'
const deleteRefreshToken = (jti) => {
  return prisma.refreshToken.delete({
    where: { jti },
  });
};

// Replaces Knex 'del()' with Prisma 'deleteMany' for bulk operations
const deleteAllUserTokens = (userId) => {
  return prisma.refreshToken.deleteMany({
    where: { userId },
  });
};

// This function has no database logic and remains unchanged.
const verifyRefreshToken = (token) => jwt.verify(token, REFRESH_TOKEN_SECRET);

const accessCookieOptions = { ...cookieOptions, maxAge: 30 * 60 * 1000 }; // 30 minutes
const refreshCookieOptions = {
  ...cookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

module.exports = {
  generateTokens,
  saveRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
  deleteAllUserTokens,
  verifyRefreshToken,
  accessCookieOptions,
  refreshCookieOptions,
};
