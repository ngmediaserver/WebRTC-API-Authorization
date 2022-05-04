<?php
// Sample Code - PHP
header('Access-Control-Allow-Origin: *');

// The following settings must match those of your NG Media Server
$ngmsUsername = 'your-ngms-administrator-username';
$ngmsPassword = 'your-ngms-administrator-password';

// This function generates the authorization token
function hmacSha1($data, $ngmsPassword){
  $hmac = hash_hmac('sha1', $data, $ngmsPassword);
  return base64_encode(pack('H*', $hmac)); 
}

// With this sample, the client page must performs a GET on ngmsauth.php in order to get the authorization parameter
// input (query string):
// - to: the requested called URI (/number)
// output (JSON):
// - authorization: the authorization parameter to pass in MakeCall or Register.
// - from (optional): the from parameter that was used (if any) ; see below
$toParam = $_GET["to"];
$fromParam = $_GET["from"];
$validityPeriodParam = $_GET["validity"];  // In seconds
//!\\ BE CAREFUL HERE: you have to use " and not ' or your \n encoding will not be good //!\\
$data = "\n\n$toParam\n\n$fromParam\n\n\n\n";

$expiry = (floor(microtime(true)) + $validityPeriodParam); // Number of seconds since January 1, 1970
$tmpUsername = $expiry . ':' . $ngmsUsername;

$authorization = hmacSha1($data . $tmpUsername, $ngmsPassword) . ':' . $tmpUsername;
echo '{ authorization: "' . $authorization . '" }';
?>
