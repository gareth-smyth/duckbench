import globals from "globals";
import pluginJs from "@eslint/js";
import typescriptEslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";

/** @type {import('eslint').Linter.Config[]} */
export default typescriptEslint.config(
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    rules: {
      "import/order": ["error"],
      "no-unused-vars": [
        "error",
        {
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      "no-unused-expressions": [
        "error",
        { allowShortCircuit: true, allowTernary: true },
      ],
      "@typescript-eslint/no-unused-expressions": [
        "error",
        { allowShortCircuit: true, allowTernary: true },
      ],
    },
  },
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node, m: "readonly" },
    },
  },
  pluginJs.configs.recommended,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  ...typescriptEslint.configs.recommended,
);
