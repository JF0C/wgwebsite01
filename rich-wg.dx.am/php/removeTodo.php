<?php
  header('Content-type: application/json');
  include 'authenticate.php';
  
  $token = $_POST['Token'];
  $userid = $_POST["UserId"];
  $karmaid = $_POST["KarmaId"];
  
  if(!authenticate($userid, $token, 'karma')){
    echo json_encode(array(
      'status' => false,
      'error' => "access refused"
    ));
    return;
  }
  
  $karmaTasks = json_decode(file_get_contents("../json/karmaTasks.txt"));
  
  for($k = 0; $k < count($karmaTasks); $k++){
    if($karmaTasks[$k]->Id == $karmaid){
      $karmaTasks[$k]->Todo = 0;
      file_put_contents("../json/karmaTasks.txt", json_encode($karmaTasks));
      echo json_encode(array(
        'status' => true,
        'info' => "removed todo"
      ));
      return;
    }
  }  
?>