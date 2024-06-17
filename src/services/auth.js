import bcrypt from 'bcrypt';
import { User } from '../db/models/user.js';
import createHttpError from 'http-errors';
import { Session } from '../db/models/session.js';
import { FIFTEEN_MINUTES, THIRTY_DAYS } from '../constants/index.js';
import { randomBytes } from 'crypto';

export const registerUser = async (payload) => {
    const encryptedPassword = await bcrypt.hash(payload.password, 10);
    const user = await User.findOne({ email: payload.email });
    if (user) {
      throw createHttpError(409, 'Email in use');
    }

    return await User.create({
        ...payload,
        password: encryptedPassword,
  });
};

export const loginUser = async (payload) => {
    const user = await User.findOne({ email: payload.email });
    if (!user) {
        throw createHttpError(401, 'User not found');
    }
  const isEqual = await bcrypt.compare(payload.password, user.password);

  if (!isEqual) {
    throw createHttpError(401, 'Unauthorized');
    }
    await Session.deleteOne({ userId: user._id });



  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
  });
};


const createSession = () => {
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
  };
};

export const refreshSession = async ({ sessionId, refreshToken }) => {
  const session = await Session.findOne({
    _id: sessionId,
    refreshToken,
  });

  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);

  if (isSessionTokenExpired) {
    throw createHttpError(401, 'Session token expired');
  }

  const newSession = createSession();

  await Session.deleteOne({ _id: sessionId, refreshToken });

  return await Session.create({
    userId: session.userId,
    ...newSession,
  });
};

export const logoutUser = async ({ sessionId, refreshToken }) => {
  return await Session.deleteOne({
    _id: sessionId,
    refreshToken: refreshToken,
  });
};