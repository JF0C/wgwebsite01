<?php
  header('Content-type: application/json');
  
  include 'checkString.php';
  include 'notify.php';
  include 'authenticate.php';
  
  $token = $_POST['Token'];
  $userid = $_POST["UserId"];
  $timestamp = number_format(round(microtime(true) * 1000), 0, ".", "");
  $productid = $_POST["ProductId"];
  $productname = $_POST["ProductName"];
  $cost = $_POST["ProductCost"];
  $disable = $_POST["Disable"];
  
  $users = json_decode(file_get_contents("../json/users.txt"));
  
  if(!authenticate($userid, $token, 'beer_admin')){
    echo json_encode(array('status' => false, 'error' => 'authentication failed'));
    return;
  }
  
  $products = json_decode(file_get_contents("../json/products.txt"));
  
  $invchar = false;
  if($disable != "true" and $disable != "false") $invchar = true;
  if($disable == "false" and (!checkStringNum($cost) or !checkString($productname) or strlen($cost) < 1 or strlen($productname) < 1 )) $invchar = true;
  if($invchar){
    echo json_encode(array('status' => false, 'error' => 'invalid characters used', 'cost' => $cost, 'name' => $productname, 'disable' => $disable));
    return;
  }
  
  $success = false;
  
  if($disable == "true"){
    for($k = 0; $k < count($products); $k++){
      if($products[$k]->Id == $productid){
        $products[$k]->Expired = true;
        $success = true;
      }
    }
  }
  else{
    $reactivated = false;
    for($k = 0; $k < count($products); $k++){
      $prod = $products[$k];
      if($prod->Id == $productid and $prod->Cost == $cost and $prod->Name == $productname){
        $products[$k]->Expired = false;
        $newentry = $products[$k];
        $success = true;
        $reactivated = true;
        break;
      }
    }
    if(!$reactivated){
      $id = 0;
      foreach($products as $prod){
        if($prod->Id >= $id){
          $id = $prod->Id + 1;
        }
      }
      $newentry = [];
      $newentry['Name'] = $productname;
      $newentry['Cost'] = floatval($cost);
      $newentry['Expired'] = false;
      $newentry['Id'] = $id;
      
      // Notification
      notifyMany('NewProduct', $productname, $userid);
      array_push($products, $newentry);
      $success = true;
    }
  }
  if(!$success){
    echo json_encode(array('status' => false, 'error' => 'invalid product details', 'newentry' => $newentry));
    return;
  }
  
  file_put_contents('../json/products.txt', json_encode($products));
  echo json_encode(array('status' => true, 'data' => $newentry));
?>