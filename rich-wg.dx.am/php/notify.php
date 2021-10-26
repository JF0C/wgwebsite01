<?php
  function notifyMany($notification, $object, $agent){
    $users = json_decode(file_get_contents("../json/users.txt"));
    foreach($users as $u){
      notify($notification, $u->Id, $object, $agent);
    }
  }
  
  function notify($notification, $recipient, $object, $agent){
    $users = json_decode(file_get_contents("../json/users.txt"));
    $notis = json_decode(file_get_contents("../json/notifications.txt"));
    $user = null;
    $agen = null;
    $valid = false;
    foreach($users as $u){
      if($u->Id == $recipient){
        $user = $u;
      }
      if($u->Id == $agent){
        $agen = $u;
      }
    }
    foreach($notis as $n){
      if(!array_key_exists('Notifications', $user)){
        return;
      }
      if(strpos($user->Notifications, $n->Name) === false){
        return;
      }
      if($n->Name == $notification){
        $reqs = explode(' ', $n->Requires);
        foreach($reqs as $r){
          if(strpos($user->Permissions, $r) === false){
            // echo json_encode(array('status' => false, 'error' => 'user '.$user->Name.' has no permission for this notification '.$notification));
            return;
          }
        }
      }
    }
    if(!array_key_exists('Mail', $user)){
      // echo json_encode(array('status' => false, 'error' => 'user has no mail address '.$user->Name));
      return;
    }
    
    $text = "Hallo ".$user->Name.",\r\n\r\n";
    $name = $agen->Name." hat";
    if($agent == $recipient) $name = "Du hast";
    $subject = '';
  
    switch($notification){
      case "Drinks":
        $text.=$name." gerade ".$object." getrunken.\r\nMach mit auf http://www.rich-wg.dx.am/.";
        $subject = $object." für ".$agen->Name;
        break;
      case "KarmaDone":
        $text.=$name." gerade ".$object." erledigt.\r\nTue auch etwas für die WG auf http://www.rich-wg.dx.am/.";
        $subject = $object." erledigt";
        break;
      case "KarmaTransfer":
        $text.=$name." Dir gerade ".$object." Karma überwiesen.\r\nDeine Karmaübersicht findest Du auf http://www.rich-wg.dx.am/.";
        $subject="Karma erhalten";
        break;
      case "BeerCancel":
        $text.=$agen->Name." möchte ein ".$object." stornieren.\r\nBearbeite die Anfrage auf http://www.rich-wg.dx.am/.";
        $subject = "Stornoanfrage";
        break;
      case "KarmaModify":
        $text.=$name." gerade die Karma-Aufgabe ".$object." modifiziert.\r\nSchau nach auf http://www.rich-wg.dx.am/.";
        $subject = $object." bearbeitet";
        break;
      case "NewUser":
        $text.=$name." gerade einen neuen Nutzer hinzugefügt: ".$object.".\r\nSchau nach auf http://www.rich-wg.dx.am/.";
        $subject = "Neuer Nutzer ".$object;
        break;
      case "KarmaList":
        $text.=$name." gerade die Karma-Aufgabe ".str_replace('_', ' ', $object)." zu aktuelle Aufgaben hinzugefügt.\r\nErledige Aufgaben auf http://www.rich-wg.dx.am/.";
        $subject = $object." ist zu erledigen";
        break;
      case "ShoppingList":
        $text.=$name." gerade ".$object." zur Einkaufsliste hinzugefügt.\r\nSieh Dir die Einkaufsliste auf http://www.rich-wg.dx.am/ an.";
        $subject.=$object." zur Einkaufsliste hinzugefügt";
        break;
      case "ShoppingDone":
        $text.=$name." gerade ".$object." eingekauft.\r\nSieh Dir die Einkaufsliste auf http://www.rich-wg.dx.am/ an.";
        $subject.=$object." gekauft";
        break;
      case "Payment":
        $text.=$name." Dir gerade".$object."€ Guthaben für die Getränkeliste eingetragen.\r\nÜberprüfe dein Guthaben auf http://www.rich-wg.dx.am/.";
        $subject = "Guthaben erhöht";
        break;
      case "DebtReminder":
        $text.="Du hast gerade".$object."€ schulden in unserer Getränkeliste.\r\nZahle jetzt über paypal.me/FistofChen/".str_replace(',', '.', $object);
        $subject = "Schulden in der R.I.C.H. WG";
        break;
      case "KarmaBalance":
        $text.=$name." am meisten Karma in der Abrechnung zum ".$object.".\r\nSchau Dir die Abrechnung auf http://www.rich-wg.dx.am/ an.";
        $subject = "Karma-Abrechnung";
        break;
      case "SiteUpdate":
        $text.=$object;
        $subject="R.I.C.H. WG Website Update";
        break;
      case "NewProduct":
        $text.="Es gibt jetzt ".$object." im R.I.C.H. WG Kühlschrank!";
        $subject = "Neue Getränke";
        break;
      case "MultiDrink":
        $names = "";
        foreach($users as $u){
          foreach(explode(',', $agent) as $a){
            if($u->Id == $a){
              $names.=$u->Name.", ";
            }
          }
        }
        $text.= $names." trinken gerade ".$object;
        $subject.="Es wird ".$object." getrunken!";
        break;
      default:
        echo json_encode(array('status' => false, 'error' => 'invalid notification '.$notification));
        return;
    }
    
    //echo "Mail: ".$user->Mail." Subject: ".$subject." Text: ".$text;
    
    //return;
    $header = "From: Rainer <rainer@rich-wg.dx.am>\r\n";
    mail($user->Mail, $subject, $text, $header);
  }
?>