<?php
  include 'checkString.php';
  include 'notify.php';
  include 'authenticate.php';
  
  header('Content-type: application/json');
  
  $token = $_POST['Token'];
  $userid = $_POST["UserId"];
  $name = $_POST['KarmaName'];
  $amount = $_POST['KarmaAmount'];
  $karmaid = $_POST['KarmaId'];
  $categories = explode(',', $_POST['Categories']);
  
  $users = json_decode(file_get_contents("../json/users.txt"));
  
  if(!authenticate($userid, $token, 'karma')){
    echo json_encode(array('status'=>false, 'error'=>'authentication failed'));
    return;
  }
  
  if(!checkString($name) or !checkStringNum($amount) or !checkStringNum($karmaid)){
    echo json_encode(array(
      'status' => false,
      'error' => "wrong encoding of sent data"
    ));
    return;
  }
  
  foreach($categories as $cat){
    if(!checkString($cat)){
      echo json_encode(array(
        'status' => false,
        'error' => "wrong encoding of sent data"
      ));
      return;
    }
  }
  
  $karmaTasks = json_decode(file_get_contents("../json/karmaTasks.txt"));
  
  $cats = [];
  foreach($categories as $cat){
    $catsplit = explode('.', $cat);
    if(count($catsplit) == 2 and strlen($catsplit[0]) > 0 and strlen($catsplit[1]) > 0){
      array_push($cats, $cat);
    }
  }
  if($karmaid == -1){
    if($name == "" or $amount == "" or count($cats) < 1){
      echo json_encode(array(
        'status' => false,
        'error' => 'invalid data for new task'
      ));
      return;
    }
    $newid = 0;
    foreach($karmaTasks as $task){
      if($task->Id >= $newid){
        $newid = $task->Id + 1;
      }
    }
    $newtask['Id'] = $newid;
    $newtask['Name'] = $name;
    $newtask['Karma'] = $amount;
    $newtask['Categories'] = $cats;
    
    array_push($karmaTasks, $newtask);
  }
  if($karmaid >= 0){
    for($k = 0; $k < count($karmaTasks); $k++){
      if($karmaTasks[$k]->Id != $karmaid) continue;
      if($name != "") $karmaTasks[$k]->Name = $name;
      if($amount != "") $karmaTasks[$k]->Karma = $amount;
      if(count($cats) > 0) $karmaTasks[$k]->Categories = $cats;
      $newtask = $karmaTasks[$k];
      break;
    }
  }
   
  file_put_contents("../json/karmaTasks.txt", json_encode($karmaTasks));
  //Notification
  notifyMany("KarmaModify", $newtask['Name'], $userid);
  
  echo json_encode(array(
    'status' => true,
    'task' => $newtask
  ));
  
?>