# zashboard

RealSeek fork: adds EasyTier device information, with vertical cards on mobile so all fields can be read without horizontal scrolling. See [EasyTier setup](./docs/easytier.md).

Every push to `main` builds all seven font variants, updates the [Latest build release](https://github.com/RealSeek/zashboard/releases/tag/latest), and publishes built files to the `gh-pages` branches. No personal access token is required.

For mihomo, use this fork's download URL so dashboard updates keep the EasyTier changes:

```yaml
external-ui: ui
external-ui-url: https://github.com/RealSeek/zashboard/releases/download/latest/dist.zip
```

For system fonts only, use `dist-no-fonts.zip` instead. A branch ZIP is also available at `https://github.com/RealSeek/zashboard/archive/refs/heads/gh-pages.zip`. Raw GitHub URLs serve individual files; use the ZIP download URL for `external-ui-url`.

<p align="center">
  <img src="./readme/pc.png" height="300">
  <img src="./readme/mobile.png" height="300">
</p>

## **Requirement**

Browser support

- Chrome 111 (released March 2023)
- Firefox 128 (released July 2024)
- Safari 16.4 (released March 2023)
- Not supported on iOS 16.4 jailbroken version.

## **Online**

The following online site hosts the upstream version; use your mihomo controller's `/ui/` to access this fork:

- [Online zashboard](http://board.zash.run.place)

## **Download**

You can download the zashboard files here:

> [!WARNING]
> Support for sing-box has been removed. [Learn more about this
> decision](./docs/sing-box-deprecation.md).

release:

- [dist.zip](https://github.com/RealSeek/zashboard/releases/download/latest/dist.zip) – Includes better font-loading experience.
- [dist-no-fonts.zip](https://github.com/RealSeek/zashboard/releases/download/latest/dist-no-fonts.zip) – No fonts included, uses system fonts only.
- [dist-cdn-fonts.zip](https://github.com/RealSeek/zashboard/releases/download/latest/dist-cdn-fonts.zip) – Fonts loaded from unpkg.com, If you have trouble connecting to unpkg.com, **you may experience slow page loading**.
- [dist-firasans-only.zip](https://github.com/RealSeek/zashboard/releases/download/latest/dist-firasans-only.zip) – Only with FiraSans Font
- [dist-misans-only.zip](https://github.com/RealSeek/zashboard/releases/download/latest/dist-misans-only.zip) – Only with MiSans Font
- [dist-pingfang-only.zip](https://github.com/RealSeek/zashboard/releases/download/latest/dist-pingfang-only.zip) – Only with PingFang Font
- [dist-sarasa-only.zip](https://github.com/RealSeek/zashboard/releases/download/latest/dist-sarasa-only.zip) – Only with Sarasa Font

dev:

- [gh-pages.zip](https://github.com/RealSeek/zashboard/archive/refs/heads/gh-pages.zip)
- [gh-pages-no-fonts.zip](https://github.com/RealSeek/zashboard/archive/refs/heads/gh-pages-no-fonts.zip)
- [gh-pages-cdn-fonts.zip](https://github.com/RealSeek/zashboard/archive/refs/heads/gh-pages-cdn-fonts.zip)
- [gh-pages-firasans-only.zip](https://github.com/RealSeek/zashboard/archive/refs/heads/gh-pages-firasans-only.zip)
- [gh-pages-misans-only.zip](https://github.com/RealSeek/zashboard/archive/refs/heads/gh-pages-misans-only.zip)
- [gh-pages-pingfang-only.zip](https://github.com/RealSeek/zashboard/archive/refs/heads/gh-pages-pingfang-only.zip)
- [gh-pages-sarasa-only.zip](https://github.com/RealSeek/zashboard/archive/refs/heads/gh-pages-sarasa-only.zip)

## **Docker Setup**

To run the upstream zashboard via Docker, use the following command (this image does not include the fork's EasyTier changes):

```
docker run -d -p 80:80 ghcr.io/zephyruso/zashboard:latest
```

## Tips

1. The connection table can be dragged with the left mouse button, and right-clicking can copy cell content.
2. Right-clicking on a node / node group card will perform a speedtest for the node / node group.
3. The proxy group sorting is based on the node order in the GLOBAL group, which follows the configuration file order. If you need custom ordering, you can specify the order by overriding the GLOBAL group.
4. The dashboard supports PWA (Progressive Web App), which can provide a native app-like experience on mobile devices through "Add to Home Screen".
5. The dashboard's upgrade button and auto-upgrade functionality require proper configuration of the core's UI download path ([mihomo](https://wiki.metacubex.one/config/general/#_9)), otherwise clicking update may result in updating to the core's default panel.

## 提示

1. 连接表格可被鼠标左键拖动，右键可复制单元格内容。
2. 右键点击节点/节点组卡片可对节点/节点组进行测速。
3. 面板的节点组排序是根据GLOBAL组中的节点顺序排序的，即按配置文件的顺序，如果你需要自定义顺序，可通过覆盖GLOBAL组指定顺序
4. 面板支持PWA（Progressive Web App），可以在移动设备上通过"添加到主屏幕"获得类原生app的体验
5. 面板的更新按钮和自动更新功能需要正确的配置核心的ui下载路径 ([mihomo](https://wiki.metacubex.one/config/general/#_9)), 否则可能会在点击更新后更新为核心默认面板

## URL params format

#### basic example

http://host:port/#/setup?hostname=ipordomain&port=9090&secret=123456

1. **`protocol`**
   - Determines the protocol, `http` or `https`.
   - Default: current page protocol
   - The legacy `http` / `https` flag params (e.g. `?http=1`) are still supported for backward compatibility, but `protocol` takes precedence when both are present.

2. **`hostname`**
   - The Clash API's IP or domain.

3. **`port`**
   - The Clash API port.

4. **`secondaryPath`**
   - Optional path appended to the base URL.
   - Default: An empty string.

5. **`secret`**
   - Password for authentication.

6. **`disableUpgradeCore`**
   - Set '1' to hide upgrade core button

7. **`disableTunMode`**
   - Set '1' to hide tun switch

### I code just for fun, not for money. If you really want to donate, please consider donating to [UNICEF](https://www.unicef.org/) to help hungry children.
