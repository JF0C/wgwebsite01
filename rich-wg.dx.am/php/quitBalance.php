<?php
  header('Content-type: application/json');
  include 'authenticate.php';
  
  $token = $_POST['Token'];
  $userid = $_POST["UserId"];
  $balanceid = $_POST["BalanceId"];
  
  $users = json_decode(file_get_contents("../json/users.txt"));
  if(!authenticate($userid, $token, 'karma')){
    echo json_encode(array('status' => false, 'error' => 'authentication failed'));
    return;
  }
  
  $balances = json_decode(file_get_contents("../json/balances.txt"));
  for($k = 0; $k < count($balances); $k++){
    if($balances[$k]->Id == -1) continue;
    if($balances[$k]->Id != $balanceid) continue;
    $maxids = [];
    $maxval = 0;
    foreach($balances[$k]->Users as $id => $val){
      if($val > $maxval){
        $maxids = array($id);
        $maxval = $val;
      }
      if($val == $maxval){
        array_push($maxids, $id);
      }
    }
    $valid = false;
    foreach($maxids as $id){
      if($id == $userid){
        $valid = true;
        break;
      }
    }
    if(!$valid){
      echo json_encode(array('status' => false,
        'error' => 'user is not under the highest ranking users of this balance'));
      return;
    }
    $balances[$k]->Balanced = "true";
  }
  
  file_put_contents("../json/balances.txt", json_encode($balances));
  echo json_encode(array('status' => true,
    'BalanceId'=> $balanceid));
?>