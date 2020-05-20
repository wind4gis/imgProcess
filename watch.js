const fs = require("fs");
const path = require("path");
const tinify = require("tinify");
const chokidar = require("chokidar");
const util = require("util");
const execFile = require("child_process").execFile;
// const execFile = util.promisify(require("child_process").execFile);
const optipng = require("optipng-bin");
const pngquant = require("pngquant-bin");
const jpegtran = require("jpegtran-bin");
const chalk = require("chalk");
const { getFileName, initDir } = require("./tool"); // 输出对应的文件路径
const glob = require("glob");
const { AsyncParallelBailHook, AsyncParallelHook, AsyncSeriesBailHook } = require("tapable");
const PngQuant = require("pngquant");
// 配置信息
const config = require("./config");
tinify.key = config.key;

initDir(); // 初始化图片文件夹

const error = (txt) => console.error(chalk.red(txt));
const info = (txt) => console.log(chalk.green(txt));

const process = new AsyncParallelHook(["imgInfo"]);
const pngProcess = new AsyncSeriesBailHook(["pngImgInfo"]);

pngProcess.tapAsync("pngquant", ({ originalPath, compressionPath, filePath, lowcaseExt }) => {
  console.log(lowcaseExt, 1);
  const nname = path.basename(filePath);
  console.log(nname);
  if (lowcaseExt === "png") {
    console.log("执行逻辑", `当前执行源文件为${filePath}`);
    const writeStream = fs.createWriteStream(compressionPath);
    fs.createReadStream(filePath)
      .pipe(new PngQuant(["--strip", "--skip-if-larger", "--quality", "60-80", filePath]))
      .pipe(writeStream);
    // setTimeout(() => {
    //   execFile(pngquant, ["--strip", "--skip-if-larger", "--quality", "60-80", "-o", `d:/out/${nname}`, filePath], (err) => {
    //     const { code } = err || {};
    //     if (code == 15) {
    //       error("文件已存在");
    //       err && error(err);
    //       return;
    //     }
    //     if (code == 98) {
    //       setTimeout(() => {
    //         fs.rename(filePath, originalPath, (err) => {
    //           // 源文件会剪切至 out/original 目录
    //           if (err) {
    //             error(err);
    //             return;
    //           }
    //           const source = tinify.fromFile(originalPath); // 对文件进行压缩
    //           source.toFile(compressionPath);
    //         });
    //       }, 0);
    //       return;
    //     }
    //     if (!err) {
    //       // fs.unlink(filePath, (err) => {
    //       //   err && error(err);
    //       // });
    //     }
    //     err && error(err);
    //   });
    // }, 0);
    // try {
    //   await console.log(originalPath, "ppp");

    //   return { originalPath, compressionPath, filePath };
    // } catch (errorInfo) {
    //   const { stdout, stderr } = errorInfo;
    //   const { code } = stderr;
    //   if (code !== 98) {
    //     error("err", errorInfo, stderr, stdout, code);
    //     error(code === 15 ? "文件已存在" : stderr);
    //     return stdout;
    //   }
    //   error(stderr);
    // }
  }

  // fsPromises
  //   .unlink(filePath)
  //   .then(() => {
  //     info(`文件已经压缩完毕，对应路径为${compressionPath}`);
  //     return resolve(compressionPath);
  //   })
  //   .catch((err) => {
  //     err && error(err);
  //   });
});

// pngProcess.tapAsync("optiPng", ({ originalPath, compressionPath, filePath, lowcaseExt }) => {
//   console.log(lowcaseExt, 2);
//   return new Promise(async (resolve, reject) => {
//     if (lowcaseExt === "png") {
//       try {
//         await execFile(optipng, ["-out", compressionPath, filePath]);
//         return { originalPath, compressionPath, filePath };
//       } catch ({ stdout, stderr }) {
//         error(stderr);
//         return stdout;
//       }
//     }
//   });
// });

process.tapAsync("png", (...props) => {
  return pngProcess.callAsync(...props, (res) => console.log(res));
});

// process.tapPromise("jpg", ({ originalPath, compressionPath, filePath, lowcaseExt }) => {
//   console.log(lowcaseExt, 2);
//   return new Promise((resolve, reject) => {
//     if (!["jpg", "jpeg"].includes(lowcaseExt)) {
//       console.log(lowcaseExt, 45);
//       return;
//     }
//     execFile(jpegtran, ["-copy", "none", "-optimize", "-progressive", "-outfile", compressionPath, filePath]).then(
//       () => {
//         fsPromises
//           .unlink(filePath)
//           .then(() => {
//             info(`文件已经压缩完毕，对应路径为${compressionPath}`);
//             resolve(compressionPath);
//           })
//           .catch((err) => {
//             err && error(err);
//           });
//       },
//       (err) => {
//         error(err);
//       }
//     );
//   });
// });

chokidar.watch("./img").on("add", async (file) => {
  const extName = (path.extname(file) || "").replace(/\./g, "");
  const lowcaseExt = String.prototype.toLowerCase.call(extName);
  // 仅处理图片后缀名的文件
  const filePath = path.join(__dirname, file);
  const [originalPath, compressionPath] = await getFileName(filePath); // 文件名添加内容哈希
  if (fs.existsSync(compressionPath)) {
    error("文件已存在");
    return;
  }
  if (["png", "jpeg", "jpg"].includes(lowcaseExt)) {
    process.callAsync({ originalPath, compressionPath, filePath, lowcaseExt });
  }
});
