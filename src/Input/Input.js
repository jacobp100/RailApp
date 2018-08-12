import React, { Component } from "react";
import { TextInput } from "react-native";

export default class Input extends Component {
  state = { input: "" };

  onChangeText = input => {
    this.setState({ input });
    this.props.onChangeText(input);
  };

  onBlur = () => {
    this.setState({ input: "" });
    this.props.onBlur();
  };

  render() {
    const {
      value,
      active,
      style,
      placeholder,
      // onChangeText,
      // onBlur,
      onFocus
    } = this.props;

    return (
      <TextInput
        ref={this.input}
        style={style}
        value={active ? this.state.input : value}
        placeholder={placeholder}
        selectionColor="white"
        onChangeText={this.onChangeText}
        onBlur={this.onBlur}
        onFocus={onFocus}
      />
    );
  }
}
