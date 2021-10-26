<?php
  header('Content-type: application/json');
  include 'authenticate.php';
  
  $token = $_POST['Token'];
  $userid = $_POST["UserId"];
  $pageid = $_POST["PageId"];
  
  $users = json_decode(file_get_contents("../json/users.txt"));
  
  if(!authenticate($userid, $token, '')){
    echo json_encode(array('status' => false, 'error' => 'authentication failed'));
    return;
  }
  for($k = 0; $k < count($users); $k++)
  {
    if($users[$k]->Id == $userid)
    {
      $users[$k]->BrowsePosition = $pageid;
    }
  }
  file_put_contents("../json/users.txt", json_encode($users));
  
  echo json_encode(array(
    'status' => true
  ));
?>