<?php
  header('Content-type: application/json');
  
  $token = $_POST['Token'];
  $userid = $_POST["UserId"];
  $target = $_POST['Target'];
  $property = $_POST['Property'];
  $value = $_POST["Value"];
  
  $users = json_decode(file_get_contents("../json/users.txt"));
  
  $access_granted = false;
  $target_exists = false;
  foreach($users as $user)
  {
    if($user->Id == $userid && $user->Token == $token && ((strpos($user->Permissions, 'karma') !== false) or (strpos($user->Permissions, 'beer') !== false))){
      $access_granted = true;
    }
    if($user->Id == $target)
    {
      $target_exists = true;
    }
  }
  
  if(!$access_granted)
  {
    sendError('authentication failed');
    return;
  }
  if(!$target_exists)
  {
    sendError('target user id does not exist');
    return;
  }
  
  for($k = 0; $k < count($users); $k++)
  {
    if($users[$k]->Id == $target)
    {
      switch($property)
      {
        case 'theme':
          if($value != 'dark' and $value != 'normal')
          {
            sendError('invalid theme');
            return;
          }
          $users[$k]->Theme = $value;
          file_put_contents("../json/users.txt", json_encode($users));
          sendSuccess($target, $property, $value);
          break;
        default:
          sendError('invalid property');
          return;
      }
    }
  }
  
  function sendSuccess($target, $property, $value)
  {
    echo json_encode(array('status' => false, 'Target' => $target, 'Property' => $property, 'Value' => $value));
  }
  
  function sendError($message)
  {
    echo json_encode(array('status' => false, 'error' => $message));
  }
?>