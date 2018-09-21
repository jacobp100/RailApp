import React, { Component } from "react";
import { Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import DatePickerModal from "./DatePickerModal";

const styles = StyleSheet.create({
  pickDate: {
    color: "#BABABA",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8
  },
  clear: {
    marginLeft: 6
  },
  hidden: {
    display: "none"
  }
});

export default class DatePicker extends Component {
  datePicker = React.createRef();
  showDatePicker = () => {
    const { value } = this.props;
    this.datePicker.current
      .open({
        date: value != null ? new Date(value) : new Date()
      })
      .then(date => this.props.onDateChanged(date.getTime()), () => {});
  };

  clearCustomDate = () => this.props.onDateChanged(null);

  render() {
    const { value } = this.props;
    return (
      <React.Fragment>
        <TouchableOpacity onPress={this.showDatePicker}>
          <Text style={styles.pickDate}>
            {value == null ? "SET TIME" : "CUSTOM TIME SET"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={value == null && styles.hidden}
          onPress={this.clearCustomDate}
        >
          <Image
            source={require("../assets/Cancel.png")}
            style={styles.clear}
          />
        </TouchableOpacity>
        <DatePickerModal
          ref={this.datePicker}
          mode="datetime"
          minuteInterval={5}
        />
      </React.Fragment>
    );
  }
}
