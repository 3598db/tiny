const path = require("path");

module.exports = {
  entry: "./example/src/index.js",
  output: {
    path: path.resolve("./example/dist"),
  },
  context: process.cwd(),
};
