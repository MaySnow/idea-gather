const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.resolve(__dirname, "../.env") });
const glob = require("glob");
const chalk = require("chalk");

const { ACCESS_KEY, SECRET_KEY, BUCKET } = process.env;

const qiniu = require("qiniu");

const mac = new qiniu.auth.digest.Mac(ACCESS_KEY, SECRET_KEY);

let putPolicy = new qiniu.rs.PutPolicy({
  scope: BUCKET,
});
const uploadToken = putPolicy.uploadToken(mac);

const config = new qiniu.conf.Config();
// 空间对应的机房
// 华北机房
config.zone = qiniu.zone.Zone_z1;
// 上传是否使用cdn加速
config.useCdnDomain = true;

/**
 * 单个文件上传
 * @param {*} fileName 文件名称 
 * @returns 
 */
function upload(fileName, cwd, prefix, isFile = false) {
  return new Promise((resolve, reject) => {
    const localFile = isFile ? cwd : path.resolve(cwd, `./${fileName}`);
    console.log("上传文件地址", localFile);
    const formUploader = new qiniu.form_up.FormUploader(config);
    const putExtra = new qiniu.form_up.PutExtra();
    formUploader.putFile(uploadToken, `${prefix}/${fileName}`, localFile, putExtra, function(respErr,
      respBody, respInfo) {
      if (respErr) {
        return reject(respErr);
      }
      if (respInfo.statusCode == 200) {
        console.log(chalk.green("上传成功"), chalk.green(`http://img.mayxiaoyu.com/${respBody.key}`));
        resolve(respBody);
      } else {
        console.log(respInfo.statusCode);
        reject(respBody);
      }
    });
  });
}

function uploadFiles(cwd, prefix) {
  return new Promise((resolve, reject) => {
    const files = glob.sync('**/*.*', {
      cwd
    }).map(fileName => {
      return upload(fileName, cwd, prefix)
    });
    
    // upload("vendor.5c77c08d.js")
    
    Promise.all(files).then(res => {
      console.log(chalk.green("****** 上传完成 ******"));
      resolve(res);
    }).catch(e => {
      console.log("上传失败", e);
      throw new Error(e);
    });
  })
}

function getFileInfo(file) {
  return new Promise((resolve, reject) => {
    //获取文件信息
    const bucketManager = new qiniu.rs.BucketManager(mac, config);
    bucketManager.stat(BUCKET, file, function(err, respBody, respInfo) {
      if (err) {
        console.log(err);
        //throw err;
        reject(err);
      } else {
        if (respInfo.statusCode == 200) {
          console.log(respBody);
          resolve(respBody);
        } else {
          reject({
            statusCode: respInfo.statusCode,
            error: respBody.error
          });
        }
      }
    });
  });
}
/**
 * 文件是否存在
 * @param {*} file 
 * @returns 
 */
function isFileExist(file) {
  return new Promise((resolve, reject) => {
    getFileInfo(file).then(() => resolve(true)).catch(res => {
      if (res && res.statusCode === 612) {
        return resolve(false);
      }
      reject(res);
    })
  })
}

module.exports = {
  uploadFiles,
  uploadToken,
  uploadConfig: config,
  getFileInfo,
  isFileExist,
  upload
}