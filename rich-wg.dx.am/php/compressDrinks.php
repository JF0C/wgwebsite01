<?php
function compressDrinks(){
  $drinksHistory = json_decode(file_get_contents("../json/drinksHistory.txt"));
  $products = json_decode(file_get_contents("../json/products.txt"));
  if(count($drinksHistory) < 1000) return;
  $cumulatives = [];
  $old = [];
  $timestamp = number_format(round(microtime(true) * 1000), 0, ".", "");
  for($k = 0; $k < count($drinksHistory); $k++){
    $d = $drinksHistory[$k];
    $found = false;
    for($m = 0; $m < count($cumulatives); $m++){
      if($d->UserId != $cumulatives[$m]['UserId']) continue;
      $found = true;
      if($d->ProductId != -2) array_push($old, $d);
      $cumulatives[$m]['NEntries'] += 1;
      if($d->ProductId == -1 || $d->ProductId == -2) $cumulatives[$m]['Amount'] += floor(100*floatval($d->Amount));
      else{
        foreach($products as $p){
          if($p->Id != $d->ProductId) continue;
          $cumulatives[$m]['Amount'] -= floor(100*floatval($p->Cost* floatval($d->Ratio)));
          break;
        }
      }
      break;
    }
    if($found === false){
      $newentry = [];
      $newentry['UserId'] = $d->UserId;
      $newentry['ProductId'] = -2;
      $newentry['Timestamp'] = $timestamp;
      $newentry['NEntries'] = 1;
      if($d->ProductId == -1 || $d->ProductId == -2) $newentry['Amount'] = floor(100*floatval($d->Amount));
      else{
        foreach($products as $p){
          if($p->Id != $d->ProductId) continue;
          $newentry['Amount'] = floor(100*(-floatval($p->Cost) * floatval($d->Ratio)));
          break;
        }
      }
      array_push($cumulatives, $newentry);
    }
  }
  for($m = 0; $m < count($cumulatives); $m++){
    $cumulatives[$m]['Amount'] /= 100;
  }
  file_put_contents('../json/drinksHistory'.$timestamp.'.txt', json_encode($drinksHistory));
  file_put_contents('../json/drinksHistory.txt', json_encode($cumulatives));
}
?>