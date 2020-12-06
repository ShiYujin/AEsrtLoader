// ©2016 Stefan Ababei and Codrin Fechete
// Authors: Stefan Ababei and Codrin Fechete
//
// Version History
// 1.0.0 initial release - 02.05.2016
// 1.0.1 update - 19.05.2016
// 1.1.0 update - 21.10.2017
// 1.2.0 update - 27.02.2018

#include SC_Src / script / MathUtils.jsx;
#include SC_Src / script / AFUtils.jsx;
#include SC_Src / script / Defaults.jsx;
#include SC_Src / script / saveSrt.jsx;

(function Template(thisObj) {
	var MAX_WIDTH = 0;



	/***********************************************************
	*	BASIC INITS and MAIN LOGIC:
	*************************************************************/
	if (parseFloat(app.version) < 9.0) {
		alert(Defaults.getLocalization("errorVersionToOld"), Defaults.getLocalization("errorTitleError"), true);
	} else {
		var pallete = buildUI(thisObj);
		if (pallete instanceof Window) {
			pallete.center();
			pallete.show();
		} else {
			pallete.layout.layout(true);
		}
	}
	/***********************************************************
	*	INTERNAL FUNCTIONS:
	*************************************************************/
	/*
	* 	Creates the UI Part.
	*	params: thisObj: Panel Object of the applications is lunched from Window Menu
	*	returns: palleteObj: Window/Panel
	*/
	function buildUI(thisObj) {
		var palleteObj = (thisObj instanceof Panel) ? thisObj : new Window("palette", Defaults.scriptName, undefined, { resizeable: true });

		// Extra checks:
		if (!palleteObj) {
			alert(Defaults.getLocalization("errorUnknownUI"), Defaults.getLocalization("errorTitleError"), true);
			return null;
		}

		/******** DATA *******/
		palleteObj.currentPath = new File($.fileName).path;
		palleteObj.imagesFolderPath = palleteObj.currentPath + "/SC_Src/images/";
		palleteObj.aa1Off = palleteObj.imagesFolderPath + "aa1Off.png";
		palleteObj.aa1On = palleteObj.imagesFolderPath + "aa1On.png";
		palleteObj.aa2Off = palleteObj.imagesFolderPath + "aa2Off.png";
		palleteObj.aa2On = palleteObj.imagesFolderPath + "aa2On.png";
		palleteObj.aa3Off = palleteObj.imagesFolderPath + "aa3Off.png";
		palleteObj.aa3On = palleteObj.imagesFolderPath + "aa3On.png";
		//palleteObj.refresh = palleteObj.imagesFolderPath + "refresh.png";
		//palleteObj.create = palleteObj.imagesFolderPath + "create.png";
		//palleteObj.markers = [];
		//palleteObj.textLines = [];
		/******** ROOT COMP *******/
		if (!app.project) {
			app.newProject();
		}
		/********************************************
		*		BUILD UI:
		*********************************************/
		var rootRes = "Group {orientation: 'stack', alignment: ['fill','fill'], alignChildren: ['fill','fill']";
		rootRes += "mainContent:Group{orientation:'column',";
		rootRes += "layerDetails:Group{orientation:'row', alignment: ['left','top'], ";
		//	rootRes += "genericStaticText:StaticText{text:'Now Editing layer:', alignment: ['left','top']},"
		//rootRes += "layerName:StaticText{text:'No layer selected', characters:20, alignment: ['left','top']},"
		rootRes += "}";// End LayerDetails

		rootRes += "input: EditText {preferredSize:[200,200], alignment: ['fill','fill'], properties:{multiline:true}, text:''},"
		///rootRes += "message:StaticText{text:'sdada', characters:40, alignment: ['fill','bottom']},"

		rootRes += "buttons:Group{orientation:'row', alignment: ['right','bottom'], ";

		rootRes += "applyBtn:Button{size:[60,28],text:'Apply'},"
		rootRes += "editBtn:Button{size:[60,28],text:'Edit'},"

		rootRes += "saveSrt:Button{size:[80,28],text:'Export SRT'},"
		rootRes += "getSrt:Button{size:[80,28],text:'Import SRT'},"

		rootRes += "}";// End Buttons
		rootRes += "}"; // End mainContent
		rootRes += "}";// End Group
		try {
			palleteObj.rootGrp = palleteObj.add(rootRes);
		} catch (e) {
			alert(Defaults.getLocalization("errorUnknownUI"), Defaults.getLocalization("errorTitleError"), true);
			return null;
		}
		palleteObj.rootGrp.mainContent.buttons.spacing = 5;
		palleteObj.rootGrp.mainContent.spacing = 0;
		palleteObj.rootGrp.spacing = 0;
		palleteObj.spacing = 0;

		palleteObj.rootGrp.mainContent.buttons.margins.top = 5;
		palleteObj.rootGrp.mainContent.buttons.margins.right = 5;
		palleteObj.rootGrp.mainContent.buttons.margins.bottom = 5;

		palleteObj.rootGrp.mainContent.margins = 0;
		palleteObj.rootGrp.margins = 0;
		palleteObj.margins = 0;

		palleteObj.rootGrp.mainContent.input.text = "";


		/********************************************
		*		CONTROLS: EDIT SELECTED LAYER
		*********************************************/
		palleteObj.rootGrp.mainContent.buttons.saveSrt.onClick = function () {
			saveSrt(palleteObj.rootGrp.mainContent.input.text);
		}
		var allSrtContent = "";
		palleteObj.rootGrp.mainContent.buttons.getSrt.onClick = function () {
			var currentComp = app.project.activeItem;

			if (currentComp && currentComp instanceof CompItem) {
				var targetLayer = currentComp.selectedLayers; // check comp selected
				if (targetLayer.length != 0) { // check layer selected

					palleteObj.rootGrp.mainContent.input.text = "";
					var srtMarkerTime = getSrtaddMarkers();
					if (srtMarkerTime.length == 0) { return }
					addSubtitles();
					addPause(srtMarkerTime);

				} else {
					alert("First, select an empty text layer")
				}

			} else {
				alert("First, select an empty text layer")
			}

		}
		function getSrtaddMarkers() {
			app.beginUndoGroup("get srt");

			var tempFile = new File;
			var tempFile = tempFile.openDlg("Open a file", "Acceptable Files:*.srt");

			if (tempFile == null) { return null } //check if it press Esc key

			var filePathString = tempFile.fsName;

			if (tempFile.exists == true) {
				tempFile.open("r");
				var fileContents = tempFile.read();
				tempFile.close();
			} else {
				alert("That file doesn't exist");
				return ""
			}

			if (fileContents.length < 3) {
				return "This file is empty";
			}

			var srtMarkerTimeArr = extractSrtTimeTextAndAddMarkers(fileContents);

			return srtMarkerTimeArr;

			function clearAllMarkers(targetLayer) {
				var nKey = targetLayer.property("ADBE Marker");
				//	alert(nKey.reflect.properties.toString().replace(/,/g, "\n"))
				//alert(nKey.reflect.methods.toString().replace(/,/g, "\n"))
				if (nKey.numKeys > 0) {
					for (var i = nKey.numKeys; i > 0; i--) {
						nKey.removeKey(i)
					}
				}
			}
			function extractSrtTimeTextAndAddMarkers(srtSring) {
				var tempArr = srtSring.split('\n\n'); /// num, time and text group

				if (tempArr.length > 150) { // if the file is too large

					var myWindow = new Window("dialog", "Do you want to continue?");
					var myInputGroup = myWindow.add("group");

					var msg = tempArr.length + " lines found. It may take a cople of minite to load all lines."
					myInputGroup.add("statictext", undefined, msg);

					var myButtonGroup = myWindow.add("group");
					myButtonGroup.alignment = "right";
					var okBtn = myButtonGroup.add("button", undefined, "OK");
					var cancelBtn = myButtonGroup.add("button", undefined, "Cancel");

					okBtn.onClick = function () {
						myWindow.close();
					}
					var cancelRezult = false;
					cancelBtn.onClick = function () {
						myWindow.close();
						cancelRezult = true;
					}
					myWindow.show();
				}
				if (cancelRezult == true) { // user pressed Cancel
					return []
				}

				var currentComp = app.project.activeItem;
				var targetLayer = currentComp.selectedLayers[0];
				var markerTimeArr = [];
				allSrtContent = "";
				clearAllMarkers(targetLayer);

				//alert( targetLayer.property("ADBE Marker").numKeys)
				//alert( tempArr.length + " tempArr.length")


				for (i = 0; i < tempArr.length - 1; i++) {

					if (tempArr[i] != "") {

						var startFrom = tempArr[i].indexOf("\n");

						var timeAndContentString = tempArr[i].substr(startFrom + 1);

						var startFrom_2 = timeAndContentString.indexOf("\n");

						var timeString = timeAndContentString.substring(0, startFrom_2 + 1);
						var timeArr = timeString.split("-->");

						if (timeArr.length == 2) { // check if no more time string

							var startMTime = convertTimeToSec(timeArr[0]);
							var endMTime = convertTimeToSec(timeArr[1]);

							var contentString = timeAndContentString.substring(startFrom_2 + 1).replace(/\n/g, " ");
							//contentString = cleanUpText(contentString);
							//alert(i + " intere 6")

							var markerLable = new MarkerValue("start" + (i));
							targetLayer.property("ADBE Marker").setValueAtTime(startMTime, markerLable);
							//targetLayer.sourceText.setValueAtTime(startMTime, contentString);


							markerTimeArr.push([startMTime, endMTime]);
							allSrtContent += contentString + "\n";

							function convertTimeToSec(hms) {
								hms = hms.replace(/ /g, ""); // remove  space
								var a = hms.split(/[^0-9]/);
								var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]) + (+a[3]) / 1000;
								return seconds
							}
						}
					}
				}	///alert(				palleteObj.rootGrp.mainContent.input.text )



				palleteObj.rootGrp.mainContent.input.text = allSrtContent;
				//	alert(				palleteObj.rootGrp.mainContent.input.text )
				//palleteObj.layout.layout(true);
				// palleteObj.layout.resize();
				return markerTimeArr

			}
			app.endUndoGroup();
		}
		function addPause(srtMarkerTime) {
			app.beginUndoGroup("addPause");
			var currentComp = app.project.activeItem;
			var targetLayer = currentComp.selectedLayers[0];

			///alert(targetLayer.name)
			//alert(targetLayer.properties.toString().replace(/,/g, "\n"))
			//	alert(targetLayer.methods.toString().replace(/,/g, "\n"))


			for (var i = 0; i < srtMarkerTime.length - 1; i++) {
				///	alert(srtMarkerTime[i])
				if (srtMarkerTime[i][1] != srtMarkerTime[i + 1][0]) {

					var markerLable = new MarkerValue("");
					targetLayer.property("ADBE Marker").setValueAtTime(srtMarkerTime[i][1], markerLable);
					///	alert("33")
				}
			}
			app.endUndoGroup();

		}

		palleteObj.rootGrp.mainContent.buttons.editBtn.onClick = function () {

			selectLayer(true);
		}
		function selectLayer(withAlert) {
			// Check if selected layer is text
			var selectedTextLayer = getSelectedTextLayer(withAlert);
			if (selectedTextLayer) {
				// Some UI:
				//palleteObj.rootGrp.mainContent.layerDetails.layerName.text = selectedTextLayer.name;
				// Continue to the next Step:
				getDataFromLayer(selectedTextLayer, withAlert);
			}
		}
		function getDataFromLayer(layer, withAlert) {
			var textExpression = layer.property("Text").property("Source Text").expression;
			var textsArray;
			if (textExpression.indexOf("var texts=") > -1) {
				try {
					var subStartIndex = textExpression.indexOf("var texts=") + 10;
					var subEndIndex = textExpression.indexOf(";;");
					var textsArrayAsString = textExpression.substring(subStartIndex, subEndIndex);
					textsArrayAsString = textsArrayAsString.split("\\n").join(" ");
					textsArray = eval(textsArrayAsString);
				} catch (e) {
					if (withAlert) {
						alert("Error on Loading data from text layer. If error persist, please delete Text's expression");
					}
					return;
				}
			}

			// Clean TextArea:
			palleteObj.rootGrp.mainContent.input.text = "";
			if (textsArray && textsArray.length > 0) {
				fillDataFromTextLayerToTextArea(textsArray);
			}
		}
		function fillDataFromTextLayerToTextArea(textLines) {
			// Add new lines one by one, with nre line separator
			for (var i = 0; i < textLines.length; i++) {
				palleteObj.rootGrp.mainContent.input.text = palleteObj.rootGrp.mainContent.input.text + textLines[i] + "\n";
			}
		}
		selectLayer(false);

		/********************************************
				CONTROLS: APPLY CHANGES
		*********************************************/

		palleteObj.rootGrp.mainContent.buttons.applyBtn.onClick = function () {
			if (palleteObj.rootGrp.mainContent.input.text.length > 10) {
				addSubtitles()
			} else {
				alert("The text field is empty. Please add your content in");
				return
			}

		}
		function addSubtitles() {

			app.beginUndoGroup("Create Subtitles");
			var textLinesAll = palleteObj.rootGrp.mainContent.input.text.split("\n");
			var textLines = [];
			for (var i = 0; i < textLinesAll.length; i++) {
				if (textLinesAll[i] && textLinesAll[i].length > 0) {
					textLines.push(textLinesAll[i].split("'").join("\\'"));
					//textLines.push(textLinesAll[i]);
				}
			}
			if (textLines.length == 0) {
				//palleteObj.rootGrp.mainContent.message.text = Defaults.getLocalization("errorLinesNotFound");
				return;
			}
			if (!getRootComp()) {
				return;
			}
			var selectedTextLayer = getSelectedTextLayer();
			if (!selectedTextLayer) {
				alert("First, select a text layer");
				return;
			}

			// Find Out if there is any difference between texts.length and the markers we have
			var markerStartExists = false;
			var needMoreMarkers = false;
			if (textLines.length > selectedTextLayer.property("ADBE Marker").numKeys) {
				needMoreMarkers = true;
			}
			if (selectedTextLayer.property("ADBE Marker").numKeys > 0) {
				// Check if CTI is after last marker time:
				if (textLines.length > selectedTextLayer.property("ADBE Marker").numKeys) {
					if (getRootComp().time < selectedTextLayer.property("ADBE Marker").keyTime(selectedTextLayer.property("ADBE Marker").numKeys)) {
						alert("Please Move Current Time Indicator after the last marker.");
						return;
					}
				}

				for (var i = selectedTextLayer.property("ADBE Marker").numKeys; i >= 1; i--) {
					if (selectedTextLayer.property("ADBE Marker").keyValue(i) &&
						selectedTextLayer.property("ADBE Marker").keyValue(i).comment &&
						selectedTextLayer.property("ADBE Marker").keyValue(i).comment.indexOf('start') >= 0) {
						markerStartExists = true;
						break;
					}
				}
			}

			var textLinesIndex = 0;
			var lastMarkerUsed = 1;
			var lastMarkerTime = selectedTextLayer.inPoint;
			var lastMarkerLabel = 1;
			if (selectedTextLayer.property("ADBE Marker").numKeys > 0) {
				for (var i = 1; i <= selectedTextLayer.property("ADBE Marker").numKeys; i++) {
					//alert("i: " + i + ", comm: " + selectedTextLayer.property("ADBE Marker").keyValue(i).comment);
					if (selectedTextLayer.property("ADBE Marker").keyValue(i).comment.indexOf('start') >= 0 || !markerStartExists && i <= textLines.length) {
						lastMarkerTime = selectedTextLayer.property("ADBE Marker").keyTime(i);
						//alert("pun marker la " + lastMarkerTime + "start"+lastMarkerUsed);
						selectedTextLayer.property("ADBE Marker").setValueAtTime(lastMarkerTime, new MarkerValue("start" + lastMarkerLabel));
						textLinesIndex++;
						lastMarkerUsed = i + 1;
						lastMarkerLabel++;
						//alert("textLinesIndex: " + textLinesIndex + ", lastMarkerUsed (to be used):" + lastMarkerUsed);
					}
				}
			}

			var totalLetters = 0;
			//var textLinesIndexToStartCount = textLinesIndex == 0 ? textLinesIndex : textLinesIndex-1;
			textLinesIndexToStartCount = selectedTextLayer.property("ADBE Marker").numKeys > 0 ? selectedTextLayer.property("ADBE Marker").numKeys - 1 : 0;
			for (var i = textLinesIndexToStartCount; i < textLines.length; i++) {
				totalLetters += textLines[i].length;
			}

			//alert("textLinesIndex " + textLinesIndex + ", textLinesIndexToStartCount " + textLinesIndexToStartCount + ", totalLetters " + totalLetters);

			var totalTime = getRootComp().time > 0 ? getRootComp().time : getRootComp().duration;
			//var timeLength = totalTime - lastMarkerTime;
			var timeStartToCount = selectedTextLayer.property("ADBE Marker").numKeys > 0 ? selectedTextLayer.property("ADBE Marker").keyTime(selectedTextLayer.property("ADBE Marker").numKeys) : selectedTextLayer.inPoint;
			var timeLength = totalTime - timeStartToCount;
			var timeForLetter = timeLength / totalLetters;

			//alert("totalTime = " + totalTime + ", lastMarkerTime = " + lastMarkerTime + ", timeLength = " + timeLength + ", timeForLetter = " + timeForLetter);
			//alert("textLinesIndex " + textLinesIndex + ", lastMarkerLabel " + lastMarkerLabel);

			// Continue to use markers or add mising markers
			for (var i = textLinesIndex; i < textLines.length; i++) {
				if (lastMarkerUsed <= selectedTextLayer.property("ADBE Marker").numKeys) {
					lastMarkerTime = selectedTextLayer.property("ADBE Marker").keyTime(lastMarkerUsed);
					//selectedTextLayer.property("ADBE Marker").setValueAtTime(lastMarkerTime, new MarkerValue("start"+i));
				} else {
					if (i > 0) {
						lastMarkerTime += textLines[i - 1].length * timeForLetter;
					}
				}
				selectedTextLayer.property("ADBE Marker").setValueAtTime(lastMarkerTime, new MarkerValue("start" + lastMarkerLabel));
				lastMarkerUsed++;
				lastMarkerLabel++;
			}
			// Clean markers text that are after textLines.length (in case of user removing some subtitles after add then)
			for (var i = lastMarkerUsed; i <= selectedTextLayer.property("ADBE Marker").numKeys; i++) {
				if (selectedTextLayer.property("ADBE Marker").keyValue(i) &&
					selectedTextLayer.property("ADBE Marker").keyValue(i).comment &&
					selectedTextLayer.property("ADBE Marker").keyValue(i).comment.indexOf('start') >= 0) {
					var markerTime = selectedTextLayer.property("ADBE Marker").keyTime(i);
					selectedTextLayer.property("ADBE Marker").setValueAtTime(markerTime, new MarkerValue(""));
				}
			}

			// Cut selectedTextLayer after Ccurrent Time Indicator:
			if (getRootComp().time > 0 && needMoreMarkers) {
				selectedTextLayer.outPoint = getRootComp().time;
			}


			// Start calculating background's dimensions and check if each subtitle fill on one line or two
			var widths, heighs, heighsClean, widths2, heighs2, heighsClean2, textTotalHeights, textLinesASString;
			widths = heighs = heighsClean = widths2 = heighs2 = heighsClean2 = textTotalHeights = textLinesASString = "[";
			var tempLayer = createTextLayer(getRootComp(), "Working layer", selectedTextLayer);
			tempLayer.shy = true;
			var documentProperty = tempLayer.property("ADBE Text Properties").property("ADBE Text Document");
			var documentPropertyValue = documentProperty.value

			documentPropertyValue.text = "a";
			documentProperty.setValue(documentPropertyValue);
			var a_size = Math.round(tempLayer.sourceRectAtTime(0, false).height);
			documentPropertyValue.text = "g";
			documentProperty.setValue(documentPropertyValue);
			var g_size = Math.round(tempLayer.sourceRectAtTime(0, false).height);


			for (var i = 0; i < textLines.length; i++) {
				// For the temp text layer, set text line:
				documentPropertyValue.text = textLines[i];
				documentProperty.setValue(documentPropertyValue);

				if (tempLayer.sourceRectAtTime(0, false).width > getMaxWidth()) {

					// If the text line is to long: calculate after how many words must be cut:
					var words = textLines[i].split(" ");
					// Clean TextLayer of any text:
					documentPropertyValue.text = "";
					documentProperty.setValue(documentPropertyValue);
					var totH = 0;

					for (var w = 0; w < words.length; w++) {
						// Add each word one by one untils fits no more:
						// Keep Last text that fits the composition:
						var lastText = documentPropertyValue.text;
						// Save dimensions for Background 1:
						var lastWidth = Math.round(tempLayer.sourceRectAtTime(0, false).width);
						var lastHeight = Math.round(tempLayer.sourceRectAtTime(0, false).height);

						if (doesTextContainsSpecialChars(lastText)) {
							//var lastHeightClean = getLayerHeightForAnchor(getRootComp(), tempLayer);
							var lastHeightClean = g_size - a_size;
						} else {
							var lastHeightClean = 0;
						}

						// Add new word:
						if (w > 0) { // if is not first, add space;
							documentPropertyValue.text += " ";
						}
						documentPropertyValue.text += words[w];
						documentProperty.setValue(documentPropertyValue);

						// If is to big, add new line and continue to add words:
						if (tempLayer.sourceRectAtTime(0, false).width > getMaxWidth()) {
							// Update textLines[i], add '\n' for new line:
							textLines[i] = lastText + "\\n"; // will keep the space that is before the first word of second line
							//textLines[i] = lastText.slice(-1) == " " ? lastText.substring(0,lastText.length-1)  + "\\n" : lastText + "\\n"; // will remove the space that is before the first word of second line

							// Get Total Height of the TextLayer:
							totH = Math.round(tempLayer.sourceRectAtTime(0, false).height);

							var secondLine = "";
							for (var t = w; t < words.length; t++) {
								textLines[i] = textLines[i] + " " + words[t];
								secondLine = secondLine + " " + words[t];
							}

							documentPropertyValue.text = lastText + "\n" + secondLine;
							documentProperty.setValue(documentPropertyValue);
							totH = Math.round(tempLayer.sourceRectAtTime(0, false).height) - totH;
							if (!doesTextContainsSpecialChars(secondLine) && doesTextContainsSpecialChars(lastText)) {
								totH = totH + g_size - a_size;
							}


							// Keep Dimensions for Background 1:
							widths += lastWidth + ",";
							heighs += lastHeight + ",";
							heighsClean += lastHeightClean + ",";

							// Keep Dimensions for Background 2:
							documentPropertyValue.text = secondLine;
							documentProperty.setValue(documentPropertyValue);
							//
							widths2 += Math.round(tempLayer.sourceRectAtTime(0, false).width) + ",";
							heighs2 += Math.round(tempLayer.sourceRectAtTime(0, false).height) + ",";

							if (doesTextContainsSpecialChars(secondLine)) {
								var vl = g_size - a_size;
								heighsClean2 += vl + ",";
							} else {

								heighsClean2 += 0 + ",";
							}

							// Keep textTotalHeights:
							textTotalHeights += totH + ",";
							break;
						}
					}
				} else {

					// If the text line fits the scene's dimension go on:
					// Keep Dimensions for Background 1:
					widths += Math.round(tempLayer.sourceRectAtTime(0, false).width) + ",";
					heighs += Math.round(tempLayer.sourceRectAtTime(0, false).height) + ",";
					//heighs += a_size + ",";

					if (doesTextContainsSpecialChars(textLines[i])) {
						//var hCl = getLayerHeightForAnchor(getRootComp(), tempLayer);
						var hCl = g_size - a_size;
					} else {
						//var hCl =  Math.round(tempLayer.sourceRectAtTime(0, false).height);
						var hCl = 0;
					}
					heighsClean += hCl + ",";
					textTotalHeights += Math.round(tempLayer.sourceRectAtTime(0, false).height) + ",";

					// Keep Dimensions for Background 2:
					widths2 += "0,";
					heighs2 += "0,";
					heighsClean2 += "0,";
				}
				textLinesASString += "'" + textLines[i] + "'";
				if (i < textLines.length - 1) {
					textLinesASString += ","
				}
			}
			tempLayer.remove();
			widths += "]";
			heighs += "]";
			heighsClean += "]";
			widths2 += "]";
			heighs2 += "]";
			heighsClean2 += "]";
			textTotalHeights += "]";
			textLinesASString += "]";

			// alert("widths = " + widths)
			// alert("heighs = " + heighs)
			// alert("heighsClean = " + heighsClean)
			// alert("widths2 = " + widths2)
			// alert("heighs2 = " + heighs2)
			// alert("heighsClean2 = " + heighsClean2)
			// alert("textTotalHeights = " + textTotalHeights)
			// alert("textLinesASString = " + textLinesASString)

			var exp = "var tt = '';\n"
			exp += "var texts=" + textLinesASString + ";\n"
			exp += "for(i=thisComp.layer(index).marker.numKeys;i>=1;i--){\n"
			exp += "if(time >= thisComp.layer(index).marker.key(i).time){\n"
			exp += "var comm = thisComp.layer(index).marker.key(i).comment;\n"
			exp += "if(comm.indexOf('start') >= 0){\n"
			exp += "var textIndex = comm.substr(5);\n"
			exp += "var subIndex = parseInt(textIndex)-1;\n"
			exp += "if(subIndex >= 0 && subIndex < texts.length){\n"
			exp += "tt= texts[subIndex];\n"
			exp += "}\n"
			exp += "}\n"
			exp += "break;\n"
			exp += "}\n"
			exp += "}\n"
			exp += "tt;\n";
			selectedTextLayer.property("ADBE Text Properties").property("ADBE Text Document").expression = exp;
			// Center Text Layer:
			var documentPropertyValue = selectedTextLayer.property("ADBE Text Properties").property("ADBE Text Document").value;
			documentPropertyValue.text = "";
			documentPropertyValue.justification = ParagraphJustification.CENTER_JUSTIFY;
			selectedTextLayer.property("ADBE Text Properties").property("ADBE Text Document").setValue(documentPropertyValue);

			// Add Shape Layer:
			// Remove last one:
			var backColor = [0, 0, 0, 0.8];
			for (var i = 1; i <= getRootComp().numLayers; i++) {
				if (getRootComp().layer(i).name == "background" + " " + selectedTextLayer.name) {
					backColor = getRootComp().layer(i).property("ADBE Root Vectors Group").property("background1").property("ADBE Vectors Group").property("ADBE Vector Graphic - Fill").property("ADBE Vector Fill Color").value;
					getRootComp().layer(i).remove();
				}
			}


			var shapeLayer = getRootComp().layers.addShape();
			shapeLayer.name = "background" + " " + selectedTextLayer.name;
			shapeLayer.moveAfter(selectedTextLayer);
			shapeLayer.inPoint = selectedTextLayer.inPoint;
			shapeLayer.outPoint = selectedTextLayer.outPoint;

			// Add Background Rectangle Shapes:
			drawBackground(shapeLayer, "background1", widths, heighs, heighsClean, textTotalHeights, backColor);
			drawBackground(shapeLayer, "background2", widths2, heighs2, heighsClean2, textTotalHeights, backColor);

			// Select Text Layer:
			selectedTextLayer.selected = true;
			shapeLayer.selected = false;

			// Show Confirmation Message:

			//palleteObj.rootGrp.mainContent.message.text = Defaults.getLocalization("confirmCreate").split("%1").join(palleteObj.textLines.length);

			app.endUndoGroup();

		}
		/********************************************
		*				UTILS:
		*********************************************/
		function getMaxWidth() {
			if (MAX_WIDTH > 0) {
				return MAX_WIDTH;
			}
			return getRootComp().width - 100;
		}
		function doesTextContainsSpecialChars(textToCheck) {
			return textToCheck.indexOf("y") > -1 || textToCheck.indexOf("q") > -1 || textToCheck.indexOf("p") > -1 || textToCheck.indexOf("g") > -1 || textToCheck.indexOf("j") > -1;
		}
		function getRootComp() {
			var rootCompCreated;
			if (app.project.activeItem && app.project.activeItem instanceof CompItem) {
				return app.project.activeItem;
			} else {
				alert("Please create a composition!");
				return null;
			}
		}
		function getSelectedTextLayer(withAlert) {
			if (app.project) {
				if (app.project.activeItem) {
					if (app.project.activeItem.selectedLayers && app.project.activeItem.selectedLayers.length > 0) {
						// Get first Selected Text Layer:
						for (var i = 0; i < app.project.activeItem.selectedLayers.length; i++) {
							if (app.project.activeItem.selectedLayers[i] instanceof TextLayer) {
								return app.project.activeItem.selectedLayers[i];
							}
						}
						if (withAlert) {
							alert("First, select a text layer ");
						}
						return null;
					} else {
						if (withAlert) {
							alert("First, select a text layer to edit");
						}
						return null;
					}
				} else {
					if (withAlert) {
						alert("Please create a Composition with at least one text layer.");
					}
					return null;
				}
			} else {
				if (withAlert) {
					alert("Please create a new Project.");
				}
				return null;
			}
		}

		//
		function drawBackground(shapeLayer, vectorName, widths, heighs, heighsClean, textTotalHeights, backColor) {
			// Add Rectangle:
			var vectorGroupUp = shapeLayer.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
			vectorGroupUp.name = vectorName;
			vectorGroupUp.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Rect");
			// Color it:
			shapeLayer.property("ADBE Root Vectors Group").property(vectorName).property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill").property("ADBE Vector Fill Color").setValue(backColor);

			// Set Position:
			var positionProperty = shapeLayer.property("ADBE Root Vectors Group").property(vectorName).property("ADBE Vector Transform Group").property("ADBE Vector Position");
			var exp = "var yy = 0;\n";
			exp += "var heights = " + heighs + ";\n";
			exp += "var textTotalHeights = " + textTotalHeights + ";\n";
			exp += "var heightsClean = " + heighsClean + ";\n";
			exp += "for(i=thisComp.layer(index-1).marker.numKeys;i>=1;i--){\n";
			exp += "if(time >= thisComp.layer(index-1).marker.key(i).time){\n";
			exp += "var comm = thisComp.layer(index-1).marker.key(i).comment\n";
			exp += "if(comm.indexOf('start') >= 0){\n"
			exp += "var textIndex = comm.substr(5);\n"
			exp += "var subIndex = parseInt(textIndex)-1;\n"
			exp += "if(subIndex<heightsClean.length){\n";
			if (vectorName == "background1") {
				//exp += "yy = thisComp.layer(index-1)('Transform')('Position')[1] - thisComp.height/2 - heights[subIndex]/2 - (heightsClean[subIndex] - heights[subIndex]);\n";
				exp += "yy = thisComp.layer(index-1)('Transform')('Position')[1] - thisComp.height/2 - heights[subIndex]/2 + heightsClean[subIndex];\n";
			} else {
				//exp += "yy = thisComp.layer(index-1)('Transform')('Position')[1] - thisComp.height/2 + (textTotalHeights[subIndex] - heightsClean[subIndex] ) + heightsClean[subIndex]/2 - (heightsClean[subIndex] - heights[subIndex]);\n";
				exp += "yy = thisComp.layer(index-1)('Transform')('Position')[1] - thisComp.height/2 + textTotalHeights[subIndex] - heights[subIndex]/2 + heightsClean[subIndex];\n";
			}
			exp += "break;\n";
			exp += "}\n";
			exp += "}\n";
			exp += "}\n";
			exp += "}\n";
			exp += "[thisComp.layer(index-1)('Transform')('Position')[0]-thisComp.width/2 + value[0], yy + value[1]];";
			positionProperty.expression = exp;

			// Set Size with expression:
			shapeLayer.property("ADBE Root Vectors Group").property(vectorName).property("ADBE Vectors Group").property("ADBE Vector Shape - Rect").property("ADBE Vector Rect Size").setValue([0, 0]);
			var sizeProperty = shapeLayer.property("ADBE Root Vectors Group").property(vectorName).property("ADBE Vectors Group").property("ADBE Vector Shape - Rect").property("ADBE Vector Rect Size");

			// Set Expression for size:
			var exp = "var ww = 0;\
			var hh = 0;\
			var widths = "+ widths + ";\
			var heights = "+ heighs + ";\
			for(i=thisComp.layer(index-1).marker.numKeys;i>=1;i--){\
				if(time >= thisComp.layer(index-1).marker.key(i).time){\
					var comm = thisComp.layer(index-1).marker.key(i).comment;\
					if(comm.indexOf('start') >= 0){\
						var textIndex = comm.substr(5);\
						var subIndex = parseInt(textIndex)-1;\
						if(subIndex<widths.length){\
							ww = widths[subIndex] > 0? widths[subIndex] + heights[subIndex] * 0.25 : 0;\
							hh = heights[subIndex] > 0 ? heights[subIndex] + heights[subIndex] * 0.25: 0;\
						}\
					}\
					break;\
				}\
			}\
			[ww + value[0],hh + value[1]];";
			sizeProperty.expression = exp;
		}

		function createTextLayer(comp, text, targetLayer) {
			var newLayer = comp.layers.addText(text);
			newLayer.name = text;
			// Doc:
			var documentPropertyValue = (targetLayer) ? targetLayer.property("ADBE Text Properties").property("ADBE Text Document").value : newLayer.property("ADBE Text Properties").property("ADBE Text Document").value;
			documentPropertyValue.text = text;
			documentPropertyValue.justification = ParagraphJustification.CENTER_JUSTIFY;
			newLayer.property("ADBE Text Properties").property("ADBE Text Document").setValue(documentPropertyValue);
			// Positionate:
			var y = (targetLayer) ? targetLayer.property("ADBE Transform Group").property("ADBE Position").value[1] : comp.height / 2 - (newLayer.sourceRectAtTime(0, false).height + 50);
			newLayer.property("ADBE Transform Group").property("ADBE Position").setValue([newLayer.property("ADBE Transform Group").property("ADBE Position").value[0], y]);
			return newLayer;
		}
		function getLayerHeightForAnchor(comp, layer) {
			var doc = layer.property("ADBE Text Properties").property("ADBE Text Document").value;
			doc.text = doc.text.split("q").join("").split("y").join("").split("p").join("").split("g").join("").split("j").join("");
			var fakeLayer = comp.layers.addText(doc.text);
			fakeLayer.property("ADBE Text Properties").property("ADBE Text Document").setValue(doc);
			var layerH = fakeLayer.sourceRectAtTime(0, true).height;
			fakeLayer.remove();
			return Math.round(layerH);
		}
		// Resize Pallete:
		resizePallete(palleteObj);
		palleteObj.onResizing =
			palleteObj.onRiseze = function () {
				this.layout.resize();
			}

		//palleteObj.rootGrp.mainContent.message.text = "";
		// Return Pallete:
		return palleteObj;

	}// End function buildUI(){
	/********************************************
	*				UTILS
	*********************************************/
	// Resize and refresh the UI:
	function resizePallete(palleteObj) {
		palleteObj.layout.layout(true);
		palleteObj.layout.resize();
	}
})(this);
