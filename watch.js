const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");
const tinify = require("tinify");
const chokidar = require("chokidar");
const util = require("util");
const execFile = util.promisify(require("child_process").execFile);
const pngquant = require("pngquant-bin");
const jpegtran = require("jpegtran-bin");
const chalk = require("chalk");
const { getFileName, initDir } = require("./tool"); // 输出对应的文件路径
const glob = require("glob");
const { AsyncParallelBailHook, AsyncParallelHook } = require("tapable");

// 配置信息
const config = require("./config");
tinify.key = config.key;

initDir(); // 初始化图片文件夹

const error = (txt) => console.error(chalk.red(txt));

chokidar.watch("./img/*.{jpg | jpeg | png}").on("add", async (file) => {
  const extName = (path.extname(file) || "").replace(/\./g, "");
  const lowcaseName = String.prototype.toLowerCase.call(extName);
  if (["jpg", "jpeg", "png"].includes(lowcaseName)) {
    // 仅处理图片后缀名的文件
    const filePath = path.join(__dirname, file);
    const [originalPath, compressionPath] = await getFileName(filePath); // 文件名添加内容哈希
    if (fs.existsSync(compressionPath)) {
      error("文件已存在");
      return;
    }
    if (lowcaseName === "png") {
      pngProcess({ originalPath, compressionPath, filePath });
    }
  }
});

const process = new AsyncParallelBailHook();
process.tapPromise("png", ({ originalPath, compressionPath, filePath }) => {
  return execFile(pngquant, [
    "--strip",
    "--skip-if-larger",
    "--quality 60-80",
    "-o",
    compressionPath,
    filePath,
  ]).then(
    () => {},
    ({ stdout, stderr }) => {
      const { code } = stderr;
      if (code == 15) {
        error("文件已存在");
        return stdout;
      }
      if (code == 98) {
        setTimeout(() => {
          fs.rename(filePath, originalPath, (err) => {
            // 源文件会剪切至 out/original 目录
            if (err) {
              error(err);
              return stdout;
            }
            const source = tinify.fromFile(originalPath); // 对文件进行压缩
            source.toFile(compressionPath);
          });
        }, 0);
      }
      error(stderr);
    }
  );
});
process.tapAsync("png", ({ originalPath, compressionPath, filePath }) => {
  execFile(
    pngquant,
    [
      "--strip",
      "--skip-if-larger",
      "--quality 60-80",
      "-o",
      compressionPath,
      filePath,
    ],
    (err) => {
      const { code } = err || {};
      if (code == 15) {
        error("文件已存在");
        return;
      }
      if (code == 98) {
        setTimeout(() => {
          fs.rename(filePath, originalPath, (err) => {
            // 源文件会剪切至 out/original 目录
            if (err) {
              error(err);
              return;
            }
            const source = tinify.fromFile(originalPath); // 对文件进行压缩
            source.toFile(compressionPath);
          });
        }, 0);
        return;
      }
      if (!err) {
        fs.unlink(filePath, (err) => {
          err && error(err);
        });
      }
      err && error(err);
    }
  );
});

const jpgProcess = ({ originalPath, compressionPath, filePath }) => {
  execFile(
    jpegtran,
    [
      "-copy none",
      "-optimize",
      "-progressive",
      "-outfile",
      compressionPath,
      filePath,
    ],
    (err) => {
      if (err) {
        error(err);
        return;
      }
      fs.unlink(filePath, (err) => {
        err && error(err);
      });
    }
  );
};
