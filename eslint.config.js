import {fixupConfigRules} from "@eslint/compat";
import pluginJs from "@eslint/js";
import stylistic from '@stylistic/eslint-plugin'
import * as tsParser from "@typescript-eslint/parser";
import {Linter} from "eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import globals from "globals";
import tsEslint from "typescript-eslint";

/** @type {Linter.FlatConfig[]} */
const config = [
  pluginJs.configs.recommended,
  ...tsEslint.configs.strictTypeChecked,
  ...tsEslint.configs.stylisticTypeChecked,
  ...fixupConfigRules(pluginReactConfig),
  {
    files: [
      "libraries/**/*.{ts,tsx,js,jsx}",
      "scripts/**/*.{ts,tsx,js,jsx}",
      "source/**/*.{ts,tsx,js,jsx}",
    ],
    ignores: [
      "build/*",
      "dev/*",
      "node_modules/*",
    ],
    languageOptions: {
      globals: globals.browser,
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "es6",
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      }
    },
    plugins: {
      "@stylistic": stylistic,
    },
    rules: {
      "@stylistic/arrow-parens": ["error", "always"],
      "@stylistic/block-spacing": "error",
      "@stylistic/brace-style": ["error", "1tbs", {"allowSingleLine": false}],
      "@stylistic/comma-dangle": ["error", "always-multiline"],
      "@stylistic/comma-spacing": ["error", {"before": false, "after": true}],
      "@stylistic/comma-style": ["error", "last"],
      "@stylistic/computed-property-spacing": ["error", "never"],
      "@stylistic/keyword-spacing": ["error", {"before": true, "after": true}],
      "@stylistic/indent": ["error", 2],
      "@stylistic/lines-between-class-members": ["error", "always"],
      "@stylistic/line-comment-position": ["error", {"position": "above"}],
      "@stylistic/no-confusing-arrow": "error",
      "@stylistic/no-extra-semi": "error",
      "@stylistic/no-floating-decimal": "error",
      "@stylistic/no-multiple-empty-lines": ["error", {"max": 1}],
      "@stylistic/no-multi-spaces": "error",
      "@stylistic/new-parens": "error",
      "@stylistic/no-tabs": "error",
      "@stylistic/nonblock-statement-body-position": ["error", "beside"],
      "@stylistic/quotes": ["error", "double"],
      "@stylistic/rest-spread-spacing": ["error", "never"],
      "@stylistic/semi": ["error", "always"],
      "@stylistic/semi-style": ["error", "last"],
      "array-bracket-spacing": "error",
      "no-unused-vars": "error",
      "object-curly-spacing": "error",
      "object-property-newline": "error",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];

export default config;
