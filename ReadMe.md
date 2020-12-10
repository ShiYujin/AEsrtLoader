# AEsrtLoader
AE script that load `srt`/`lrc` files and generate AE text layer, or export `srt` file from text layer.

Origin copyright: Stefan Ababei and Codrin Fechete
Modified by: Yujin Shi, Dec.2020

## Install
1. Copy `Subtitles Creator v2.0.jsx` and folder `SC_Src` to:

Win: `...Adobe After Effects CC\Support Files\Scripts\ScriptUI Panels\`

Mac: `Application\Adobe After Effects CC\Scripts\ScriptUI Panels\`

2. Open AE, go to perference setting, and enable scripts

Win: `Edit - Perference - general`

Mac: `After Effects CC - Perference - general`

3. You can then find `Subtitles Creator v2.0` under `window` menu.

## Usage
First create an empty text layer, select it.

Then open `Subtitles Creator v2.0`, and click `Import SRT` for `*.srt` files or click `Import LRC` for `*.lrc` files.

And tida! Subtitle/Lyrics would be imported automatically. You can also edit then in the pop window, and click `Apply` to apply changes to text layer.

## Develop
The best way to debug Adobe scripts is using `AdobeExtendScriptToolkit`, but this software is not a 'not-that-good' editor.

Choose `Adobe After Effect` on the top left list and run the script(or press `F5`), the script would then be run under AE environment.

## Logs
### Dec. 11 2020
Add lyrics(`*.lrc`) importer.

By Yujin Shi.

