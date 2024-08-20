import { Injectable } from '@nestjs/common';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  VerifyRegistrationResponseOpts,
  VerifiedAuthenticationResponse,
  VerifyAuthenticationResponseOpts,
} from '@simplewebauthn/server';
import { ConfigService } from '@nestjs/config';
const crypto = require('crypto').webcrypto;
import base64url from 'base64url';
import { AuthenticationResponseJSON } from '@simplewebauthn/server/script/deps';

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
      const encoder = new TextEncoder();
      const userIdUint8Array = encoder.encode('665dcad05a84367c06e70012');
      return generateRegistrationOptions({
        rpName: 'Example',
        rpID: 'localhost',
        userID: userIdUint8Array,
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

  async verifyRegistrationResponseHandler(credential: any, user: any) {
    try {
      // Prepare clientDataJSON
      const clientDataJSON = JSON.stringify({
        challenge: '06Mslzv98Y-q-e41_r4EAP1qrvgkyEpEp79B8mwpaBs',
        origin: 'http://localhost:3000',
        type: 'public-key',
        nonce: '12345',
      });
      const encodedClientDataJSON = base64url.encode(clientDataJSON);

      // Create verification object with correct types
      const verification: VerifyRegistrationResponseOpts = {
        response: {
          id: 'c3RyaW5nLXdpdGgtKy8',
          rawId: 'c3RyaW5nLXdpdGgtKy8',
          type: 'public-key',
          response: {
            clientDataJSON: encodedClientDataJSON,
            attestationObject:
              'o2NmbXRkbm9uZWdhdHRTdG10oGhhdXRoRGF0YViYSZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2NdAAAAAPv8MAcVTk7MjAtuAgVX170AFMmrSe-rfFJOPai3TeQJjlt1SmVdpQECAyYgASFYIPOVivhTwEkMgUUXPcy5UJEbodBBuLN73gVj7hhbkAMBIlggv0jM-fBZS8_AUHaykok0ouEf7M_qF4r-eKG8Gapc_jk', // Convert buffer to Base64URL string
          },
          clientExtensionResults: {},
        },
        expectedType: 'public-key',
        expectedChallenge: credential.challenge,
        expectedOrigin: 'http://localhost:3000',
        expectedRPID: 'localhost',
        requireUserVerification: false,
      };

      console.log(
        'Verification Object:',
        JSON.stringify(verification, null, 2),
      );

      // Call the actual verification function from @simplewebauthn/server
      const result = await verifyRegistrationResponse(verification);
      return result;
    } catch (err) {
      console.error('Verification failed:', err);
      throw err;
    }
  }

  async generateAuthenticationOptions(credentials: any) {
    return await generateAuthenticationOptions({
      rpID: 'localhost',
      userVerification: 'preferred',
      allowCredentials: credentials.map((cred) => ({
        id: cred.registrationInfo.credentialID,
        type: 'public-key',
        transports: ['hybrid', 'internal'],
      })),
    });
  }

  async verifyAuthenticationResponse(response: any, user) {
    let verification: VerifiedAuthenticationResponse;
    let dbAuthenticator; // This should be populated with the user's authenticator data from your database.
    const clientDataJSON = JSON.stringify({
      challenge: '06Mslzv98Y-q-e41_r4EAP1qrvgkyEpEp79B8mwpaBs',
      origin: 'http://localhost:3000',
      type: 'public-key',
      nonce: '12345',
    });
    const encodedClientDataJSON = base64url.encode(clientDataJSON);
    const credentialPublicKeyObject =  response.credentialPublicKey as Record<string, number>;

    // Convert to an Array or Buffer
    const credentialPublicKeyBuffer = Buffer.from(
      Object.values(credentialPublicKeyObject),
    );

    try {
      const opts: VerifyAuthenticationResponseOpts = {
        response: {
          id: response.allowCredentials[0].id,
          rawId: response.allowCredentials[0].id,
          response: {
            authenticatorData: response.authenticatorData,
            clientDataJSON: encodedClientDataJSON,
            signature: response.signature,
            userHandle: response.userHandle,
          },
          type: 'public-key',
          clientExtensionResults: {},
          authenticatorAttachment: 'platform',
        },
        expectedChallenge: '06Mslzv98Y-q-e41_r4EAP1qrvgkyEpEp79B8mwpaBs',
        expectedOrigin: 'http://localhost:3000',
        expectedRPID: 'localhost',
        expectedType: 'public-key',
        authenticator: {
          credentialID: response.allowCredentials[0].id, // e.g., base64url-encoded credential ID
          credentialPublicKey: credentialPublicKeyBuffer, // Authenticator's public key
          counter: 0, // Counter value
          transports: response.allowCredentials[0].transports, // List of transports (e.g., 'usb', 'ble', 'nfc')
        }, // This should come from your database, containing credentialPublicKey, credentialID, counter, etc.
        requireUserVerification: false,
      };
      console.log(opts);
      verification = await verifyAuthenticationResponse(opts);
      console.log(verification, 'fffff');
      if (verification.verified) {
        // Verify and update the counter, etc. in the database
        // You should implement the logic here to update your user's authenticator data in the database.
      }
    } catch (error) {
      console.error(error.message);
     
    }

    return verification;
  }
}
