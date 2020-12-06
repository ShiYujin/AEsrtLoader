
var currentComp = app.project.activeItem;


function saveSrt(currentTextContent) {

	/// Check if comp and layer selected
	if (currentComp && currentComp instanceof CompItem) {

		var targetLayer = currentComp.selectedLayers;

		if (targetLayer.length != 0) {
			if (targetLayer[0].property("ADBE Marker").numKeys < 2) {
				alert("The selected layer doesn't have markers. Please add markers")
				return
			}
			// crete file on drive
			var tempFile = new File;
			tempFile = tempFile.saveDlg("Name", "*.srt");

			if (tempFile != null) { //check if it press Esc key

				var testForFileExtension = RegExp('\.srt', 'g');
				tempFile = testForFileExtension.test(tempFile.toString()) == true ? tempFile : tempFile.toString() + ".srt";

				var defaultsDoc = new File(tempFile);




				defaultsDoc.encoding = "binary";
				defaultsDoc.open("w");
				defaultsDoc.write(createSrtFormat(currentTextContent));
				defaultsDoc.close();
			}

		} else {
			alert("Fierst select the text layer you want to save");
		}

	} else {
		alert("Fierst select the text layer you want to save");
	}

	function createSrtFormat(currentTextContent) {

		var srtFormatString = "";

		var markerStart_t;
		var markerEnd_t;
		var markerComment;

		var contentArr = currentTextContent.split("\n");

		var markerTimeArr = getMarkersTime();

		//alert(markerTimeArr)

		var numTextLines = contentArr.length;
		var numMarkers = markerTimeArr.length;
		var conter = numMarkers > numTextLines ? numTextLines : numMarkers;




		for (i = 0; i < conter; i++) {

			markerStart_t = markerTimeArr[i][0];
			markerEnd_t = markerTimeArr[i][1];

			markerComment = contentArr[i];

			if (markerStart_t == markerEnd_t) {
				markerEnd_t = markerEnd_t - .01;
			}

			var returnKey = "\n";
			srtFormatString += (i + 1) + returnKey + sec2time(markerStart_t).toString() + " --> " + sec2time(markerEnd_t).toString() + returnKey + markerComment + returnKey + returnKey;

		}

		return srtFormatString
	}


}

function getMarkersTime() {
	var tempArrTime = [];
	var currStartTime;
	var currEndTime;
	var tLayer = currentComp.selectedLayers[0];
	var markerObj = tLayer.property("ADBE Marker");

	for (var i = 1; i < markerObj.numKeys; i++) {
		//alert(tLayer.marker.reflect.properties.toString().replace(/,/g, "\n"))
		//	alert(tLayer.marker.reflect.methods.toString().replace(/,/g, "\n"))

		currStartTime = markerObj.keyTime(i);
		currEndTime = markerObj.keyTime(i + 1);
		//	alert([currStartTime, currEndTime, " - -- -"])
		tempArrTime.push([currStartTime, currEndTime])

		if (markerObj.keyValue(i + 1).comment == "") {
			i++
		}
	}
	tempArrTime.push([currEndTime, tLayer.outPoint]); // last exception
	return tempArrTime
}

function sec2time(timeInSeconds) {
	var pad = function (num, size) { return ('000' + num).slice(size * -1); },
		time = parseFloat(timeInSeconds).toFixed(3),
		hours = Math.floor(time / 60 / 60),
		minutes = Math.floor(time / 60) % 60,
		seconds = Math.floor(time - minutes * 60),
		milliseconds = time.slice(-3);

	return pad(hours, 2) + ':' + pad(minutes, 2) + ':' + pad(seconds, 2) + ',' + pad(milliseconds, 3);
}

function maxWordsOnLine(text_Line, max_wors) {

	var maxNumWords = max_wors;

	var currentLineArr = text_Line.split(" ");
	var newTextLine = "";
	var breakPoint = " ";


	for (var i = 0; i < currentLineArr.length; i++) {
		// join back line sting
		if (maxNumWords <= i) { // add a line break
			breakPoint = "\n";
			maxNumWords += max_wors;
		}
		newTextLine += (breakPoint + currentLineArr[i].replace(" ", ""));
		breakPoint = " "; // reset
	}
	return newTextLine //cleanUpText(newTextLine)
}
