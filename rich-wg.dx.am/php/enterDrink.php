<?php
  header('Content-type: application/json');
  
  include 'notify.php';
  include 'authenticate.php';
  include 'compressDrinks.php';
  
  $token = $_POST['Token'];
  $userid = $_POST["UserId"];
  $timestamp = number_format(round(microtime(true) * 1000), 0, ".", "");
  $productid = $_POST["ProductId"];
  $customerid = $_POST["CustomerId"];
  $amount = $_POST['Amount'];
  
  
  if(!authenticate($userid, $token, 'beer')){
    echo json_encode(array('status' => false, 'error' => 'authentication failed'));
    return;
  }
  if($productid != -1 and $amount <= 0){
    echo json_encode(array('status' => false, 'error' => 'amount of drink must be greater than 0'));
    return;
  }
  
  $products = json_decode(file_get_contents("../json/products.txt"));
  $drinksHistory = json_decode(file_get_contents("../json/drinksHistory.txt"));
  
  $success = false;
  
  if($productid == -1){
    $newentry['UserId'] = $customerid;
    $newentry['ProductId'] = $productid;
    $newentry['Timestamp'] = $timestamp;
    $newentry['Amount'] = $amount;
    array_push($drinksHistory, $newentry);
    $success = true;
    //Notification
    notify("Payment", $customerid, $amount, $userid);
  }
  else{
    foreach($products as $prod){
      if($prod->Id == $productid and !$prod->Expired){
        $newentry['UserId'] = $userid;
        $newentry['ProductId'] = $productid;
        $newentry['Timestamp'] = $timestamp;
        $newentry['Ratio'] = 0 + $amount;
        array_push($drinksHistory, $newentry);
        $success = true;
        //Notification
        notifyMany("Drinks", $newentry['ProductId'], $userid);
      }
    }
  }
  
  if(!$success){
    echo json_encode(array('status' => false, 'error' => 'invalid product details'));
    return;
  }
  
  file_put_contents('../json/drinksHistory.txt', json_encode($drinksHistory));
  compressDrinks();
  echo json_encode(array('status' => true, 'data' => $newentry));
?>