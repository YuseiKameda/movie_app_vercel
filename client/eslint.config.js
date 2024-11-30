export default [
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: "@babel/eslint-parser",
      parserOptions: {
        requireConfigFile: false,
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off", // React 17以降では不要
    },
  },
];
