const { setWindow, isRecording, timedRecording, startRecording, stopRecording } = require('./capture');

exports.onTerminal = win => {
    console.log('onTerminal event');
    setWindow();
}

exports.middleware = (store) => (next) => (action) => {
  if ('SESSION_ADD_DATA' === action.type) {
    const { data } = action;
    if (/(togglecapture: command not found)|(command not found: togglecapture)/.test(data)) {
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

exports.reduceUI = (state, action) => {
  switch (action.type) {
    case 'CAPTURE_MODE_TOGGLE':
      return state.set('captureActive', !state.captureActive);
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
        setWindow();
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
      document.body.removeChild(this._canvas);
      if (this._observer) {
        this._observer.disconnect();
      }
    }
  }
};
