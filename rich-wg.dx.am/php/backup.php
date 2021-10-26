<?php
function backup($mailto, $force){

  if(!$force){
    $lastbackup = file_get_contents('json/lastBackup.txt');
    $dt = date_create_from_format('m/d/Y h:i:s a', $lastbackup);
    $now = date_create_from_format('m/d/Y h:i:s a', date('m/d/Y h:i:s a', time()));
  
    if(date_diff($dt, $now)->d < 7){ 
      //echo $lastbackup;
      return;
    }
    $lastbackup = date('m/d/Y h:i:s a', time());
    file_put_contents('json/lastBackup.txt', $lastbackup);
  }
  // Get real path for our folder
  $rootPath = realpath('../');

  // Initialize archive object
  $zip = new ZipArchive();
  $zip->open('file.zip', ZipArchive::CREATE | ZipArchive::OVERWRITE);

  // Create recursive directory iterator
  /** @var SplFileInfo[] $files */
  $files = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($rootPath),
    RecursiveIteratorIterator::LEAVES_ONLY
  );

  foreach ($files as $name => $file)
  {
    // Skip directories (they would be added automatically)
    if (!$file->isDir())
    {
        // if (strpos($file, 'Icons') !== false) continue;
        if (strpos($file, 'Images') !== false) continue;
        // Get real and relative path for current file
        $filePath = $file->getRealPath();
        $relativePath = substr($filePath, strlen($rootPath) + 1);

        // Add current file to archive
        $zip->addFile($filePath, $relativePath);
    }
  }

  // Zip archive will be created only after closing object
  $zip->close();
  
  date_default_timezone_set('Germany/Berlin');
 
  $file = 'file.zip';
  $content = file_get_contents( $file);
  $content = chunk_split(base64_encode($content));
  $uid = md5(uniqid(time()));
  
  unlink('file.zip');
  
  $from_name = 'Rainer';
  $from_mail = 'rainer@rich-wg.dx.am';
  $filename = 'Backup '.date('m/d/Y h:i:s a', time()).'.zip';
  $message = 'This is an automated backup of the current state of the rich-wg.dx.am website.';
  $subject = 'rich-wg.dx.am Backup '.date('m/d/Y h:i:s a', time());

  // header
  $header = "From: ".$from_name." <".$from_mail.">\r\n";
  $header .= "MIME-Version: 1.0\r\n";
  $header .= "Content-Type: multipart/mixed; boundary=\"".$uid."\"\r\n\r\n";

  // message & attachment
  $nmessage = "--".$uid."\r\n";
  $nmessage .= "Content-type:text/plain; charset=iso-8859-1\r\n";
  $nmessage .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
  $nmessage .= $message."\r\n\r\n";
  $nmessage .= "--".$uid."\r\n";
  $nmessage .= "Content-Type: application/octet-stream; name=\"".$filename."\"\r\n";
  $nmessage .= "Content-Transfer-Encoding: base64\r\n";
  $nmessage .= "Content-Disposition: attachment; filename=\"".$filename."\"\r\n\r\n";
  $nmessage .= $content."\r\n\r\n";
  $nmessage .= "--".$uid."--";

  if (mail($mailto, $subject, $nmessage, $header)) {
    //echo 'done'; // Or do something here
  } else {
    //echo 'error';
  }

  // $success = $email->Send();
  // mail('jan4beer@web.de', 'rich-wg-website-test', 'test test bla bla', "From: Absender <rainer@rich-wg.dx.am>");
  //echo '\n'.date('m/d/Y h:i:s a', time()).'\n'.$filename;
}
?>