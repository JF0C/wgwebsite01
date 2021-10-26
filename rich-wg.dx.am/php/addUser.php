<?php
  header('Content-type: application/json');
  include 'checkString.php';
  include 'notify.php';
  
  $token = $_POST['Token'];
  $userid = $_POST["UserId"];
  $newuser = $_POST["UserName"];
  $mail = $_POST['Mail'];
  $password = $_POST['Password'];
    
  $users = json_decode(file_get_contents("../json/users.txt"));
  $access_granted = false;
  $id = 0;
  foreach($users as $user)
  {
    if($user->Id == $userid && $user->Token == $token && strpos($user->Permissions, 'karma') !== false){
      $access_granted = true;
    }
    if($user->Id >= $id){
      $id = $user->Id + 1;
    }
    if($user->Name == $newuser){
      echo json_encode(array('status' => false, 'error' => 'username already exists'));
      return;
    }
  }
  
  if(!$access_granted){
    echo json_encode(array('status' => false, 'error' => 'authentication failed'));
    return;
  }
  
  if(!checkString($newuser) or $newuser == ""){
    echo json_encode(array('status' => false, 'error' => 'invalid characters in username'));
    return;
  }
  
  if(!checkString($mail, [45, 46, 64, 95]) or $mail == ""){
    echo json_encode(array('status' => false, 'error' => 'invalid characters in mail'));
    return;
  }
  
  $newentry['Id'] = ''.$id;
  $newentry['Name'] = $newuser;
  $newentry['Token'] = hash("sha256", $password);
  $newentry['Mail'] = $mail;
  $newentry['Permissions'] = 'beer';
  $newentry['BrowsePosition'] = '1';
  $newentry['Theme'] = 'normal';
  $newentry['Notifications'] = '';
  
  $sendentry['Id'] = ''.$id;
  $sendentry['Name'] = $newuser;
  $sendentry['Permissions'] = 'beer';
  $sendentry['BrowsePosition'] = '1';
  
  array_push($users, $newentry);
  
  // Notification
  notifyMany("NewUser", $newuser, $userid);
  
  file_put_contents('../json/users.txt', json_encode($users));
  echo json_encode(array('status' => true, 'data' => $sendentry));
?>