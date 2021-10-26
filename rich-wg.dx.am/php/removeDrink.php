<?php
  header('Content-type: application/json');
  
  $token = $_POST['Token'];
  $userid = $_POST["UserId"];
  $productid = $_POST['ProductId'];
  $timestamp = $_POST["Timestamp"];
  $action = $_POST["Action"];
  
  $users = json_decode(file_get_contents("../json/users.txt"));
  $access_granted = false;
  $admin = false;
  foreach($users as $user)
  {
    if($user->Id == $userid && $user->Token == $token && strpos($user->Permissions, 'beer') !== false)
    {
      if(strpos($user->Permissions, 'beer_admin') !== false){
        $admin = true;
      }
      $access_granted = true;
      break;
    }
  }
  
  if(!$access_granted){
    echo json_encode(array('status' => false, 'error' => 'authentication failed'));
    return;
  }
  
  $drinksHistory = json_decode(file_get_contents("../json/drinksHistory.txt"));
  $toCancel = json_decode(file_get_contents('../json/toCancel.txt'));
  
  if($action == 'unmark'){
    $success = false;
    for($k = 0; $k < count($toCancel); $k++){
      if($toCancel[$k]->Timestamp == $timestamp){
        array_splice($toCancel, $k, 1);
        $success = true;
      }
    }
    if($success){
      file_put_contents('../json/toCancel.txt', json_encode($toCancel));
      echo json_encode(array('status' => true, 'data' => $timestamp));
    }
    else{
      echo json_encode(array('status' => true, 'error' => 'entry could not be removed from cancellation list'));
    }
    return;
  }
  
  $success = false;
  
  if($admin){
    $success = false;
    for($k = 0; $k < count($drinksHistory); $k++){
      if($drinksHistory[$k]->Timestamp == $timestamp){
        $newentry = $drinksHistory[$k];
        array_splice($drinksHistory, $k, 1);
        $success = true;
        break;
      }
    }
    for($k = 0; $k < count($toCancel); $k++){
      if($toCancel[$k]->Timestamp == $timestamp){
        array_splice($toCancel, $k, 1);
      }
    }
    if(!$success){
      echo json_encode(array('status' => false, 'error' => 'invalid data'));
      return;
    }
    file_put_contents('../json/drinksHistory.txt', json_encode($drinksHistory));
  }
  else{
  
    foreach($toCancel as $entry){
      if($entry->Timestamp == $timestamp and $entry->UserId == $userid){
        echo json_encode(array('status' => false, 'error' => 'already marked for cancellation'));
        return;
      }
    }
    
    for($k = 0; $k < count($drinksHistory); $k++){
      if($drinksHistory[$k]->UserId == $userid and $drinksHistory[$k]->Timestamp == $timestamp){
        $newentry['Timestamp'] = $timestamp;
        $newentry['UserId'] = $userid;
        $newentry['ProductId'] = $productid;
        
        array_push($toCancel, $newentry);
        $success = true;
        break;
      }
    }
    if(!$success){
      echo json_encode(array('status' => false, 'error' => 'invalid cancellation data 1'));
      return;
    }
  }
  
  
  file_put_contents('../json/toCancel.txt', json_encode($toCancel));
  echo json_encode(array('status' => true, 'data' => $newentry));
?>