import { VerifyRegistrationResponseOpts } from '@simplewebauthn/server';

export class CreateAuthDto {}

declare module 'express' {
  interface Request {
    user?: any; // You can replace any with a specific type if you have a User type/interface
    session?: any;
  }
}

export interface CustomVerifyRegistrationResponseOpts
  extends VerifyRegistrationResponseOpts {
  credential: any; // Or better yet, use the specific type instead of any
}
