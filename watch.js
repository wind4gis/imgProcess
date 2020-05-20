const fs = require("fs");
const path = require("path");
const tinify = require("tinify");
const chokidar = require("chokidar");
const execFile = require("child_process").execFile;
const pngquant = require("pngquant-bin");
const chalk = require("chalk");
const { getFileName, initDir } = require("./tool"); // 输出对应的文件路径

// 配置信息
const config = require("./config");
tinify.key = config.key;

initDir(); // 初始化图片文件夹

const error = txt => console.error(chalk.red(txt))

chokidar.watch("./img").on("add", async (file) => {
  const extName = (path.extname(file) || "").replace(/\./g, "");
  const lowcaseName = String.prototype.toLowerCase.call(extName);
  if (config.pictureType.includes(lowcaseName)) {
    // 仅处理图片后缀名的文件
    const filePath = path.join(__dirname, file);
    const [originalPath, compressionPath] = await getFileName(filePath); // 文件名添加内容哈希
    if (fs.existsSync(compressionPath)) {
      error("文件已存在");
      return;
    }
    if ("png" !== lowcaseName) {
      return
    }
    execFile(
      pngquant,
      [
        "--strip",
        "--skip-if-larger",
        "--quality=60",
        "-o",
        compressionPath,
        filePath,
      ],
      (err) => {
        const { code } = err || {}
        if (code == 15) {
          error(chalk.red("文件已存在"));
          return;
        }
        if (code == 98) {
          setTimeout(() => {
            fs.rename(filePath, originalPath, err => { // 源文件会剪切至 out/original 目录
              if (err) {
                error(err)
                return
              }
              const source = tinify.fromFile(originalPath); // 对文件进行压缩
              source.toFile(compressionPath);
            })
          }, 0);
          return;
        }
        if (!err) {
          console.log("已处理", filePath)
        //   fs.unlink(filePath, err => {
        //     err && error(err)
        //   })
        }
        err && error(err);
      }
    );
  }
});
