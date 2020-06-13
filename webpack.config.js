const path = require("path")
var nodeExternals = require("webpack-node-externals")

module.exports = {
  mode: "production",
  target: "node",
  devtool: "source-map",
  context: path.resolve(__dirname, "src"),
  entry: "./index.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },
    ],
  },
  externals: [nodeExternals()],
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "index.js",
    libraryTarget: "commonjs2",
    path: path.resolve(__dirname, "dist"),
  },
}
