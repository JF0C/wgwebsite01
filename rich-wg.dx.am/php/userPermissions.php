<?php
    $username = $_POST["username"];
    $token = $_POST["token"];
	$current_user = 'null';
    $users = json_decode(file_get_contents("../json/users.txt"));
    foreach($users as $user)
	{
	  if ($username == $user->Name && $token == $user->Token){
	  	$current_user = $user;
	  	break;
	  }
	}
    if ($current_user == 'null') {
        echo '{"status": "error, user not found"}';
    }
    else {
        echo '{
            "status": "success",
            "permissions":"'.$current_user->Permissions.'", 
            "id":'.$current_user->Id.',
            "name":"'.$current_user->Name.'"
        }';
    }
?>