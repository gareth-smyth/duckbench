export default {
  presets: [
    ["@babel/preset-env", { targets: { node: "current" }, modules: false }],
    "@babel/preset-typescript",
  ],
  plugins: [
    [
      "add-import-extension",
      {
        extension: "js",
      },
    ],
  ],
};
