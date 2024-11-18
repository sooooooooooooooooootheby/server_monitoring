## server_monitoring

这是一个服务器性能监测工具, 使用 node.js 编写, 配合 pm2 使用, 通过 socket 和客户端建立实时连接, 定时发送服务器性能数据.

这是后端工具, 所以你需要将它部署在你的服务器上, 并且给你的 pm2 安装 pm2-logrotate 插件.

```bash
pm2 install pm2-logrotate
```

## 运行

```bash
git clone https://github.com/sooooooooooooooooootheby/server_monitoring.git

cd server_monitoring

pnpm i

node ./src/main.js
```

通过ip+端口即可访问, 默认端口是4567.

## 修改默认配置

如果你需要修改端口号和每次查询间隔时间直接修改 `./src/main.js` 文件中的 `port` 和 `timeout`即可.
