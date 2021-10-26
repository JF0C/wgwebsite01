<?php
  header('Content-type: application/json');
  include 'authenticate.php';
  
  $token = $_POST['Token'];
  $userid = $_POST['UserId'];
  $timestamp = number_format(round(microtime(true) * 1000), 0, ".", "");
  $targetuser = $_POST['TargetUser'];
  $permission = $_POST['Permission'];
  
  $valid_perms = file_get_contents("../json/permissions.txt");
  $admin_perm = 'site_admin';
  
  if(!authenticate($userid, $token, $admin_perm) or strpos($valid_perms, $permission) === false){
    echo json_encode(array(
      'status' => false,
      'authantication' => authenticate($userid, $token, $admin_perm),
      'valid_perms' => $valid_perms,
      'isvalid' => strpos($valid_perms, $permission) !== false
    ));
    return;
  }
  
  $users = json_decode(file_get_contents("../json/users.txt"));
  $value = false;
  
  $nadmins = 0;
  foreach($users as $u){
    if(strpos($u->Permissions, $admin_perm) !== false){
      $nadmins = $nadmins + 1;
    }
  }
  
  for($k = 0; $k < count($users); $k++){
    if($users[$k]->Id == $targetuser){
      $perms = $users[$k]->Permissions;
      if(strpos($perms, $permission) !== false){
        if($permission == $admin_perm and $nadmins == 1){
          echo json_encode(array(
            'status' => false,
            'info' => 'there must be at least one admin'
          ));
          return;
        }
        $perms = str_replace(' '.$permission, '', $perms);
      }
      else{
        $perms.=' '.$permission;
        $value = true;
      }
      $users[$k]->Permissions = $perms;
      break;
    }
  }
  
  file_put_contents('../json/users.txt', json_encode($users));
  
  echo json_encode(array(
    'status' => true,
    'TargetUser' => $targetuser,
    'Permission' => $permission,
    'Value' => $value
  ));
?>