const fs = require('fs')
const path = require('path')
const tinify = require('tinify')
const chokidar = require('chokidar')

const getFileName = require('./tool') // 输出对应的文件路径

// 配置信息
const config = require('./config')
tinify.key = config.key

chokidar.watch('./img').on('add', async (file) => {
  const extName = (path.extname(file) || '').replace(/\./g, '')
  const lowcaseName = String.prototype.toLowerCase.call(extName)
  if (config.pictureType.includes(lowcaseName)) {
    const filePath = path.join(__dirname, file)
    const [originalPath, compressionPath] = await getFileName(filePath)
    const source = tinify.fromFile(filePath)
    source.toFile(compressionPath)
    fs.renameSync(filePath, originalPath)
  }
})