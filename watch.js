const fs = require('fs')
const path = require('path')
const tinify = require('tinify')
const chokidar = require('chokidar')

const { getFileName, initDir } = require('./tool') // 输出对应的文件路径

// 配置信息
const config = require('./config')
tinify.key = config.key

initDir()

chokidar.watch('./img').on('add', async (file) => {
  const extName = (path.extname(file) || '').replace(/\./g, '')
  const lowcaseName = String.prototype.toLowerCase.call(extName)
  if (config.pictureType.includes(lowcaseName)) {
    const filePath = path.join(__dirname, file)
    const [originalPath, compressionPath] = await getFileName(filePath)
    fs.renameSync(filePath, originalPath)
    const source = tinify.fromFile(originalPath)
    source.toFile(compressionPath)
  }
})
