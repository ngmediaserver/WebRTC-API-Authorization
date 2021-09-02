window.crypto = window.crypto || window.msCrypto; // IE11
if (window.crypto){
  if (window.crypto.webkitSubtle){
    window.crypto.subtle = window.crypto.webkitSubtle; // Safari
  }
}

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
//x return new Promise(resolve => { resolve(digest); })
    return digest;
  }
  if (!bSupported) {
    alert("Web Crypto API is not Supported on this browser");
  }
}

