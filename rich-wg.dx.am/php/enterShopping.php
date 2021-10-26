<?php
  header('Content-type: application/json');
  include 'checkString.php';
  include 'authenticate.php';
  include 'notify.php';
  
  $token = $_POST['Token'];
  $userid = $_POST["UserId"];
  $name = $_POST["Name"];
  $mode = $_POST["Mode"];
  $timestamp = number_format(round(microtime(true) * 1000), 0, ".", "");
    
  $users = json_decode(file_get_contents("../json/users.txt"));
    
  if(!authenticate($userid, $token, 'shoppingList')){
    echo json_encode(array('status' => false, 'error' => 'authentication failed'));
    return;
  }
  
  if(!($mode == "add" or $mode == "check" or $mode == "reset" or $mode == "remove")){
    echo json_encode(array('status' => false, 'error' => 'invalid mode given'));
    return;
  }
  
  if(!checkString($name) or $name == ""){
    echo json_encode(array('status' => false, 'error' => 'invalid characters in entry name'));
    return;
  }
  
  $shoppingList = json_decode(file_get_contents("../json/shoppingList.txt"));
  
  $done = "";
  $data = null;
  
  $success = false;
  if($mode == "add"){
    $found = false;
    for($k = 0; $k < count($shoppingList); $k++){
      $s = $shoppingList[$k];
      if($s->Name == $name){
        $shoppingList[$k]->Open = $shoppingList[$k]->Open + 1;
        $shoppingList[$k]->Recurred = $shoppingList[$k]->Recurred + 1;
        $shoppingList[$k]->Entered = $timestamp;
        $found = true;
        $success = true;
        $done = 'addold';
        $data = $s;
        break;
      }
    }
    if(!$found){
      $newentry['Name'] = $name;
      $newentry['Entered'] = $timestamp;
      $newentry['Recurred'] = 1;
      $newentry['Open'] = 1;
      array_push($shoppingList, $newentry);
      $success = true;
      $done = 'addnew';
      $data = $newentry;
    }
    //Notification
    notifyMany("ShoppingList", $name, $userid);
  }
  
  if($mode == "check"){
    for($k = 0; $k < count($shoppingList); $k++){
      $s = $shoppingList[$k];
      if($s->Name == $name){
        if($s->Open < 1){
          echo json_encode(array('status' => false, 'error' => 'already done'));
          return;
        }
        $shoppingList[$k]->Open = $shoppingList[$k]->Open - 1;
        $shoppingList[$k]->Entered = $timestamp;
        $success = true;
        $data = $shoppingList[$k];
        $done = 'checked';
        //Notification
        notifyMany("ShoppingDone", $name, $userid);
        break;
      }
    }
  }
  
  if($mode == "reset"){
    for($k = 0; $k < count($shoppingList); $k++){
      $s = $shoppingList[$k];
      if($s->Name != $name) continue;
      if($s->Open < 1){
        echo json_encode(array('status' => false, 'error' => 'cant be reset'));
        return;
      }
      $shoppingList[$k]->Recurred = max(0, $shoppingList[$k]->Recurred - $shoppingList[$k]->Open);
      $shoppingList[$k]->Open = 0;
      $success = true;
      $data = $shoppingList[$k];
      $done = 'reset';
      break;
    }
  }
  
  if($mode == "remove"){
    for($k = 0; $k < count($shoppingList); $k++){
      $s = $shoppingList[$k];
      if($s->Name != $name) continue;
      array_splice($shoppingList, $k, 1);
      $success = true;
      $done = 'removed';
      break;
    }
  }
  
  if(!$success){
    echo json_encode(array('status' => false, 'error' => 'entry not found'));
    return;
  }
  
  file_put_contents('../json/shoppingList.txt', json_encode($shoppingList));
  echo json_encode(array('status' => true, 'data' => $data, 'mode' => $done));
?>