import { Component } from "react";
import { DatePickerAndroid } from "react-native";

// NOT TESTED™️
export default class DatePickerModal extends Component {
  open = ({ date, minimumDate, maximumDate }) =>
    DatePickerAndroid.open({
      date,
      minDate: minimumDate,
      maxDate: maximumDate,
      mode: "calendar"
    }).then(({ year, month, day }) => new Date(year, month, day));

  render() {
    return null;
  }
}
