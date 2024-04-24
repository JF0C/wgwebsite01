<?php
  header('Content-type: application/json');
  
  $token = $_POST['Token'];
  $userid = $_POST["UserId"];
  $file = $_POST["File"];
  $users = json_decode(file_get_contents("../json/users.txt"));
  
  $photoDataPath = "../ckcycling/json/photoData.txt";
  if(!file_exists($photoDataPath)){
    file_put_contents($photoDataPath, '[]');
  }
  $photoData = json_decode(file_get_contents($photoDataPath));
  
  for($k = 0; $k < count($users); $k++)
  {
    if($users[$k]->Id == $userid && $users[$k]->Token == $token && strpos($users[$k]->Permissions, 'tour_admin') !== false)
    {
      for($l = 0; $l < count($photoData); $l++){
        if($photoData[$l]->file == $file){
          array_splice($photoData, $l, 1);
          file_put_contents($photoDataPath, json_encode($photoData));
          echo json_encode(array(
            'status' => true,
            'photos' => $photoData
          ));
          return;
        }
      }
      
    }
  }
  echo json_encode(array(
    'status' => false
  ));
?>