import { Controller, Post, Body, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register-start')
  async startRegistration(@Req() req: Request, @Res() res: Response) {
    const user = req.user; 
    // console.log(req, '<<<<<<<<<  req');

    const options = await this.authService.generateRegistrationOptions(user);
    // Store the challenge in the session or database
    // console.log(
    //   req.session?.challenge,
    //   '<<<<<<<<< req.session.challenge',
    //   req?.session,
    //   '<<<<<<<< req.session',
    // );
    // req.session.challenge = options.challenge;

    return res.json(options);
  }

  @Post('register-finish')
  async finishRegistration(@Req() req: Request, @Res() res: Response) {
    const user = req.user;
    const body = req.body;
    console.log(req, '<<<<<<<<<, req');
    const verified = await this.authService.verifyRegistrationResponseHandler(
      body,
      // req.session.challenge,
      user,
    );
    console.log(verified,'verified>>>')
    if (verified) {
      res.status(201).json({ status: 'ok', res: verified });
    } else {
      res.status(400).json({ status: 'error' });
    }
  }

  @Post('login-start')
  async startAuthentication(@Req() req: Request, @Res() res: Response) {
    const credentials = req.body; // get user from request
    const options = await this.authService.generateAuthenticationOptions(credentials);
    // req.session.challenge = options.challenge;
    res.json(options);
  }

  @Post('login-finish')
  async finishAuthentication(@Req() req: Request, @Res() res: Response) {
    const { body } = req;
    const user = req.user;
    const verified = await this.authService.verifyAuthenticationResponse(
      body,
      // req.session.challenge,
      user,
    );
    if (verified) {
      res.status(200).json({ status: 'ok' });
    } else {
      res.status(400).json({ status: 'error' });
    }
  }
}
