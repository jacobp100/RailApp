import React, { Component } from "react";
import {
  View,
  Text,
  Button,
  DatePickerIOS,
  Modal,
  StyleSheet
} from "react-native";

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: "auto",
    paddingHorizontal: 12,
    backgroundColor: "#E5E5E5"
  },
  datePicker: {
    backgroundColor: "white"
  }
});

export default class DatePickerModal extends Component {
  state = { visible: false, date: null };

  res = null;
  rej = null;
  open = ({ date, minimumDate, maximumDate }) => {
    if (this.rej != null) this.rej();
    this.setState({ visible: true, date, minimumDate, maximumDate });
    return new Promise((res, rej) => {
      this.res = res;
      this.rej = rej;
    });
  };

  setDate = date => this.setState({ date });

  done = () => {
    this.setState({ visible: false }, () => {
      if (this.res != null) this.res(this.state.date);
      this.res = null;
      this.rej = null;
    });
  };

  cancel = () => {
    this.setState({ visible: false }, () => {
      if (this.rej != null) this.rej();
      this.res = null;
      this.rej = null;
    });
  };

  render() {
    const { mode, minuteInterval } = this.props;
    const { visible, date, maximumDate, minimumDate } = this.state;

    return (
      <Modal transparent visible={visible}>
        <View style={styles.bar}>
          <Button title="Cancel" onPress={this.cancel} />
          <Button title="Done" onPress={this.done} />
        </View>
        {date != null && (
          <DatePickerIOS
            mode={mode}
            minuteInterval={minuteInterval}
            date={date}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            onDateChange={this.setDate}
            style={styles.datePicker}
          />
        )}
      </Modal>
    );
  }
}
