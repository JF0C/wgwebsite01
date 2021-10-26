<?php
  header('Content-type: application/json');
  
  $token = $_POST['Token'];
  $userid = $_POST["UserId"];
  
  $variables = $_POST["Variables"];
  
  $users = json_decode(file_get_contents("../json/users.txt"));
  $currentuser = null;
  $access_granted = false;
  foreach($users as $user)
  {
    if($user->Id == $userid && $user->Token == $token)
    {
      $access_granted = true;
      $currentuser = $user;
      break;
    }
  }
  
  foreach(explode(" ", $variables) as $var){
    $success = false;
    if(($var == "karmaHistory" or $var == "karmaTasks") and strpos($currentuser->Permissions, 'karma') !== false) $success = true;
    if(($var == "drinksHistory" or $var == "toCancel" or $var == "products") and strpos($currentuser->Permissions, 'beer') !== false) $success = true;
    if(($var == "shoppingList") and strpos($currentuser->Permissions, 'shoppingList') !== false) $success = true;
    if($success) $data[$var] = json_decode(file_get_contents("../json/".$var.".txt"));
  }
    
  echo json_encode(array(
    'status' => true,
    'data' => $data
  ));
?>