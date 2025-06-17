const jwt = require("jsonwebtoken");
const { randomUUID } = require("crypto");
const db = require("../db.js");

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

const saveRefreshToken = async (jti, userId) => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await db("refresh_tokens").insert({
    jti,
    user_id: userId,
    expires_at: expiresAt,
  });
};

const findRefreshToken = (jti) => db("refresh_tokens").where({ jti }).first();

const deleteRefreshToken = (jti) => db("refresh_tokens").where({ jti }).del();

const deleteAllUserTokens = (userId) =>
  db("refresh_tokens").where({ user_id: userId }).del();

const verifyRefreshToken = (token) => jwt.verify(token, REFRESH_TOKEN_SECRET);

const accessCookieOptions = { ...cookieOptions, maxAge: 30 * 60 * 1000 }; // 30 minutes
const refreshCookieOptions = {
  ...cookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000,
}; // 7 days

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
