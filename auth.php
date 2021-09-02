<?php
header('Access-Control-Allow-Origin: *');

$ngmsUsername = "NGMediaServerAdministratorUsername";
$ngmsPassword = "NGMediaServerAdministratorPassword";
$callTo = $_GET["to"];

function hmacSha1( $ngmsPassword ,  $data ){
	$hmac = hash_hmac('sha1', $data, $ngmsPassword);
	return base64_encode(pack('H*',$hmac)); 
}

$data = "\n\n".$callTo."\n\n\n\n\n\n";
$expiry = (floor(microtime(true)) + 10);
$tmpUsername = $expiry . ':' . $ngmsUsername;

$authorization = hmacSha1($ngmsPassword ,  $data  .  $tmpUsername )  .  ':'  .  $tmpUsername ;
echo $authorization;
?>
