//==========================================================
//  NG Media Server - WebRTC Authorization
//  Copyright (c) NG Media 2000-2020
//----------------------------------------------------------
// This sample Node.js code shows how to compute a 
//   WebRTC Authorization parameter to authenticate calls  
//   with NG Media Server
//==========================================================

const crypto = require('crypto');
const hapi   = require('hapi'  );

// NG Media Server Infos
const ngmsUsername = 'NGMediaServerAdministratorUsername';
const ngmsPassword = 'NGMediaServerAdministratorPassword';

// This sample Node.js server is listening on port 3000
const server = new hapi.Server({
	port: 3000,
});

async function main() {
	// Node.js server is starting
	await server.start();

	// This function is generating the WebRTC Authorization token required by NG Media Server
	async function hmacSha1(password, data) {
		return new Promise((resolve, reject) => {
			const hmac = crypto.createHmac('sha1', password);

			hmac.on('readable', () => {
				let hash = hmac.read();
				if (hash) {
					resolve(hash.toString('base64'));
					return;
				} else {
					return 'hmac error';
				}
			});

			hmac.write(data);
			hmac.end();
		});
	}

	// Define a GET /rtc_authorization service that generates the WebRTC Authorization token
	// - Input : to (mandatory), from (optional)
	// - Output: authorization, 
	server.route({
		method: 'GET',
		path: '/rtc_authorization',
		handler: async (request, reply) => {
		
			var time = new Date().getTime();
			var utcDateNow = new Date(time);
			if (request.query.to !== undefined) {
				let data = '\n\n' + request.query.to + '\n\n' + request.query.from + '\n\n\n\n';
				const validityPeriod = 10;	// Expressed as seconds
				let expiry = (Math.floor(new Date() / 1000) + (validityPeriod * 1000)); // Expiry expressed as the number of milliseconds since January 1, 1970
				let tmpUsername = expiry + ':' + ngmsUsername;

				const authorizationToken = await hmacSha1(ngmsPassword, data + tmpUsername) + ':' + tmpUsername;
				return {
					authorization: authorizationToken,
				//	from: request.query.from,
				}
			} else {			
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
