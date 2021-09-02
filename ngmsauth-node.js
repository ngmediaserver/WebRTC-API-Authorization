//==========================================================
//  NG Media Server - WebRTC Authorization
//  Copyright (c) NG Media 2000-2021
//----------------------------------------------------------
// This sample Node.js code shows how to compute a 
//   WebRTC Authorization parameter to authenticate calls  
//   with NG Media Server
//==========================================================

const crypto = require('crypto');
const hapi   = require('hapi'  );

// The following settings must match those of your NG Media Server
const ngmsUsername = 'your-ngms-administrator-username';
const ngmsPassword = 'your-ngms-administrator-password';

// This sample is listening on port 3000
const server = new hapi.Server({
  port: 3000,
});

async function main() {
  // Start the server
  await server.start();

  // This function generates the authorization token
  async function hmacSha1(data, password) {
    return new Promise((resolve, reject) => {
      const hmac = crypto.createHmac('sha1', password);

      hmac.on('readable', () => {
        let hash = hmac.read();
        if (hash) {
          resolve(hash.toString('base64'));
          return;
        }else{
          return 'hmac error';
        }
      });

      hmac.write(data);
      hmac.end();
    });
  }

  // With this sample, the client page must performs a GET on /api/computeAuthorization in order to get the authorization parameter
  // input (query string):
  // - to: the requested called URI (/number)
  // output (JSON):
  // - authorization: the authorization parameter to pass in MakeCall or Register.
  // - from (optional): the from parameter that was used (if any) ; see below
  server.route({
    method: 'GET',
    path: '/api/computeAuthorization',
    handler: async (request, reply) => {
		
      // *** Here your code MUST verify that the client page requesting the authorization token is allowed. ***
      // *** Typically you MAY check that the requests is associated with an active user session. ***
      // *** An authorization parameter MUST be delivered only if all input parameters are allowed. ***
      // The authorization parameter signs the input parameters

      let paramTo       = request.query.to  ;
//    let paramFrom     = request.query.from    ;
      let paramFrom     = undefined; // Here, the from parameter is typically left empty or it is set here to reflect the user logged in this session      if (paramTo !== undefined) {
        let data = '\n\n' + paramTo + '\n\n' + ((paramFrom === undefined) ? "" : paramFrom) + '\n\n\n\n';
        const validityPeriod = 10;  // In seconds
        let expiry = (Math.floor(new Date() / 1000) + validityPeriod); // Number of seconds since January 1, 1970
        let tmpUsername = expiry + ':' + ngmsUsername;

        const authorization = await hmacSha1(data + tmpUsername, ngmsPassword) + ':' + tmpUsername;
        return { authorization: authorization, from: paramFrom, }
      }else{			
        const err = {
          cause: 1,
          display: "Unallocated (unassigned) number",
          type: "release",
        };
			
        return err;			
      }

    },
  });
}

main();
