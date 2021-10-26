<?php
  header('Content-type: application/json');
  $token = $_GET['token'];
  if($token !== 'brudi') {
    echo '{"Error": "Unauthorized"}';
    return;
  }
  echo file_get_contents("../json/karmaTasks.txt");
?>