<?php
  header('Content-type: application/json');
  
  $token = $_POST['Token'];
  $userid = $_POST["UserId"];
  $title = $_POST["Title"];
  $description = $_POST["Description"];
  $rotation = $_POST["Rotation"];
  //$coordinates = $_POST["Coordinates"];
  //$track = $_POST["Track"];
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
          $photoData[$l]->description = $description;
          $photoData[$l]->title = $title;
          $photoData[$l]->rotation = $rotation;
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