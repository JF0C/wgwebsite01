<?php
include 'notify.php';

$timestamp = number_format(round(microtime(true) * 1000), 0, ".", "");
$balances = json_decode(file_get_contents('json/balances.txt'));
$history = json_decode(file_get_contents("json/karmaHistory.txt"));
$tasks = json_decode(file_get_contents("json/karmaTasks.txt"));
$balanceid = 0;

$balanceinterval = 1000*60*60*24*61; //ms*s*m*h*d
$freqLearnRate = .5;


foreach($balances as $balance){
  if($balance->Id == -1){
    $nextduedate = $balance->Date;
  }
  else{
    if($balance->Id >= $balanceid){
      $balanceid = $balance->Id + 1;
    }
  }
}
if($nextduedate < $timestamp){
  for($k = 0; $k < count($balances); $k++){
    if($balances[$k]->Id == -1){
      $balances[$k]->Date = $timestamp + $balanceinterval;
    }
  }
  $newentry = [];
  $newentry['Date'] = $timestamp;
  $newentry['Id'] = $balanceid;
  $newentry['Users'] = [];
  $newentry['Balanced'] = 'false';
  $frequencies = [];
  foreach($history as &$ent){
    $entry = get_object_vars($ent);
    foreach($tasks as &$t){
      $task = get_object_vars($t);
      if($task['Id'] == $entry['KarmaTaskId'] ){
        if(array_key_exists(''.$entry['UserId'], $newentry['Users'])){
          $newentry['Users'][''.$entry['UserId']] += (int)($task['Karma']);
        }
        else{
          $newentry['Users'][''.$entry['UserId']] = (int)($task['Karma']);
        }
        if(array_key_exists(''.$task['Id'], $frequencies)){
          $frequencies[''.$task['Id']] += 1;
        }
        else{
          $frequencies[''.$task['Id']] = 1;
        }
      }
    }
  }
  echo '<script> const freqs = '.json_encode($frequencies).';</script>';
  array_push($balances, $newentry);
  file_put_contents('json/balances.txt', json_encode($balances));
  
  $max = 0;
  $best_user = -1;
  foreach($newentry['Users'] as $u){
    if($newentry['Users'][$u] > $max){$max = $newentry['Users'][$u]; $best_user= $u;}
  }
  //Notification
  notifyMany("KarmaBalance", $nextduedate, $best_user);
  
  foreach($frequencies as $id => $freq){
    for($k = 0; $k < count($tasks); $k++){
      if($tasks[$k]->Id == $id){
        if(array_key_exists('Frequency', $tasks[$k])){
          $f = $tasks[$k]->Frequency;
          $tasks[$k]->Frequency = $f + $freqLearnRate * ($freq - $f);
        }
        else{
          $tasks[$k]->Frequency = $freq;
        }        
      }
    }
  }
  
  for($k = 0; $k < count($tasks); $k++){
    $hasfrequency = false;
    foreach($frequencies as $id => $freq){
      if($tasks[$k]->Id == $id){
        $hasfrequency = true;
        if(array_key_exists('Frequency', $tasks[$k])){
          $f = $tasks[$k]->Frequency;
          $tasks[$k]->Frequency = $f + $freqLearnRate * ($freq - $f);
        }
        else{
          $tasks[$k]->Frequency = $freq;
        }        
      }
    }
    if(!$hasfrequency){
      if(array_key_exists('Frequency', $tasks[$k])){
          $f = $tasks[$k]->Frequency;
          $tasks[$k]->Frequency = $f - $freqLearnRate * $f;
        }
        else{
          $tasks[$k]->Frequency = 0;
        }
    }
  }
  file_put_contents('json/karmaTasks.txt', json_encode($tasks));
  rename('json/karmaHistory.txt', 'json/karmaHistory'.$timestamp.'.txt');
  file_put_contents('json/karmaHistory.txt', '[]');
}

echo '<script> const balances = '.file_get_contents('json/balances.txt').';</script>';
?>