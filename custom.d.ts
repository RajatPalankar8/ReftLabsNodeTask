// custom.d.ts
import { Request } from 'express';
import { DecodedToken } from './models/decodedToken.model'; // Replace with the appropriate type for your decoded JWT token

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken; // Replace with the appropriate type for your decoded JWT token
    }
  }
}
