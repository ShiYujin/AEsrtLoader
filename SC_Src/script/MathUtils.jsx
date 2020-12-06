// ©2016 Stefan Ababei and Codrin Fechete
// Authors: Stefan Ababei and Codrin Fechete
// v.1.0.0
// 
var MathUtils = (function handler(thisObj) {
	/*Cuts only the minutes and seconds from basic timeToCurrentFormat function */
	function secondsToTimeFormat(time, fps) {
		var formatedTime = timeToCurrentFormat(time, fps, true);
		return formatedTime.substr(3, 5);
	}
	/*Transforms minutes:seconds format to time */
	function timeFormatToSeconds(format) {
		format = format.split(":").join(";");
		format = format.split(".").join(";");
		format = format.split(",").join(";");
		format = format.split("/").join(";");
		var m = parseInt(format.split(";")[0]) * 60;
		var s = parseInt(format.split(";")[1]);
		return m + s;
	}
	function cutDigits(nr, digits) {
		digits = Math.pow(10, digits);
		return Math.round(nr * digits) / digits;
	}


	return {
		secondsToTimeFormat: secondsToTimeFormat,
		timeFormatToSeconds: timeFormatToSeconds,
		cutDigits: cutDigits
	}
})(this);