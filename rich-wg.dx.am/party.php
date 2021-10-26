<html>
    <head>
        <meta charset="UTF-8">
        <script src="./js/jquery-3.3.1.min.js"></script>
        <script src="./js/svg.min.js"></script>
        <script src="./js/party.js"></script>
        <link rel="stylesheet" href="./css/partystyle.css">
        <meta name="viewport" content="width=device-width, user-scalable=no" />
        <title><?php $info = json_decode(file_get_contents("./party/info.json")); echo $info->title?> </title>
    </head>
    <body>
        <?php
          echo "<script>";
          $id = htmlspecialchars($_GET["id"]);
          $guests = json_decode(file_get_contents("./party/guests.json"));
          $info = json_decode(file_get_contents("./party/info.json"));
          $found = false;
          if($id == 'muster'){
              $found = true;
              echo 'const userdata = {"lang": "DE",'.
                  '"id": "muster",'.
                  '"name": "Max Mustermann",'.
                  '"gender": "m",'.
                  '"status": "open",'.
                  '"visited": true,'.
                  '"title": "'.$info->title.'",'.
                  '"subtitle": "'.$info->subtitle.'"};'."\n";
          }
          else{
          
              foreach($guests as $guest){
                  if($guest->id != $id) continue;
                  $found = true;
                  echo 'const userdata = {'.
                    '"id": "'.$guest->id.'",'.
                    '"name": "'.$guest->name.'",'.
                    '"lang": "'.$guest->lang.'",'.
                    '"gender": "'.$guest->gender.'",'.
                    '"status": "'.$guest->status.'",'.
                    '"visited": "'.$guest->visited.'",'.
                    '"title": "'.$info->title.'",'.
                    '"subtitle": "'.$info->subtitle.'"};'."\n";
                  $guest->visited = true;
                  break;
              }
          }
          file_put_contents("./party/guests.json", json_encode($guests));
          echo "const articles = ".file_get_contents("./party/articles.json").";\n";
          echo "const replacements = ".file_get_contents("./party/replacements.json").";\n";
          echo "</script>";
          if(!$found){
            echo '<div style="text-align: center; font-size:30px">404: Not Found</div><div id="logo-container"><svg id="logo"></svg></div>'.
              '<script>createLogo()</script>'.
              '</body></html>';
            return;
          }
          
        ?>
        <div id="title">
            <div id="title-text">
                <span id="title-text-text"></span>
                <div id="title-background"></div>
                <div id="sidebar-toggle"><img src="../Icons/bars-w.svg" style="height: 30px;"></div>
                <div id="language-toggle"></div>
            </div>
            
            <div id="logo-container">
                <svg id="logo"></svg>
            </div>
            <div id="subtitle"></div>
            <div id="status-info"></div>
        </div>    
        <div id="sidebar"></div>
        <div id="text-container"></div>
    </body>
</html>