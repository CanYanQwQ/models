# 模型广场 · 独立页面

Sub2API 站的模型价目表。**价格全部硬编码在 `src/data/catalog.ts`**，不请求任何接口。

![浅色主题](docs/light-top.png)

| 深色主题 | 移动端 |
| --- | --- |
| ![深色主题](docs/dark-top.png) | ![移动端](docs/mobile.png) |

## 为什么硬编码

官方 `/model-plaza` 只有一个开关 `model_plaza_enabled`：关掉它就同时关掉入口和接口
（`backend/internal/handler/model_plaza_handler.go` 里 `!rt.Enabled` 直接 404），
而匿名可用的公开接口只有 `GET /api/v1/settings/public`，里面不含分组与价格。
所以想换掉广场的外观，数据只能写死；代价是**改价要改文件、重新部署**。

计价公式照抄 0.2.17 前端（`PlazaModelPricingTable.vue`）：
实付价 = 渠道单价 × 分组倍率，token 类再乘 1e6 换算成「每百万 tokens」；
官方价不乘倍率，所以这个页面只显示实付价，不并列官方价。

## 版式

一页连续的价格清单，不分页、不加卡片、不做筛选。分组是唯一的层级：每个分组一条
`border-t` 发丝线 + 组名 + 说明 + 右侧模型数与倍率徽章，组内每个模型一个横区块。

每个模型区块三行：模型名（展示名 + mono slug）→ 一行说明 → 价格。价格固定三列
（输入 / 输出 / 缓存读，生图是三个档位），数字用等宽字体，分档模型在数字下面多一行
`>272K $1.70`。三列总宽限制在 832px 内，数字才聚得起来——铺满整个容器会让每列之间
空出 300px 以上，读不成一行。

中文段落用了 `break-keep`：默认的中文断行会把「每百万」拆成「每百 / 万」两行。

分组的尾部（含生图、免费分组与页脚口径说明）：

![下半页](docs/light-bottom.png)

## 改价

只改 `src/data/catalog.ts` 里的 `GROUPS`。每个模型的价格填**渠道单价**（美元 / token，
如 `5e-6`），不要填乘过倍率的结果——渲染时统一乘 `rateMultiplier`。
生图模型填 `perImage`（每张的渠道单价），倍率同样由分组带。

`rateVerified` 是「这个分组的标价是否等于官方价」的人工结论，只有为 `true` 时页面才
显示倍率徽章（此时标价 × 倍率就是实付价，倍率有解释力）。若某分组的标价本身就偏离
官方价，倍率乘出来会误导，就置 `false`，页面只列实付价。

`label` 是给人看的名字（`GPT-5.6`），`name` 是要粘进代码的 slug（`gpt-5.6`），
`note` 是那句中文说明。新增分组时若模型分档，`tiers` 按顺序给两档，`label` 写
`≤272K` / `>272K`。

## 部署到 Vercel

同一个仓库可以开第二个 Vercel 项目，Root Directory 指向 `plaza/`：

| 项 | 值 |
| --- | --- |
| Framework Preset | Vite |
| Root Directory | `plaza` |
| Build Command | `npm run build`（即 `tsc --noEmit && vite build`） |
| Output Directory | `dist` |
| Install Command | `npm ci`（`package-lock.json` 已在仓库里） |

构建产物是纯静态文件，无需任何环境变量。

## 接进 Sub2API

后台「系统设置 → 自定义菜单」新增一项，URL 填这个页面部署后的地址。点开时
`CustomPageView.vue` 会用 iframe 加载它，并自动带上 `theme` / `lang` 等参数。

页面里所有跳回主站的链接都是 `target="_top"`，会跳出 iframe 整页跳转；主站地址从
`document.referrer` 的 origin 推导（iframe 由主站同源页面发起，所以能拿到），
推导失败时回退到 `src/lib/site.ts` 里的常量。

主题优先级：`?theme=` → `localStorage['sub2api-plaza:theme']` → `prefers-color-scheme`，
在 `index.html` 的首屏内联脚本里就定下来，不会闪。

## 字体

- 拉丁与数字：`@fontsource-variable/space-grotesk`、`@fontsource-variable/jetbrains-mono`，
  随构建打包，不依赖任何 CDN。
- 中文：Noto Sans SC 子集，两个字重各一个文件——`public/fonts/noto-sans-sc-plaza-400.woff2`
  （22.7 kB，正文）与 `-600.woff2`（22.9 kB，标题）。只保留页面实际用到的 159 个字。
  许可证见 `public/fonts/OFL.txt`（SIL OFL 1.1）。

两个 `@font-face` 声明同一个 family、不同 `font-weight`，`unicode-range` 限制在 CJK 区段，
拉丁字符仍然走 Space Grotesk。只声明一个 600 会让所有中文正文都渲染成半粗，和西文 400
正文对不齐。

改完中文文案后要重跑子集，否则新字会掉回系统字体：

```bash
pip install fonttools brotli
npm run fonts            # 读 src/ 与 index.html，重写 public/fonts/*.woff2
```

## 设计约束

纸 + 墨 + 单一 teal 强调色；分隔只用发丝线，**全站零渐变、零阴影、零 emoji**；
图标一律来自 `lucide-react`，示意图形用手写内联 SVG。深色主题只换令牌，不换版式。
