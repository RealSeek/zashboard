# EasyTier 设备信息

zashboard 的概览页会自动显示已配置的 EasyTier 代理及其设备，包含设备名、P2P 直连 / 转发、本机标记、虚拟 IPv4、UDP / TCP NAT 类型和公网 IP。每 5 秒刷新一次，也可手动刷新。转发设备显示下一跳名称；移动端按设备纵向展示信息卡，无需横向滚动，桌面端使用表格。

设备来自 mihomo 内嵌的 EasyTier 实例，无需额外运行 easytier-cli。NAT 显示「未知」表示 EasyTier 尚未提供检测结果。连接方式按当前选中的路由判断，支持 `latency-first`。

## 使用本地构建

需要同时使用修改后的 mihomo 与 zashboard。已生成：

- `E:\Code\Tools\mihomo\mihomo-easytier-dashboard.exe`
- `E:\Code\Tools\zashboard\dist`

在 mihomo 的配置中将静态界面目录设置为：

```yaml
external-ui: E:/Code/Tools/zashboard/dist
```

使用新内核启动现有配置，然后打开控制器地址的 `/ui/`，进入「概览」。在「概览卡片设置」里可控制 EasyTier 卡片是否显示。没有 EasyTier 代理时卡片自动隐藏。

## 控制器接口

- `GET /easytier/{name}`

路径参数需要 URL 编码；鉴权复用控制器的 Bearer token。mihomo 返回节点、连接和路由状态，zashboard 将其转换为 `state` 和 `nodes`。设备字段：`peerId`、`hostname`、`ipv4`、`connection`、`nextHopPeerId`、`udpNat`、`tcpNat`、`publicIPs`。`connection` 为 `local`、`p2p`、`relay` 或 `disconnected`。

## 核心验证

```powershell
# mihomo 项目
go test ./component/easytier ./hub/route -run 'TestDevicesSelectedRouteAndNAT|TestEasyTierControllerLiveTopology' -count=1
go build -o mihomo-easytier-dashboard.exe .

# zashboard 项目
corepack pnpm type-check
corepack pnpm build
$env:CHROME_BIN = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
node test/verify-easytier.mjs
```

后端测试启动本地三节点网络验证直连与转发，另验证 NAT 和延迟优先路由。浏览器测试验证中文字段、自动刷新和移动端布局。
