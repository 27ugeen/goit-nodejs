import createControllerProxy from '../helpers/controllerProxy';
import { userModel, USER_STATUSES } from '../user/user.model';
import {
  ConflictError,
  UnauthorizedError,
  NotFound,
} from '../helpers/error.constructor';
import bcryptjs from 'bcryptjs';
import Joi from 'joi';
import jwt from 'jsonwebtoken';
import sgMail from '@sendgrid/mail';

class AuthController {
  constructor() {
    this._saltRounds = 5;
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async registerUser(req, res, next) {
    try {
      const { username, email, password } = req.body;
      const existingUser = await userModel.findUserByEmail(email);

      if (existingUser) {
        throw new ConflictError('Email in use');
      }

      const avatarURL = `${process.env.AVATAR_URL}${req.file}`;
      console.log('avatarURL', avatarURL);
      const passwordHash = await this.hashPassword(password);
      const newUser = await userModel.createUser({
        username,
        email,
        avatarURL,
        passwordHash,
      });

      this.sendVerificationEmail(newUser);

      return res.status(201).json({
        user: this.composeUserForResponse(newUser),
      });
    } catch (err) {
      next(err);
    }
  }

  async sendVerificationEmail(user) {
    const verificationLink = `${process.env.SERVER_URL}/users/verify/${user.verificationToken}`;

    await sgMail.send({
      to: user.email,
      from: process.env.SENDER_EMAIL,
      subject: 'Please verify your email',
      html: `<a href="${verificationLink}">Click to verify your email</a>`,
    });
  }

  async verifyUser(req, res, next) {
    try {
      const { verificationToken } = req.params;

      const userToVerify = await userModel.findByVerificationToken(
        verificationToken,
      );
      if (!userToVerify) {
        throw new NotFound('User not found');
      }

      await userModel.verifyUser(verificationToken);

      return res.status(200).send('User successfully verified');
    } catch (err) {
      next(err);
    }
  }

  async getAllUsers(req, res, next) {
    try {
      const users = await userModel.findAllUsers();
      return res.status(200).json(users);
    } catch (err) {
      next(err);
    }
  }

  async getCurrentUser(req, res, next) {
    try {
      const { username, email, subscription } = req.user;
      const currentUser = {
        username,
        email,
        subscription,
      };

      return res.status(200).json(currentUser);
    } catch (err) {
      next(err);
    }
  }

  async loginUser(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await userModel.findUserByEmail(email);
      if (!user) {
        throw new UnauthorizedError('Email or password does not exist');
      }

      if (user.status !== USER_STATUSES.ACTIVE) {
        throw new UnauthorizedError('User not verified');
      }

      const isPasswordCorrect = await this.comparePasswordHash(
        password,
        user.passwordHash,
      );
      if (!isPasswordCorrect) {
        throw new UnauthorizedError('User password is not valid');
      }

      const token = this.createToken(user._id);
      await userModel.updateUserById(user._id, { token });

      return res.status(200).json({
        user: this.composeUserForResponse(user),
        token,
      });
    } catch (err) {
      next(err);
    }
  }

  async updateUserAvatar(req, res, next) {
    try {
      const avatarURL = `${process.env.SERVER_URL}/${process.env.COMPRESSED_IMAGES_BASE_URL}/${req.file.filename}`;

      await userModel.updateUserById(req.user._id, { avatarURL });

      return res.status(200).json({ avatarURL });
    } catch (err) {
      next(err);
    }
  }

  async logoutUser(req, res, next) {
    try {
      await userModel.updateUserById(req.user._id, { token: null });

      return res.status(200).json({ message: 'Logout success' });
    } catch (err) {
      next(err);
    }
  }

  async authorizeUser(req, res, next) {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.replace('Bearer ', '');

      try {
        jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        throw new UnauthorizedError('User not authorized');
      }

      const user = await userModel.findUserByToken(token);
      if (!user) {
        throw new UnauthorizedError('Token is not valid');
      }

      req.user = user;
      req.token = token;

      next();
    } catch (err) {
      next(err);
    }
  }

  async validateRegisterUser(req, res, next) {
    const userRules = Joi.object({
      username: Joi.string().required(),
      email: Joi.string().required(),
      password: Joi.string().required(),
    });

    const validationResult = Joi.validate(req.body, userRules);
    if (validationResult.error) {
      return res.status(400).json(validationResult.error.message);
    }

    next();
  }

  async validateLoginUser(req, res, next) {
    const userRules = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
    });

    const validationResult = Joi.validate(req.body, userRules);
    if (validationResult.error) {
      return res.status(400).json(validationResult.error);
    }

    next();
  }

  async hashPassword(password) {
    return bcryptjs.hash(password, this._saltRounds);
  }

  async comparePasswordHash(password, passwordHash) {
    return bcryptjs.compare(password, passwordHash);
  }

  createToken(uid) {
    return jwt.sign({ uid }, process.env.JWT_SECRET);
  }

  composeUserForResponse({ _id, username, email, subscription, avatarURL }) {
    return {
      _id,
      username,
      email,
      subscription,
      avatarURL,
    };
  }
}

export const authController = createControllerProxy(new AuthController());
