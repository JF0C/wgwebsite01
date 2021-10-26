<?php
  header('Content-type: application/json');
  include 'notify.php';
  
  $token = $_POST['Token'];
  $userid = $_POST["UserId"];
  $timestamp = number_format(round(microtime(true) * 1000), 0, ".", "");
  $target = $_POST['Target'];
  $amount = $_POST['Amount'];
  
  $users = json_decode(file_get_contents("../json/users.txt"));
  $access_granted = false;
  $target_exists = false;
  foreach($users as $user)
  {
    if($user->Id == $userid && $user->Token == $token && strpos($user->Permissions, 'karma') !== false)
    {
      $access_granted = true;
    }
    if($user->Id == $target && strpos($user->Permissions, 'karma') !== false)
    {
      $target_exists = true;
    }
  }
  if(!$access_granted or $userid == $target or !$target_exists or $amount < 1)
  {
    echo json_encode(array(
      'status' => false
    ));
    return;
  }
  $karma_history = json_decode(file_get_contents("../json/karmaHistory.txt"));
  $sign = "-";
  
  $senderentry["UserId"] = $userid;
  $senderentry["To"] = $target;
  $senderentry["Date"] = $timestamp;
  $senderentry["KarmaTaskId"] = "-1";
  $senderentry["Amount"] = $sign.$amount;
  
  array_push($karma_history, $senderentry);
  
  $receiverentry["UserId"] = $target;
  $receiverentry["From"] = $userid;
  $receiverentry["Date"] = $timestamp;
  $receiverentry["KarmaTaskId"] = "-1";
  $receiverentry["Amount"] = $amount;
  
  array_push($karma_history, $receiverentry);
  
  //Notification
  notify("KarmaTransfer", $target, $amount, $userid);
  file_put_contents("../json/karmaHistory.txt", json_encode($karma_history));
  
  echo json_encode(array(
      'status' => true,
      'timestamp' => $timestamp,
      'info' => "done task"
    ));
?>