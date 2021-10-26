<?php
  header('Content-type: application/json');
  include 'authenticate.php';
  include 'notify.php';
  
  $token = $_POST['Token'];
  $userid = $_POST["UserId"];
  $timestamp = number_format(round(microtime(true) * 1000), 0, ".", "");
  $karmaid = $_POST["KarmaId"];
  $todo = $_POST["Todo"] == "true";
  
  $access_granted = authenticate($userid, $token, 'karma');
  
  $karmaTasks = json_decode(file_get_contents("../json/karmaTasks.txt"));
  $valid_karma_id = false;
  $karma_name = "";
  for($k = 0; $k < count($karmaTasks); $k++){
    if($karmaTasks[$k]->Id == $karmaid){
      if($todo and $access_granted){
        $karmaTasks[$k]->Todo = $timestamp;
        // Notification
        notifyMany("KarmaList", $karmaTasks[$k]->Name, $userid);
        file_put_contents("../json/karmaTasks.txt", json_encode($karmaTasks));
        echo json_encode(array(
          'status' => true,
          'timestamp' => $timestamp,
          'info' => "added todo"
        ));
        return;
      }
      if(!$todo and $access_granted){
        $karmaTasks[$k]->Todo = 0;
        file_put_contents("../json/karmaTasks.txt", json_encode($karmaTasks));
      }
      $karma_name = $karmaTasks[$k]->Name;
      $valid_karma_id = true;
      break;
    }
  }  
  
  if($access_granted and $valid_karma_id)
  {
    $karmaHistory = json_decode(file_get_contents('../json/karmaHistory.txt'));
  
    $entry["UserId"] = $userid;
    $entry["Date"] = $timestamp;
    $entry["KarmaTaskId"] = $karmaid;
    array_push($karmaHistory, $entry);
    
    //Notification
    notifyMany("KarmaDone", $karma_name, $userid);
    file_put_contents("../json/karmaHistory.txt", json_encode($karmaHistory));
    
    echo json_encode(array(
      'status' => true,
      'timestamp' => $timestamp,
      'info' => "done task"
    ));
  }
  else
  {
    echo json_encode(array(
      'status' => false
    ));
  }
?>