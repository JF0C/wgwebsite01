<?php
  include 'backup.php';
  include 'authenticate.php';
  
  $token = $_POST['Token'];
  $userid = $_POST["UserId"];
  
  if(!authenticate($userid, $token, 'site_admin')){
    echo json_encode(array('status' => false, 'error' => 'failed to authenticate user'));
    return;
  }
  $users = json_decode(file_get_contents("../json/users.txt"));
  foreach($users as $u){
    if($u->Id == $userid){
      $mailto = $u->Mail;
    }
  }
  backup($mailto, true);
  echo json_encode(array('status' => true));
?>