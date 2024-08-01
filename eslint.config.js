export default [
  {
      files: ["**/*.js"],
      languageOptions: {
          ecmaVersion: 2021,
          sourceType: "module",
          globals: {
              document: "readonly",
              window: "readonly",
              console: "readonly",
              fetch: "readonly",
              setTimeout: "readonly",
              CustomEvent: "readonly",
              DOMParser: "readonly",
              localStorage: "readonly",
              videojs: "readonly",
              Handlebars: "readonly",
          },
      },
      rules: {
          "linebreak-style": ["off"],
          "no-console": ["off"],
          "no-undef": ["error"],
          "no-useless-escape": ["error"],
          "no-redeclare": ["error"],
          "no-prototype-builtins": ["error"],
      },
  },
];