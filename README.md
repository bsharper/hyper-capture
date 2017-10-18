# hyper-capture

Capture the output of [hyper](http://hyper.is) to a video file.

**Note: if this extension is used on Windows, there is a good chance you'll need to enable the `gpuFix` option to prevent  recordings from being blank (other than the cursor and window decoration). For more information, look under the options section below**

## Screencaps
Quick explaination since these gifs look very similar. The first gif is a desktop capture of the hyper window. The second gif is the result from running `togglecapture`, which how this plugin is used.
![Desktop capture](https://github.com/bsharper/hyper-capture/raw/master/screenshots/desktop-capture.gif)
*Desktop capture using QuickTime*


![hyper-capture capture](https://github.com/bsharper/hyper-capture/raw/master/screenshots/hyper-capture-capture.gif)
*Capture using this very plugin*

## Usage

Add `hyper-capture` to the `.hyper.js` file and reload hyper. To start capturing terminal activity, type `togglecapture`. A 'save file' dialog will open, pick a file name and location and the capture will begin. To stop the capture, type `togglecapture` again.

## Options

The options are listed below. They go in the `.hyper.js` file.

    {
        gpuFix: false,
        webmMimeType: 'video/webm;codecs=h264',
        videoMimeType: 'video/webm;codecs=h264',
        videoBPS: 10000000
    }

### videoMimeType:

Options

* video/webm;codecs=h264 (default)
* video/webm;codecs=vp8
* video/webm;codecs=vp9

If you notice issues of the quality of the recordings, consider using vp9. It will require re-encoding to change it to h264, but the quality in general seems better. The next version might use vp9 as the default (especially if ffmpeg is properly integrated to provide seamless post capture conversion).

### gpuFix: (fix for blank recordings on Windows)

If you enable `gpuFix`, hardware acceleration will be disabled. It is important to know that this option will relaunch hyper with the `--disable-gpu` command line argument set if it is not set at launch. If you will be making lots of recordings, consider adding `--disable-gpu` to the launch parameters of hyper to prevent the relaunch. **When this option is enabled, you should enable this extension separately from other extensions. The relaunch could cause issues when other extensions are installing. **

## What should I do with this `.webm` file?

*Short version*

    ffmpeg -i file.webm -vcodec copy file.mp4

*Slightly longer version*

This plugin only uses built in capabilities provided by Electron. As such, the only available format is `webm`. At least that I've found. This plugin saves files as `video/webm;codecs=h264`, which is the h264 variant of the MKV-ish `webm` format. This means no recoding is necessary, it just needs to be put in a different container format.

## Technical information

This plugin uses:

* [`desktopCapturer`](https://github.com/electron/electron/blob/master/docs/api/desktop-capturer.md) from Electron
* [`MediaDevices.getUserMedia()`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) 
* [`MediaRecorder`](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)

## Want to help?

If you see something that can be improved, by all means submit a pull request for review. I threw this together from other projects I've worked on, spec example boilerplate and a few other places. 

I'm least familiar with integarting this code with hyper. I mostly used code from the hyperpower plugin to get everything working, though I'm sure there are ways to improve my reframing of their code.

## Planned improvements

Using `ffmpeg` or a similar utility to convert from `.webm` to `.mp4` automatically is my next goal. Since there is no re-encoding necessary, it should be possible to convert from `.webm` to `.mp4` on the fly.

