# 运行机制
项目执行之后会监听img文件夹的添加文件事件，如果你在该文件夹里添加了图片，会自动生成对应的内容哈希名称并进行文件压缩。压缩后的文件会放在 `out/compression`文件夹下，原图放在 `out/original`文件夹下。

# 运行需知
项目采用的是tinypng的api进行图片自动压缩，由于免费版api每个月是有对应的压缩次数，所以需要手动登陆[tinypng网站申请API Key](https://tinypng.com/developers)，将config.js的key值修改为申请后的key值

# 手动运行
执行`nodemon watch.js`命令手动运行


# 配置开机自启动

## 安装pm2
npm i pm2 -g

## windwos用户需要额外配置
npm i pm2-windows-service -g

### 添加.pm2的系统环境变量
PM2_HOME=C:\Users\.pm2(路径默认在当前用户下的.pm2文件夹)

### 手动更新pm2-windows-service
1. npm install npm-check-updates -g

2. 执行`cd C:\Users\[实际用户名]\AppData\Roaming\npm\node_modules\pm2-windows-service`，找到pm2-windows-service的安装路径，如果是nvm的话应该是对应`cd C:\Users\[实际用户名]\AppData\Roaming\nvm\[当前使用node版本]\node_modules\pm2-windows-service`

3. 执行`ncu inquirer -u`

4. 执行`npm install`

### 以管理员权限打开新的命令行窗口,执行以下命令来安装服务
pm2-service-install

## 运行程序
pm2 start watch.js
pm2 save