const crypto = require('crypto');
const fs = require('fs');
const path = require('path')
const config = require('./config')
const srcPath = path.resolve(config.entry)
const outOriginalPath = path.join(__dirname, config.output, 'original')
const outCompressionPath = path.join(__dirname, config.output, 'compression')

/**
 * 读取文件生成内容哈希名称
 * @param {*} filePath 文件全路径
 */
function createFileHash(filePath) {
  //从文件创建一个可读流
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath);
    const fsHash = crypto.createHash('md5');

    stream.on('data', function (d) {
      fsHash.update(d);
    });

    stream.on('end', function () {
      const md5 = fsHash.digest('hex');
      resolve(String.prototype.slice.call(md5, 0, 8));
    });
  })
}
/**
 * 生成文件目标文件夹路径
 * @param {*} file 文件全路径
 */
function getDestDirName(file) {
  // 获取源文件路径，转换为out路径下的哈希名称
  const dirName = path.dirname(file)
  return [dirName.replace(srcPath, outOriginalPath), dirName.replace(srcPath, outCompressionPath)]
}
/**
 * 根据文件全路径，生成对应的哈希文件基本名称
 * @param {*} filePath 文件全路径
 */
async function getHashBaseFileName(filePath) {
  const fileHash = await createFileHash(filePath)
  const baseFileName = path.basename(filePath)
  const extFileName = path.extname(filePath)
  const reg = new RegExp(extFileName)
  return baseFileName.replace(reg, `_${fileHash}${extFileName}`)
}
/**
 * 根据文件全路径，生成目标文件路径下的哈希文件名称
 * @param {*} filePath 文件全路径
 */
async function getFileName(filePath) {
  const [originalPath, compressionPath] = getDestDirName(filePath)
  const hashBaseName = await getHashBaseFileName(filePath)
  return [path.join(originalPath, hashBaseName), path.join(compressionPath, hashBaseName)]
}
/**
 * 初始化文件目录
 */
function initDir() {
  [srcPath, outOriginalPath, outCompressionPath].forEach(dirPath => {
    initRecyleDir(dirPath)
  })
}
/**
 * 递归创建对应的文件夹路径
 * @param {*} dirPath 文件夹路径
 */
function initRecyleDir(dirPath) {
  const parentPath = path.dirname(dirPath)
  if (!fs.existsSync(parentPath)) {
    initRecyleDir(parentPath)
  }
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath)
  }
}

module.exports = {
  getFileName,
  initDir,
}