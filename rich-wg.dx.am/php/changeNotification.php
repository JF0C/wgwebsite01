<?php
  include 'authenticate.php';
  
  $token = $_POST['Token'];
  $userid = $_POST["UserId"];
  $notification = $_POST["Notification"];
  
  if(!authenticate($userid, $token, "")){
    echo json_encode(array("status"=>false,"error"=>"authentication failed"));
  }
  $users = json_decode(file_get_contents("../json/users.txt"));
  
  
  $notis = json_decode(file_get_contents("../json/notifications.txt"));
  $valid = false;
  foreach($notis as $n){
    if($n->Name == $notification){
      $valid = true;
      break;
    }
  }
  if(!$valid){
    echo json_encode(array("status"=>false,"error"=>"invalid notification: ".$notification));
  }
  
  for($k = 0; $k < count($users); $k++){
    if($users[$k]->Id == $userid){
      $notis = $users[$k]->Notifications;
      $added = false;
      if(!array_key_exists('Notifications', $users[$k])){
        $users[$k]->Notifications = "";
      }
       
      if(strpos($notis, $notification) === false){
        $notis.=" ".$notification;
        $added = true;
      }
      else{
        $notis = str_replace($notification, "", $notis);
      }
      $users[$k]->Notifications = str_replace("  ", " ", $notis);
      $notis = $users[$k]->Notifications;
      break;
    }
  }
  
  
  file_put_contents('../json/users.txt', json_encode($users));
  echo json_encode(array('status'=>true, 'Notification'=>$notification, 'Value'=>$added, 'notis'=>$users));
?>