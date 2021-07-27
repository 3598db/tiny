const tinypack = require("./src/tinypack");
const options = require("./webpack.config");

const compiler = tinypack(options);

compiler.run((err, stats) => {
  console.log(stats);
});
