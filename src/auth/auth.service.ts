import { Injectable } from '@nestjs/common';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  VerifyRegistrationResponseOpts,
} from '@simplewebauthn/server';
import { ConfigService } from '@nestjs/config';
const crypto = require('crypto').webcrypto;

@Injectable()
export class AuthService {
  private rpName: string;
  private rpID: string;
  private origin: string;

  constructor(private configService: ConfigService) {
    this.rpName = this.configService.get('RP_NAME') || 'fanamPay';
    this.rpID = this.configService.get('RP_ID') || 'localhost';
    this.origin = this.configService.get('ORIGIN') || 'http://localhost:3000';
  }

  async generateRegistrationOptions(user) {
    try {
      console.log(crypto, '<<<<<< crypto');
      const encoder = new TextEncoder();
      const userIdUint8Array = encoder.encode('665dcad05a84367c06e70012');
      return generateRegistrationOptions({
        rpName: 'Example',
        rpID: 'localhost',
        userID: userIdUint8Array, // Ensure user.id is correctly passed
        userName: 'username',
        attestationType: 'direct',
        authenticatorSelection: {
          residentKey: 'preferred',
          userVerification: 'preferred',
        },
        supportedAlgorithmIDs: [-7, -257],
      });
    } catch (error) {
      console.log(error, '<<<<<<<<<<< error');
    }
  }

  async verifyRegistrationResponse(response, expectedChallenge, user) {
    const verification: Partial<VerifyRegistrationResponseOpts> & {
      credential: any;
    } = {
      credential: {
        response,
        // {
        //   attestationObject: '...',
        //   clientDataJSON: '...',
        // },
        id: '...',
        rawId: '...',
        type: 'public-key',
      },
      expectedChallenge,
      expectedOrigin: 'http://localhost:3000',
      expectedRPID: 'your-app.com',
      requireUserVerification: true,
    };

    // const verified = verifyRegistrationResponse(verification);
  }

  generateAuthenticationOptions(user) {
    return generateAuthenticationOptions({
      rpID: this.rpID,
      userVerification: 'preferred',
      allowCredentials: user.credentials.map((cred) => ({
        id: cred.credentialID,
        type: 'public-key',
        transports: cred.transports,
      })),
    });
  }

  // async verifyAuthenticationResponse(response, expectedChallenge, user) {
  //   const { verified, authenticationInfo } = await verifyAuthenticationResponse(
  //     {
  //       credential: response,
  //       expectedChallenge,
  //       expectedOrigin: this.origin,
  //       expectedRPID: this.rpID,
  //     },
  //   );

  //   if (verified) {
  //     // Verify and update the counter, etc. in the database
  //   }

  //   return verified;
  // }
}
