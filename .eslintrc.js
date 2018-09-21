module.exports = {
  parser: "babel-eslint",
  extends: ["airbnb", "prettier", "prettier/react"],
  globals: {
    fetch: true
  },
  rules: {
    "lines-between-class-members": 0,
    "global-require": 0,
    "no-nested-ternary": 0,
    "no-else-return": 0,
    "no-empty": 0,
    "no-shadow": 0,
    "no-restricted-syntax": 0,
    "import/no-unresolved": 0,
    "react/jsx-filename-extension": 0,
    "react/prop-types": 0,
    "react/sort-comp": 0,
    "react/destructuring-assignment": 0
  }
};
