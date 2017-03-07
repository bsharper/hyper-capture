var fs = require('fs');
var os = require('os');
var path = require('path');
var electron = require('electron');

var remote = electron.remote;
var dialog = electron.dialog;
var desktopCapturer = electron.desktopCapturer;

var win; // = remote.getCurrentWindow();
var bounds; // = win.getBounds();

var config = {
    gpuFix: false,
    webmMimeType: 'video/webm;codecs=h264',
    videoMimeType: 'video/webm;codecs=h264',
    videoBPS: 10000000
}

var recorder = false;
var outputFileStream = false;
var saveDialogOpen = false;


function setWindow(conf) {
    config = getCompleteConfig(conf);
    win = remote.getCurrentWindow();
    bounds = win.getBounds();
}

function getDefaultSavePath() {
    var homedir = os.homedir();
    return path.resolve(homedir, 'Desktop');
}

function getSaveLocation() {
    // {name: 'MP4 file format', extensions: ['mp4']}, 
    var fileFilters = [{name: 'WebM file format', extensions: ['webm']}];
    var validExts = [".webm"];
    saveDialogOpen = true;

    return new Promise((resolve, reject) => {
        remote.dialog.showSaveDialog({
            title: 'Save terminal recording as',
            defaultPath: getDefaultSavePath(),
            filters: fileFilters,
            message: `Screen capture will begin as soon as the 'Save' button is clicked`
        }, (filename) => {
            if (typeof filename === 'string' && filename.length > 0) {
                var ext = path.extname(filename).toLowerCase();
                if (validExts.indexOf(ext) === -1) filename = `${filename}.webm`;
                //if (ext === '.webm') videoMimeType = config.webmMimeType;
                saveDialogOpen = false;
                resolve(filename);
            } else {
                saveDialogOpen = false;
                reject(`Incorrect filename '${filename}'. Recording will not start`);
            }
        });
    });
}

function getSource() {
  return new Promise((resolve, reject) => {
    desktopCapturer.getSources({
      types: ['window']
    }, (error, sources) => {
      if (error) return reject(error);
      var list = sources.filter(el => {
        return el.name === 'Hyper'
      });
      if (list.length === 0) return reject(new Error('Could not find correct source'));
      resolve(list[0]);
    });
  });
}

function getStream(source) {
  return new Promise((resolve, reject) => {
    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: source.id,
          minWidth: bounds.width,
          maxWidth: bounds.width,
          minHeight: bounds.height,
          maxHeight: bounds.height
        }
      }
    }).then(st => {
        resolve(st);
    }).catch(err => {
        reject(err);
    })
  });
}

function blobToArrayBuffer(blob) {
  return new Promise((resolve, reject) => {

    var arrayBuffer;
    var fileReader = new FileReader();
    fileReader.onload = function() {
        arrayBuffer = this.result;
        resolve(arrayBuffer);
    };
    fileReader.readAsArrayBuffer(blob);
  });
}

function stopRecording(force) {
    if (typeof force === 'undefined') force = false;
    if (recorder || force) {
        recorder.stop();
        recorder = false;
    }    
}

function recordToFileStream(filename, stream) {
    stopRecording();

    outputFileStream = fs.createWriteStream(filename);

    recorder = new MediaRecorder(stream, {mimeType: config.videoMimeType, videoBitsPerSecond: config.videoBPS, audioBitsPerSecond: 0});
    recorder.ondataavailable = function (event) {
      var blob = event.data;
      blobToArrayBuffer(event.data).then(arrayBuffer => {
        if (recorder) outputFileStream.write(new Buffer(arrayBuffer));
      });
    }
    recorder.onstop = function () {
        outputFileStream.end();
    }
    recorder.onerror = function (err) {
        try {
            console.log(err);
            stopRecording(true);
        } catch (e) {}
    }
    recorder.start();
}

function timedRecording(filename, ms) {
    startRecording(filename);
    setTimeout(() => {
        stopRecording();
    }, ms);
}

function startRecording(filename, cb) {
    if (saveDialogOpen) return;
    var p = Promise.resolve(filename);
    if (typeof filename !== 'string') p = getSaveLocation();
    p.then(fn => {
        filename = fn;
        return getSource();
    }).then(source => {
        return getStream(source);
    }).then(stream => {
        if (cb) {
            setImmediate(function () {
                try { cb(); } catch (e) { console.log(e) }
                });
        }
        return recordToFileStream(filename, stream);
        
    }).catch(err => {
        console.log(err);
    });
       
}

function isRecording() {
    return !!recorder;
}

var configValidation = {
    videoMimeType: function (val) {
        var validMimeTypes = ['video/webm;codecs=h264', 'video/webm;codecs=vp8', 'video/webm;codecs=vp9'];
        var val = val.toLowerCase().replace(/ /g, '');
        return validMimeTypes.indexOf(val) > -1;
    }
}
configValidation.webmMimeType = configValidation.videoMimeType;

function getCompleteConfig(conf) {
    if (typeof conf !== 'object') return getDefaultConfig();
    var newConfig = getDefaultConfig();
    if (typeof conf === 'undefined') conf = {};
    Object.keys(newConfig).forEach(k => {
        if (Object.keys(conf).indexOf(k) > -1) {
            if (Object.keys(configValidation).indexOf(k) > -1) {
                if (configValidation[k](conf[k])) newConfig[k] = conf[k];
            } else {
                newConfig[k] = conf[k];
            }
            
        }
    });
    return newConfig;
}


function getDefaultConfig() {
  return {
    gpuFix: false,
    webmMimeType: 'video/webm;codecs=h264',
    videoMimeType: 'video/webm;codecs=h264',
    videoBPS: 10000000
  }
}


exports.getCompleteConfig = getCompleteConfig;
exports.getDefaultConfig = getDefaultConfig;
exports.setWindow = setWindow;
exports.isRecording = isRecording;
exports.timedRecording = timedRecording;
exports.startRecording = startRecording;
exports.stopRecording = stopRecording;
