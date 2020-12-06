// ©2016 Codrin Fechete and Stefan Ababei
// Authors: Stefan Ababei and Codrin Fechete
// v.1.0.0
// Keeps default data and some localizations
//
var Defaults = (function handler(thisObj) {
	var defaultObj = {};
	// Texts:
	defaultObj.scriptName = "Subtitles Editor";
	defaultObj.scriptTitle = defaultObj.scriptName + " v1.3.0";

	defaultObj.errorTitleError = { en: "Error" };
	defaultObj.errorVersionToOld = { en: "The AE Version you are using is too old for this script to run." };
	defaultObj.errorUnknown = { en: "Unknown error. Please try again." };
	defaultObj.errorUnknownUI = { en: "An unknown error occurred while creating the layout." };
	defaultObj.errorFileNotFond = { en: "File not found in %1.\rMaybe you didn't extract the folder SC_Src from the .zip archive?" };
	defaultObj.errorMarkersNotFound = { en: "Please add a layer called markers with some markers set." };
	defaultObj.errorLinesNotFound = { en: "Please add some subtitles in the Input area." };

	defaultObj.confirmRefresh = { en: "%1 markers have been found." };
	defaultObj.confirmRefreshWithLines = { en: "%1 subtitles have been linked with markers." };
	defaultObj.confirmCreate = { en: "%1 have been linked with markers and added to the timeline." };

	defaultObj.confirmNoBackground = { en: "Subtitles will have no background." };
	defaultObj.confirmBackground = { en: "Subtitles will have a coloured background." };
	defaultObj.confirmShadow = { en: "Subtitles will have a drop shadow effect." };

	defaultObj.getLocalization = function (textKey) {
		if (defaultObj[textKey]) {
			return defaultObj[textKey]["en"];
		} else {
			return "Error on Error! Can't find key " + textKey;
		}
	}

	return defaultObj;
})(this);
