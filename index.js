const { getDefaultConfig, getCompleteConfig, setWindow, isRecording, timedRecording, startRecording, stopRecording } = require('./capture');

var userConfig = false;

exports.decorateConfig = (config) => {
  if (! userConfig) userConfig = getCompleteConfig(config.hyperCapture);
  return config;
}


exports.onApp = (app) => {
  // the commented-out code below never works in my tests because it never calls disableHardwareAcceleration before app is ready.  
  // try {
  //   app.disableHardwareAcceleration();
  // } catch (e) {
  //   console.log(e);
  // }
  console.log('onApp');
  console.log('!!!', JSON.stringify(userConfig, null, 4));
  if (userConfig && userConfig.gpuFix) {
    if (! process.argv.some(function (el) { return el.toLowerCase() === '--disable-gpu'}) ) {
      console.log('relaunching to disable gpu for capture fix');
      app.relaunch({args: process.argv.slice(1).concat(['--disable-gpu'])});
      app.exit(0);
    }
  }
}

exports.middleware = (store) => (next) => (action) => {
  //if (action.type.indexOf('SESSION_') > -1) {
  // if (action.type === 'SESSION_USER_DATA') {
  //   console.log(JSON.stringify(action, null, 4));
  // }
  if ('SESSION_ADD_DATA' === action.type) {
    const commandTest = /(togglecapture: command not found)|(command not found: togglecapture|'togglecapture' is not recognized as an internal or external command,(\noperable program or batch file.)?)/m;
    const { data } = action;
    if (commandTest.test(data)) {
      store.dispatch({
        type: 'CAPTURE_MODE_TOGGLE'
      });
    } else {
      next(action);
    }
  } else {
    next(action);
  }
};

exports.reduceUI = (state, { type, config }) => {
  switch (type) {
    case 'CONFIG_LOAD':
    case 'CONFIG_RELOAD': {
      try {
        userConfig = getCompleteConfig(config.hyperCapture);
      } catch (e) {
        console.log(e);
        userConfig = getDefaultConfig();
      }
      break;
    }
    case 'CAPTURE_MODE_TOGGLE': {
      return state.set('captureActive', !state.captureActive);
      break;
    }
  }
  return state;
};

exports.mapTermsState = (state, map) => {
  return Object.assign(map, {
    captureActive: state.ui.captureActive
  });
};

const passProps = (uid, parentProps, props) => {
  return Object.assign(props, {
    captureActive: parentProps.captureActive
  });
}

exports.getTermGroupProps = passProps;
exports.getTermProps = passProps;

// const getKey = () => app.config.getConfig().toggleRecordingKey || defaultKey

// exports.onApp = () => {
//   globalShortcut.register(getKey(), toggleRecording)
// }

// exports.onUnload = () => {
//   globalShortcut.unregister(getKey())
// }

exports.decorateTerm = (Term, { React, notify }) => {
  return class extends React.Component {
    constructor (props, context) {
        super(props, context);
        this._onTerminal = this._onTerminal.bind(this);
    }

    _onTerminal (term) {
        if (this.props.onTerminal) this.props.onTerminal(term);
        try {
          setWindow(userConfig);
        } catch (e) {
          setWindow();
        }
    }

    componentWillReceiveProps (next) {
      if (next.captureActive && !this.props.captureActive) {
        startRecording(null, (function () {
          notify('Terminal recording started');
        }));
        
      } else if (!next.captureActive && this.props.captureActive) {
        stopRecording();
        notify('Terminal recording has stopped');
      }
    }

    render () {
      return React.createElement(Term, Object.assign({}, this.props, {
        onTerminal: this._onTerminal
      }));
    }

    componentWillUnmount () {
      if (this._observer) {
        this._observer.disconnect();
      }
    }
  }
};
