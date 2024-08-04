import {Component} from 'react';
import {AppState} from 'react-native';
import everyInterval from './everyInterval';

const MIN = 60 * 1000;

export default class TimeMonitor extends Component {
  static now() {
    return Math.floor(Date.now() / MIN) * MIN;
  }

  componentDidMount() {
    this.startMonitoringTime();
    const {remove} = AppState.addEventListener(
      'change',
      this.handleAppStateChange,
    );
    this.unmount = remove;
  }

  componentWillUnmount() {
    this.stopMonitoringTime();
    this.unmount();
  }

  handleAppStateChange = nextAppState => {
    if (nextAppState === 'active') {
      this.props.onTimeChanged(TimeMonitor.now());
      this.startMonitoringTime();
    } else {
      this.stopMonitoringTime();
    }
  };

  intervalHandle = null;
  startMonitoringTime() {
    if (this.intervalHandle == null) {
      this.intervalHandle = everyInterval(
        now => this.props.onTimeChanged(now),
        MIN,
      );
    }
  }
  stopMonitoringTime() {
    if (this.intervalHandle != null) {
      this.intervalHandle();
      this.intervalHandle = null;
    }
  }

  render() {
    return null;
  }
}
