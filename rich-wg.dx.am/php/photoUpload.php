<?php
  header('Content-type: application/json');
  
  $token = $_POST['Token'];
  $userid = $_POST["UserId"];
  $title = $_POST["Title"];
  $rotation = $_POST["Rotation"];
  $description = $_POST["Description"];
  $coordinates = $_POST["Coordinates"];
  $track = $_POST["Track"];
  $users = json_decode(file_get_contents("../json/users.txt"));
  
  $indexFile = "../ckcycling/photos/index.txt";
  if(!file_exists($indexFile)){
    file_put_contents($indexFile, '1');
  }
  $photoIndex = (int)file_get_contents($indexFile);
  
  $photoDataPath = "../ckcycling/json/photoData.txt";
  if(!file_exists($photoDataPath)){
    file_put_contents($photoDataPath, '[]');
  }
  $photoData = json_decode(file_get_contents($photoDataPath));
  
  for($k = 0; $k < count($users); $k++)
  {
    if($users[$k]->Id == $userid && $users[$k]->Token == $token && strpos($users[$k]->Permissions, 'tour_admin') !== false)
    {
      move_uploaded_file($_FILES['file']['tmp_name'], "../ckcycling/photos/img$photoIndex.jpg");
      $new_entry['file'] = "img$photoIndex.jpg";
      $new_entry['title'] = $title;
      $new_entry['description'] = $description;
      $new_entry['coordinates'] = $coordinates;
      $new_entry['track'] = $track;
      $new_entry['rotation'] = $rotation;
      array_push($photoData, $new_entry);
      file_put_contents($photoDataPath, json_encode($photoData));
      file_put_contents($indexFile, "".($photoIndex + 1));
      echo json_encode(array(
        'status' => true,
        'photos' => $photoData
      ));
      return;
    }
  }
  echo json_encode(array(
    'status' => false
  ));
?>