import {Component} from 'react';
import {Keyboard as NativeKeyboard} from 'react-native';

const listeners = new Set();

let height = 0;

NativeKeyboard.addListener('keyboardWillShow', e => {
  height = e.endCoordinates.height; // eslint-disable-line
  listeners.forEach(l => {
    if (l.props.onShow) l.props.onShow(height);
    l.forceUpdate();
  });
});

NativeKeyboard.addListener('keyboardWillHide', () => {
  height = 0;
  listeners.forEach(l => {
    if (l.props.onHide) l.props.onHide();
    l.forceUpdate();
  });
});

export default class Keyboard extends Component {
  componentDidMount() {
    listeners.add(this);
  }

  componentWillUnmount() {
    listeners.delete(this);
  }

  render() {
    const {children} = this.props;
    return typeof children === 'function' ? children(height) : null;
  }
}
