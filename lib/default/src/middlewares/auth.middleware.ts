import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import config from 'config';
import HttpException from '@exceptions/HttpException';
import { DataStoredInToken, RequestWithUser } from '@interfaces/auth.interface';
import userModel from '@models/users.model';

const authMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const cookies = req.cookies;

    if (cookies && cookies.Authorization) {
      const secretKey: string = config.get('secretKey');
      const verificationResponse = (await jwt.verify(cookies.Authorization, secretKey)) as DataStoredInToken;
      const userId = verificationResponse.id;
      const findUser = userModel.find(user => user.id === userId);

      if (findUser) {
        req.user = findUser;
        next();
      } else {
        next(new HttpException(401, 'Wrong authentication token'));
      }
    } else {
      next(new HttpException(404, 'Authentication token missing'));
    }
  } catch (error) {
    next(new HttpException(401, 'Wrong authentication token'));
  }
};

export default authMiddleware;
