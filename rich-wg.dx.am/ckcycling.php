
<?php
echo '<html>
<head>
	<meta charset="UTF-8" name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
	<link rel="stylesheet" href="./ckcycling/css/MarkerCluster.css"/>
	<link rel="stylesheet" href="./ckcycling/css/MarkerCluster.Default.css"/>
	<link rel="stylesheet" href="./ckcycling/css/leaflet.css"/>
	<link rel="stylesheet" href="./ckcycling/css/cyclingstyle.css"/>
	<link rel="stylesheet" href="./ckcycling/css/arrows.css"/>
	
  	<script type="text/javascript" src="./js/jquery-3.3.1.min.js"></script>
	<script type="text/javascript" src="./ckcycling/js/common.js"></script>
	<script type="text/javascript" src="./ckcycling/js/GPXParser.min.js"></script>
	<script type="text/javascript" src="./ckcycling/js/leaflet.js"></script>
	<script type="text/javascript" src="./ckcycling/js/leaflet.markercluster-src.js"></script>
	<script type="text/javascript" src="./ckcycling/js/arrows.js"></script>
	<script type="text/javascript" src="./ckcycling/js/photos.js"></script>
	<script type="text/javascript" src="./ckcycling/js/authorize.js"></script>
</head>
<body>
	<h1>CKCYCLING TOURS</h1>
	<div id="controls">
		<!--TODO: multiselect with https://www.cssscript.com/filterable-checkable-multi-select/ -->
		<select onchange="tourSelect()" class="control-element" id="tour-select">
			
		</select>
		<select onchange="trackSelect()" class="control-element" id="track-select">

		</select>
		<button id="info-button" class="control-element" onclick="toggleInfo()">i</button>
	</div>
	<div class="row">
		<div id="map-container" class="column" style="width: 100%; height: 85%;">
			<div id="map"></div>
		</div>
		<div id="info-container" class="column" style="display: none; padding: 5px;">
			
		</div>
	</div>
	<div id="loading-overlay">
		<div id="loading-icon">
			<div class="lds-ring"><div></div><div></div><div></div><div></div></div>
		</div>
	</div>
	<div style="display:none;" id="photo-overlay">
		<h1 id="photo-title-container"><span id="photo-view-title">Hello</span><span style="float: right;" onclick="closeFullscreen()">x</span></h1>
		<div id="photo-body">
			<div id="fullscreen-photo-container">
				<img id="fullscreen-photo" style="width:-webkit-fill-available;"/>
			</div>
			<div class="photo-content" id="photo-description"></div>
			<div class="photo-content" id="photo-tour"></div>
		</div>
	</div>
	<script type="text/javascript" src="./ckcycling/js/main.js"></script>
</body>
</html>'
?>