const { isFileExist, upload } = require("./qiniu");
const path = require("path");
const chalk = require("chalk");
const winston = require('winston');
const { format } = winston;
const { combine, timestamp, label, printf } = format;
const myFormat = printf(({ url, key, message, timestamp }) => {
  return `${timestamp} [${key}]: ${url} ${message}`;
});
const logger = winston.createLogger({
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    myFormat
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({filename: path.resolve(__dirname, "./record/staticFiles.log")})
  ]
})

const inquirer = require('inquirer');
const questions = [
  {
    type: 'input',
    name: 'filePath',
    message: "请输入要上传的文件绝对路径，可以使用 pwd 命令查看",
    validate(value) {
      if (value) {
        return true;
      }
      return "文件绝对路径不能为空"
    },
  },
  {
    type: 'input',
    name: 'fileName',
    message: "请输入显示的文件名称",
  },
  {
    type: 'input',
    name: 'fileDesc',
    message: "请输入文件描述",
  }
];

async function run() {
  const answers =  await inquirer.prompt(questions);
  const { filePath, fileName, fileDesc } = answers;
  const extname = path.extname(filePath);
  const basename = path.basename(filePath, extname);
  // 如果没有重命名就用原来的名字
  const name = (fileName || basename) + extname;
  const key =`static/${name}`;
  const domain = `http://img.mayxiaoyu.com/`;
  const isExit = await isFileExist(key);
  if (isExit) {
    console.log(chalk.red(`文件已存在: ${key}`), domain + key);
    return;
  }
  const resFile = await upload(name, filePath, "static", true);

  logger.log({
    level: 'info',
    // 链接
    url: `${domain}${resFile.key}`,
    // 七牛存储的 key
    key: resFile.key,
    // 描述
    message: fileDesc
  });
}
run().catch(e => {
  console.log(chalk.red("****** 上传失败 ******"));
  throw new Error(e);
});
// inquirer.prompt(questions).then((answers) => {
//   const { filePath, fileName, fileDesc } = answers;
//   const extname = path.extname(filePath);
//   const basename = path.basename(filePath, extname);
//   // 如果没有重命名就用原来的名字
//   const name = (fileName || basename) + extname;

//   upload(name, filePath, "static", true).then(res => {

//   });
//   logger.log({
//     level: 'info',
//     // 链接
//     url: "ksksk",
//     // 七牛存储的 key
//     key: name,
//     // 描述
//     message: fileDesc
//   });
// });

// getFileInfo("assets/vendor.5c77c08.js");