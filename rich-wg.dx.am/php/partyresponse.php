<?php
  $response = $_POST["response"];
  $lang = $_POST["lang"];
  $id = $_POST["id"];
  
  $guests = json_decode(file_get_contents("../party/guests.json"));
  $timestamp = number_format(round(microtime(true) * 1000), 0, ".", "");
  
  $found = false;
  $status = '';
  
  for($k = 0; $k < count($guests); $k++){
    $g = $guests[$k];
    if($g->id != $id) continue;
    $found = true;
    if($response == "accept"){
      if($g->status == "open") $guests[$k]->status = "accepted";
      if($g->status == "declined") $guests[$k]->status = "requeued";
    }
    if($response == "decline"){
      if($g->status != "confirmed") $guests[$k]->status = "declined";
    }
    if($lang == "EN" || $lang == "DE"){
      $guests[$k]->lang = $lang;
    }
    $status = $guests[$k]->status;
  }
  
  if($found == false){
    echo json_encode(array('success' => 'false'));
    return;
  }
  
  $got = array(
    'id' => $id,
    'success' => true,
    'status' => $status,
    'response' => $response,
    'lang' => $lang
  );
  file_put_contents("../party/guests.json", json_encode($guests));
  echo json_encode($got);
?>