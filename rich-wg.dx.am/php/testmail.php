<?php
//for($k = 0; $k < 30; $k++){
//  mail('jan4beer@web.de', 'Test '.$k, 'Hallo, est test.', "From: Rainer <rainer@rich-wg.dx.am>");

//}
$res = http_get("http://foc.pythonanywhere.com/mail/test2");
echo $res;
?>