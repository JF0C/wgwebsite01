<?php
function getUTF16CodeUnits($string) {
    $string = substr(json_encode($string), 1, -1);
    preg_match_all("/\\\\u[0-9a-fA-F]{4}|./mi", $string, $matches);
    return $matches[0];
}

function JS_StringLength($string) {
    return count(getUTF16CodeUnits($string));
}

function JS_charCodeAt($string, $index) {
    $utf16CodeUnits = getUTF16CodeUnits($string);
    $unit = $utf16CodeUnits[$index];
    
    if(strlen($unit) > 1) {
        $hex = substr($unit, 2);
        return hexdec($hex);
    }
    else {
        return ord($unit);
    }
}

function checkString($str, $more=[]){
  for($k=0; $k < JS_StringLength($str); $k++) {
    $c = JS_charCodeAt($str, $k);
    if($c >= 48 and $c <= 57) continue; //0-9
    if($c >= 97 and $c <= 122) continue;
    if($c >= 65 and $c <= 90) continue;
    if($c >= 44 and $c <= 46) continue;
    if($c == 95 or $c == 228 or $c == 246 or $c == 252 or $c == 196 or $c == 214 or $c == 220 or $c == 223) continue;
    $checkmore = false;
    for($l = 0; $l < count($more); $l++){
      if($c == $more[$l]) $checkmore = true;
    }
    if($checkmore) continue;
    return false;
  }
  return true;
}


function checkStringNum($str){
  for($k = 0; $k < JS_StringLength($str); $k++){
    $c = JS_charCodeAt($str, $k);
    if($c >= 48 and $c <= 57) continue; //0-9
    if($c == 45 or $c == 46) continue;
    return false;
  }
  return true;
}
?>