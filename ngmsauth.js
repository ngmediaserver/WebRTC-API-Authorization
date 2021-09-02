//==========================================================
//  NG Media Server - WebRTC Authorization
//  Copyright (c) NG Media 2000-2021
//----------------------------------------------------------
// This sample JS code shows how to compute a 
//   WebRTC Authorization parameter to authenticate calls  
//   with NG Media Server
//==========================================================

// The following settings must match those of your NG Media Server
// const ngmsUsername = 'your-ngms-number-username';
// const ngmsPassword = 'your-ngms-number-password';

window.crypto = window.crypto || window.msCrypto; // IE11
if (window.crypto){
  if (window.crypto.webkitSubtle){
    window.crypto.subtle = window.crypto.webkitSubtle; // Safari
  }
}

// With this sample, the authCompute function computes the authorization parameter
// input:
// - params.from : the requested caller URI (/number) = the number
// - params.to   : the requested called URI (/number)
// - ngmsUsername: the username associated with the number
// - ngmsPassword: the password associated with the number
// output:
// - authorization: the authorization parameter to pass in MakeCall or Register.
async function authCompute(params, ngmsUsername, ngmsPassword) {

  // This function generates the authorization token
  async function hmacSha1(data, password)
    {
    let bSupported = false;
    if (window.crypto) if (window.crypto.subtle) {
      let algorithm = { name: "HMAC", hash: "SHA-1" };
      let enc = new TextEncoder("utf-8");
      let key = await crypto.subtle.importKey("raw", enc.encode(password), algorithm, false, ["sign", "verify"]);
      let signature = await crypto.subtle.sign(algorithm.name, key, enc.encode(data));
      let digest = btoa(String.fromCharCode(...new Uint8Array(signature)));

      bSupported = true;
//x   return new Promise(resolve => { resolve(digest); })
      return digest;
    }
    if (!bSupported) {
      alert("Web Crypto API is not Supported on this browser");
    }
  }

  let paramTo       = params.to      ;
  let paramFrom     = params.from    ;
  let paramFromName = params.fromName;
  if (paramTo !== undefined) {
    let data = '\n\n' + paramTo + '\n\n' + ((paramFrom === undefined) ? "" : paramFrom) + '\n\n\n\n';
    const validityPeriod = 10;  // In seconds
    let expiry = (Math.floor(new Date() / 1000) + validityPeriod); // Number of seconds since January 1, 1970
    let tmpUsername = expiry + ':' + ngmsUsername;

    const authorization = await hmacSha1(data + tmpUsername, ngmsPassword) + ':' + tmpUsername;
    return { authorization: authorization, from: paramFrom, }
  }else{			
    const err = { cause: 1, display: "Unallocated (unassigned) number", type: "release", };
    return err;			
  }  
  
}
