<!DOCTYPE html>
<?php
$users = json_decode(file_get_contents("json/users.txt"));
$username = $_POST["username"];
$token = hash("sha256", $_POST["token"]);
$access_granted = false;
$userid = -1;
$userposition = "";
$setcookies = false;
$permissions = "";

foreach($users as $user)
{
  if(($username == $user->Name or $username == $user->Mail) and ($token == $user->Token))
  {
    $access_granted = true;
    $userid = $user->Id;
    $userposition = $user->BrowsePosition;
    $permissions = $user->Permissions;
    if($_COOKIE["token"] != $user->Token){
      $setcookies = true;
      break;
    }
  }
  if(($_COOKIE["username"] == $user->Name or $_COOKIE["username"] == $user->Mail) and ($user->Token == $_COOKIE["token"]))
  {
    $permissions = $user->Permissions;
    $access_granted = true;
    $userid = $user->Id;
    $userposition = $user->BrowsePosition;
    break;
  }
}

$style='';
foreach($users as $user)
{
  if($user->Id == $userid and isset($user->Theme))
  {
    if($user->Theme == 'dark'){$style='<link rel="stylesheet" href="/css/style_dark.css">';}
  }
}

if($access_granted)
{
echo '<html>
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, user-scalable=no" />
	<title>R.I.C.H. WG</title>

	<link rel="stylesheet" href="/css/style.css">
        '.$style.'

	<script src="/js/jquery-3.3.1.min.js"></script>
	<script type="text/javascript" src="/js/d3.js"></script>
	<script type="text/javascript" src="/js/beer.js"></script>
	<script type="text/javascript" src="/js/main.js"></script>
	<script type="text/javascript" src="/js/notifications.js"></script>
	<script type="text/javascript" src="/js/shopping.js"></script>
	<script type="text/javascript" src="/js/graph.js"></script>';

if(strpos($permissions, 'karma') !== false){
  include 'php/checkBalance.php';
  include 'php/backup.php';
  backup('jan4beer@web.de', false);
}

echo '<script>';
echo 'const userid='.$userid.';';
echo 'const userposition='.$userposition.';';

echo 'const users=[';
foreach($users as $user)
{
  $notis = '';
  if($user->Id == $userid and array_key_exists('Notifications', $user)){
    $notis = ', "Notifications": "'.$user->Notifications.'"';
  }
  echo '{"Id": '.$user->Id.', "Name": "'.$user->Name.'", "Permissions": "'.$user->Permissions.'", "Theme":"'.$user->Theme.'"'.$notis.'},';
}
echo '];';

$perms = file_get_contents("json/permissions.txt");
$perms = str_replace(' ', '","', $perms);
echo 'const validPermissions=["'.$perms.'"];';
echo 'const validNotifications='.file_get_contents("json/notifications.txt").";";

if(strpos($permissions, 'karma') !== false){
  echo 'let karmaHistory=';
  echo file_get_contents("json/karmaHistory.txt");
  echo ';';

  echo 'let karmaTasks=';
  echo file_get_contents("json/karmaTasks.txt");
  echo ';';
}
if(strpos($permissions, 'beer') !== false){
  echo 'let drinksHistory=';
  echo file_get_contents("json/drinksHistory.txt");
  echo ';';
  echo 'let products=';
  echo file_get_contents("json/products.txt");
  echo ';';
  echo 'let toCancel=';
  echo file_get_contents("json/toCancel.txt");
  echo ';';
}
if(strpos($permissions, 'shoppingList') !== false){
  echo 'let shoppingList=';
  echo file_get_contents("json/shoppingList.txt");
  echo ';';
}
if($setcookies)
{
  echo "$(document).ready(function(){document.cookie = 'username=$username;expires=".(time() + (86400 * 7))."';});";
  echo "$(document).ready(function(){document.cookie = 'token=$token;expires=".(time() + (86400 * 7))."';});";
}

echo '</script>';
echo '</head>
<body>
	<div id="title-bar">
		<div id="title-bar-left" class="title-bar-element">left</div>
		<div id="title-bar-center" class="title-bar-element">center</div>
		<div id="title-bar-right" class="title-bar-element">right</div>
	</div>
	<div id="main-frame">
		content
	</div>
	<div id="bottom-menu">
		<div class="bottom-menu">
          <div class="input-group" id="bottom-menu-selector-container">
            <div id="bottom-menu-selector">
              <a class="bottom-menu-button btn btn-primary btn-sm notActive" data-toggle="bottom-menu-value" data-title="1"><img src="Icons/user.svg" class="bottom-menu-icon"/><div class="badge badge-bottom-menu">0</div><div>Account</div></a>
              <a class="bottom-menu-button btn btn-primary btn-sm notActive" data-toggle="bottom-menu-value" data-title="2"><img src="Icons/yin-yang.svg" class="bottom-menu-icon"/><div class="badge badge-bottom-menu">0</div><div>Karma</div></a>
              <a class="bottom-menu-button btn btn-primary btn-sm notActive" data-toggle="bottom-menu-value" data-title="3"><img src="Icons/glass.svg" class="bottom-menu-icon"/><div class="badge badge-bottom-menu">0</div><div>Getränke</div></a>
              <a class="bottom-menu-button btn btn-primary btn-sm notActive" data-toggle="bottom-menu-value" data-title="4"><img src="Icons/shopping-cart.svg" class="bottom-menu-icon"/><div class="badge badge-bottom-menu">0</div><div>Einkäufe</div></a>
              <!--<a class="bottom-menu-button btn btn-primary btn-sm notActive" data-toggle="bottom-menu-value" data-title="5">X2</a>-->
            </div>
            <input type="hidden" name="menu" id="bottom-menu-value" />
          </div>
        </div>
	</div>
        <div style="display:none;">Icons made by <a href="https://www.flaticon.com/authors/dave-gandy" 
          title="Dave Gandy">Dave Gandy</a> from <a href="https://www.flaticon.com/"
          title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/"
          title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>
        <div style="display:none;">more icons from <a href="https://github.com/encharm/Font-Awesome-SVG-PNG/tree/master/black/svg">Font-Awesome</a></div>
</body>
</html>';
}
else
{
  echo file_get_contents('login.php');
}
?>