<?php
  function authenticate($userid, $token, $permission){
    $users = json_decode(file_get_contents("../json/users.txt"));
    $access_granted = false;
    foreach($users as $user)
    {
      if($user->Id == $userid && $user->Token == $token)
      {
        if($permission != ""){
          if(strpos($user->Permissions, $permission) !== false){
            $access_granted = true;
          }
        }
        else{
          $access_granted = true;
        }
        break;
      }
    }
    return $access_granted;
  }
?>