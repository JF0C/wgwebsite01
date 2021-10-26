<?php
  header('Content-type: application/json');
  include 'authenticate.php';
  
  $token = $_POST['Token'];
  $userid = $_POST["UserId"];
  $timestamp = $_POST["KarmaTimeStamp"];
  
  if(!authenticate($userid, $token, 'karma')){
    echo json_encode(array('status' => false, 'error' => 'authentication failed'));
    return;
  } 
  
  $karmaHistory = json_decode(file_get_contents("../json/karmaHistory.txt"));
  $foundentry = 0;
  
  for($k = count($karmaHistory) - 1; $k >=0 ; $k--)
  {
    if($karmaHistory[$k]->Date == $timestamp and $karmaHistory[$k]->KarmaTaskId == "-1")
    {
      $foundentry++;
      array_splice($karmaHistory, $k, 1);
      if($foundentry == 2)
      {
        break;
      }
    }
  }
  
  if($foundentry == 2)
  {
    file_put_contents("../json/karmaHistory.txt", json_encode($karmaHistory));
    echo json_encode(array(
      'status' => true,
    ));
  }
  else
  {
    echo json_encode(array(
      'status' => false
    ));
  }
?>