# hyper-capture

Capture the output of [hyper](http://hyper.is) to a video file.

**Note: this plugin currently does not work on Windows. The mouse cursor shows up but text does not.**

## Screencaps
Quick explaination since these gifs look very similar. The first gif is a desktop capture of the hyper window. The second gif is the result from running `togglecapture`, which how this plugin is used.
![Desktop capture](https://github.com/bsharper/hyper-capture/raw/master/screenshots/desktop-capture.gif)
*Desktop capture using QuickTime*


![hyper-capture capture](https://github.com/bsharper/hyper-capture/raw/master/screenshots/hyper-capture-capture.gif)
*Capture using this very plugin*

## Usage

Add `hyper-capture` to the `.hyper.js` file and reload hyper. To start capturing terminal activity, type `togglecapture`. A 'save file' dialog will open, pick a file name and location and the capture will begin. To stop the capture, type `togglecapture` again.

## What should I do with this `.webm` file?

*Short version*

    ffmpeg -i file.webm -vcodec copy file.mp4

*Slightly longer version*

This plugin only uses built in capabilities provided by Electron. As such, the only available format is `webm`. At least that I've found. This plugin saves files as `video/webm;codecs=h264`, which is the h264 variant of the MKV-ish `webm` format. This means no recoding is necessary, it just needs to be put in a different container format.

##Technical information

This plugin uses:

* [`desktopCapturer`](https://github.com/electron/electron/blob/master/docs/api/desktop-capturer.md) from Electron
* [`MediaDevices.getUserMedia()`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) 
* [`MediaRecorder`](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)

## Want to help?

If you see something that can be improved, by all means submit a pull request for review. I threw this together from other projects I've worked on, spec example boilerplate and a few other places. 

I'm least familiar with integarting this code with hyper. I mostly used code from the hyperpower plugin to get everything working, though I'm sure there are ways to improve my reframing of their code.

## Planned improvements

Using `ffmpeg` or a similar utility to convert from `.webm` to `.mp4` automatically is my next goal. Since there is no re-encoding necessary, it should be possible to convert from `.webm` to `.mp4` on the fly.

