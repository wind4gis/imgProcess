/*
 * @Date: 2020-05-20 11:29:38
 * @LastEditors: Huang canfeng
 * @LastEditTime: 2020-05-21 17:20:40
 * @Description:
 */

const fs = require("fs");
const path = require("path");
const chokidar = require("chokidar");
const execFile = require("child_process").execFile;
const jpegRecompress = require("jpeg-recompress-bin");
const pngquant = require("pngquant-bin");
const optipng = require("optipng-bin");
const chalk = require("chalk");
const { getFileName, initDir } = require("./tool"); // 输出对应的文件路径
const { AsyncSeriesBailHook } = require("tapable");

initDir(); // 初始化图片文件夹

let buffer = [];
let flag = false;

const error = (txt) => console.error(chalk.red(txt));
const info = (txt) => console.log(chalk.green(txt));

const process = new AsyncSeriesBailHook(["imgInfo"]);

process.tapAsync("jpegtran", ({ compressionPath, filePath, lowcaseExt }, callback) => {
  if (!["jpg", "jpeg"].includes(lowcaseExt)) return callback();
  execFile(
    jpegRecompress,
    ["--quality", "high", "--method", "ms-ssim", "--min", "60", filePath, compressionPath],
    (err) => {
      if (err) return callback({ success: false, msg: err });
      callback({ success: true, msg: "图片已压缩完毕" });
    }
  );
});

process.tapAsync("pngquant", ({ compressionPath, filePath, lowcaseExt }, callback) => {
  if ("png" !== lowcaseExt) return callback();
  execFile(
    pngquant,
    ["--strip", "--skip-if-larger", "--quality", "65-80", "-o", compressionPath, filePath],
    (err) => {
      const { code } = err || {};
      if (!err) return callback({ success: true, msg: "图片已压缩完毕" });
      if (code === 15) return callback({ success: true, msg: "文件已存在" });
      if (code === 98) return callback();
      callback({ success: false, msg: err });
    }
  );
});

process.tapAsync("optiPng", ({ compressionPath, filePath, lowcaseExt }, callback) => {
  if ("png" !== lowcaseExt) return callback();
  execFile(optipng, ["-strip", "all", "-o", 6, "-out", compressionPath, filePath], (err) => {
    if (err) return callback({ success: false, msg: err });
    callback({ success: true, msg: "图片已压缩完毕" });
  });
});

chokidar.watch("./img").on("add", (file) => {
  console.log(file, flag, "开始接收");
  if (flag) {
    buffer.push(file);
  } else {
    write(file, clearBuffer);
  }
});

const preProcess = async (file) => {
  const extName = (path.extname(file) || "").replace(/\./g, "");
  const lowcaseExt = String.prototype.toLowerCase.call(extName);
  // 仅处理图片后缀名的文件
  const filePath = path.join(__dirname, file);
  const [originalPath, compressionPath] = await getFileName(filePath); // 文件名添加内容哈希
  if (fs.existsSync(compressionPath)) {
    throw new Error("文件已存在");
  }
  return { originalPath, compressionPath, filePath, lowcaseExt };
};

const write = async (file, cb) => {
  flag = true;
  try {
    console.log(file, "开始处理")
    const { originalPath, compressionPath, filePath, lowcaseExt } = await preProcess(file);
    // 进行处理
    process.callAsync(
      { originalPath, compressionPath, filePath, lowcaseExt },
      ({ success, msg }) => {
        if (!success) return error(msg);
        info(msg);
        fs.rename(filePath, originalPath, (err) => {
          err && error(err);
        });
        console.log(filePath, "处理结束");
        cb();
      }
    );
  } catch (err) {
    error(err);
    cb();
  }
};

const clearBuffer = () => {
  let buf = buffer.shift();
  if (buf) {
    write(buf, clearBuffer);
  } else {
    console.log("缓冲区没有数据，重置为false")
    flag = false;
  }
};
