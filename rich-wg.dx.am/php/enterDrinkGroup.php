<?php
  header('Content-type: application/json');
  
  include 'notify.php';
  include 'authenticate.php';
  
  $token = $_POST['Token'];
  $userid = $_POST["UserId"];
  $timestamp = number_format(round(microtime(true) * 1000), 0, ".", "");
  $customers = explode(',', $_POST["UserIds"]);
  $prodids = explode(',', $_POST["DrinkIds"]);
    
  $users = json_decode(file_get_contents("../json/users.txt"));
  if(!authenticate($userid, $token, 'beer')){
    echo json_encode(array('status' => false, 'error' => 'authentication failed'));
    return;
  }
  
  $products = json_decode(file_get_contents("../json/products.txt"));
  $drinksHistory = json_decode(file_get_contents("../json/drinksHistory.txt"));
  
  $success = false;
  
  $nuserids = [];
  foreach($customers as $c){
    if($c == $userid) $success = true;
    if(array_key_exists($c, $nuserids))
      $nuserids[$c] += 1;
    else
      $nuserids[$c] = 1;
  }
  
  if(!$success){
    echo json_encode(array('status' => false, 'error' => 'entering user must be part of consumer group'));
    return;
  }
  
  $nprodids = [];
  foreach($prodids as $c){
    if(array_key_exists($c, $nprodids))
      $nprodids[$c] += 1;
    else
      $nprodids[$c] = 1;
  }
  
  $newentries = [];
  
  foreach($nuserids as $id => $n){
    $exists = false;
    foreach($users as $user){
      if($user->Id == $id){
        $exists = true;
        break;
      }
    }
    if(!$exists){
      echo json_encode(array('status' => false, 'error' => 'invalid user id in user ids'));
      return;
    }
    foreach($nprodids as $prod => $countprod){
      $success = false;
      $noti_products = "";
      foreach($products as $knownprod){
        if($knownprod->Id == $prod){
          $noti_products.=$knownprod->Name." ";
          $newentry['ProductId'] = $prod;
          $newentry['UserId'] = $id;
          $newentry['Ratio'] = $countprod * $n / count($customers);
          $newentry['Timestamp'] = $timestamp++;
          $success=true;
          break;
        }
      }
      if(!$success){
        echo json_encode(array('status' => false, 'error' => 'product '.$prod.' could not be found in known products'));
        return;
      }
      array_push($drinksHistory, $newentry);
      array_push($newentries, $newentry);
      //Notification
      notifyMany("MultiDrink", $noti_products, $_POST["UserIds"]);
    }
  }  
  
  file_put_contents('../json/drinksHistory.txt', json_encode($drinksHistory));
  echo json_encode(array('status' => true, 'data' => $newentries));
?>