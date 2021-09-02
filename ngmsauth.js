//==========================================================
//  NG Media Server - WebRTC Authorization
//  Copyright (c) NG Media 2000-2021
//----------------------------------------------------------
// This sample JS code shows how to compute a 
//   WebRTC Authorization parameter to authenticate calls  
//   with NG Media Server
//==========================================================

// The following settings must match those of your NG Media Server
const ngmsUsername = 'your-ngms-administrator-username';
const ngmsPassword = 'your-ngms-administrator-password';

window.crypto = window.crypto || window.msCrypto; // IE11
if (window.crypto){
  if (window.crypto.webkitSubtle){
    window.crypto.subtle = window.crypto.webkitSubtle; // Safari
  }
}

async function authCompute(params) {

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
