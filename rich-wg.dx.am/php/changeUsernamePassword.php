<?php
  header('Content-type: application/json');
  include 'authenticate.php';
  
  $token = $_POST['Token'];
  $userid = $_POST["UserId"];
  $username = $_POST['newusername'];
  $password = hash("sha256", $_POST["newpassword"]);
  
  $users = json_decode(file_get_contents("../json/users.txt"));
  $namechanged = false;
  $passchanged = false;
  function isHTML($string){
    if($string != strip_tags($string))
    {
      return true;
    }
    else
    {
      return false;
    }
  }
  
  if(!authenticate($userid, $token, "")){
    echo json_encode(array('status' => "authentication failed"));
    return;
  }
  
  if(isHTML($username) or strpos($username, ":") !== false or strpos($username, ";") !== false or strpos($username, "}") !== false or strpos($username, '"') !== false or strpos($username, "'") !== false)
  {
    echo json_encode(array(
      'status' => false
    ));
    return;
  }
  
  for($k = 0; $k < count($users); $k++)
  {
    if($users[$k]->Id == $userid && $users[$k]->Token == $token)
    {
      if($password != "" and $users[$k]->Token != $password)
      {
        $users[$k]->Token = $password;
        $passchanged = true;
      }
      if($username != "" and $users[$k]->Name != $username)
      {
        $users[$k]->Name = $username;
        $namechanged = true;
      }
      if($namechanged or $passchanged)
      {
        file_put_contents("../json/users.txt", json_encode($users));
        echo json_encode(array(
          'status' => true,
          'changed_password' => $passchanged,
          'changed_username' => $namechanged,
          'newtoken' => $password
        ));
        return;
      }
    }
  }
  
?>