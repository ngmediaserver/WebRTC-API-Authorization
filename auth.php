<?php
header('Access-Control-Allow-Origin: *');

// The following settings must match those of your NG Media Server
$ngmsUsername = 'your-ngms-administrator-username';
$ngmsPassword = 'your-ngms-administrator-password';

function hmacSha1($data, $ngmsPassword){
  $hmac = hash_hmac('sha1', $data, $ngmsPassword);
  return base64_encode(pack('H*', $hmac)); 
}

$data = '\n\n' . $_GET["to"] . '\n\n' . $_GET["from"] . '\n\n\n\n';
$validityPeriod = 10;  // In seconds
$expiry = (floor(microtime(true)) + $validityPeriod); // Number of seconds since January 1, 1970
$tmpUsername = $expiry . ':' . $ngmsUsername;

$authorization = hmacSha1($data . $tmpUsername, $ngmsPassword) . ':' . $tmpUsername;
echo '{ authorization: "' . $authorization . '" }';
?>
