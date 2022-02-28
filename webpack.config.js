const path = require("path");
module.exports = {
   mode: "development",
   entry: path.resolve(__dirname,"main.js"),
   output: {
     path: path.resolve(__dirname), 
     filename: "index.js" 
   },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [ { loader: "style-loader" }, { loader: "css-loader" } ],
      },
    ]
  },
  devServer: {
    static: "./"
  }
};