const fs = require('fs')
const path = require('path')
const tinify = require('tinify')
const chokidar = require('chokidar')

const { getFileName, initDir } = require('./tool') // 输出对应的文件路径

// 配置信息
const config = require('./config')
tinify.key = config.key

initDir() // 初始化图片文件夹

chokidar.watch('./img').on('add', async (file) => {
  const extName = (path.extname(file) || '').replace(/\./g, '')
  const lowcaseName = String.prototype.toLowerCase.call(extName)
  if (config.pictureType.includes(lowcaseName)) { // 仅处理图片后缀名的文件
    const filePath = path.join(__dirname, file)
    const [originalPath, compressionPath] = await getFileName(filePath) // 文件名添加内容哈希
    fs.renameSync(filePath, originalPath) // 源文件会剪切至 out/original 目录
    const source = tinify.fromFile(originalPath) // 对文件进行压缩
    source.toFile(compressionPath)
  }
})