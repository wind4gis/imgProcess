# 背景
在编写静态页面时，UI会提供对应的静态图片，可以直接下载至本地再手动提交至CDN，但是缺乏一个自动化机制可以帮助开发者给文件名称添加上内容哈希进行版本管理以及自动压缩图片。通过该工具，可以让开发者摆脱手动操作的过程，将对应的图片文件放在img文件夹下，就会自动执行操作，减轻冗余重复的手动操作

# 运行机制
项目执行之后会监听img文件夹的添加文件事件，如果你在该文件夹里添加了图片，会自动生成对应的内容哈希名称并进行文件压缩。压缩后的文件会放在 `out/compression`文件夹下，原图放在 `out/original`文件夹下

# 运行需知
项目采用的是tinypng的api进行图片自动压缩，由于免费版api每个月是有对应的压缩次数，所以需要手动登陆[tinypng网站申请API Key](https://tinypng.com/developers)，将config.js的key值修改为申请后的key值

# 初始化
执行`yarn`或者`npm i`进行初始化

# 手动运行
执行`nodemon index.js`命令手动运行


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
执行`pm2-service-install`，提示`Perform environment setup ?`，选`n`，后台会自动安装PM2服务并启动，服务名称为PM2。安装成功后会提示`PM2 service installed and started`

如果选择n之后程序卡住没有提示安装成功，需要执行上一步操作`手动更新pm2-windows-service`

## 运行程序
1. 执行`pm2 start index.js`，通过pm2启动脚本

2. 执行`pm2 save`，配置开机自启动
