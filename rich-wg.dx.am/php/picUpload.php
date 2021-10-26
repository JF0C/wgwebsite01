<?php
  header('Content-type: application/json');
  
  $token = $_POST['Token'];
  $userid = $_POST["UserId"];
  $users = json_decode(file_get_contents("../json/users.txt"));
  
  for($k = 0; $k < count($users); $k++)
  {
    if($users[$k]->Id == $userid && $users[$k]->Token == $token)
    {
      move_uploaded_file($_FILES['file']['tmp_name'], "../Images/profile-pic-$userid.jpg");
      echo json_encode(array(
        'status' => true
      ));
      return;
    }
  }
  echo json_encode(array(
    'status' => false
  ));
?>