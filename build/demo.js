const { uploadFiles } = require("./qiniu");
const path = require("path");

uploadFiles(path.resolve(__dirname, "../demo/assets"), "assets");