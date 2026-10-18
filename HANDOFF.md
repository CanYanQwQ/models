# 交接文档 · 模型价格页

给下一个接手的人（或 AI）看的。看完这份就不用再翻聊天记录。

最后更新：2026-10-18。项目状态：**已完成并上线，可交付**。

---

## 1. 这是什么

一个纯静态的模型价目表页面，替代 Sub2API 自带的 `/model-plaza`，展示「本站实际卖多少钱」。

- 线上地址：部署在 Vercel，具体域名由使用者配置（本文档不写死）
- 代码仓库：<https://github.com/CanYanQwQ/models>
- 本地目录：`E:\nas目录\项目\模型价格`（就是这个仓库的克隆，`git status` 干净）
- 技术栈：React 19 + TypeScript + Vite 8 + Tailwind CSS v4，无后端、无环境变量
- 数据：**全部硬编码在 `src/data/catalog.ts`**，运行时不请求任何接口

### 一句话说明「为什么」要另做一个

Sub2API 0.2.17 的模型广场只有一个开关 `model_plaza_enabled`，关掉它同时关掉入口和接口
（`backend/internal/handler/model_plaza_handler.go` 里 `!rt.Enabled` 直接返回 404），
而匿名可用的公开接口只有 `GET /api/v1/settings/public`，里面不含分组和价格。
所以想换广场的外观，数据只能写死。**代价：改价要改文件、重新部署。**

---

## 2. 三十秒上手

```bash
npm ci
npm run dev       # http://127.0.0.1:5173
npm run build     # tsc --noEmit && vite build
npm run preview   # 预览构建产物，127.0.0.1:4190
npm run fonts     # 改过中文文案后重跑（见第 7 节）
```

只有改价、改文案、改设计三种活。前两种不需要理解代码结构，见第 4、5 节。

---

## 3. 文件地图

```
├─ index.html              首屏前内联脚本定主题（避免闪白），preload 中文字体
├─ vite.config.ts          base '/'，react + tailwind 插件
├─ tsconfig.json           strict + noUncheckedIndexedAccess + verbatimModuleSyntax
├─ src/
│  ├─ main.tsx             挂载，引入两个 fontsource 字体包
│  ├─ App.tsx              唯一的状态持有者：FilterState
│  ├─ index.css            设计令牌（@theme inline）+ 两个 @font-face
│  ├─ data/catalog.ts      ★ 全部数据：分组、模型、价格、倍率、手写文案
│  ├─ lib/
│  │  ├─ pricing.ts        计价与格式化：金额、每百万、每张、价格区间
│  │  ├─ filters.ts        分面筛选 + 排序 + 可见分组
│  │  ├─ chip.ts           chip 的类名（激活/闲置/禁用三态）
│  │  ├─ site.ts           从 document.referrer 推导主站 origin
│  │  └─ theme.ts          light/dark 切换，写 localStorage
│  └─ components/
│     ├─ TopBar.tsx        标记 + 标题 + 主题开关 + 返回站点
│     ├─ Hero.tsx          h1 + 两行说明
│     ├─ FilterBar.tsx     四行分面（平台/分组/倍率/模型名）
│     ├─ ListToolbar.tsx   「共 N 个模型」+ 排序开关
│     ├─ GroupSection.tsx  分组头（吸顶）+ 3 列卡片网格
│     ├─ ModelCard.tsx     单个模型一张卡：名字/slug/说明/三带价格
│     ├─ Footer.tsx        计价口径说明 + 更新日期 + 返回站点
│     └─ Mark.tsx          20×20 内联 SVG 标记
├─ scripts/subset-font.py  ★ 中文字体子集流水线
├─ public/fonts/           noto-sans-sc-plaza-{400,600}.woff2 + OFL.txt
└─ docs/*.png              README 用的四张截图
```

`src/data/catalog.ts` 是唯一的数据源，`src/lib/pricing.ts` 是唯一的计价逻辑。
改价格只动前者，别在两处各算一次。

---

## 4. 数据从哪来、怎么更新

### 来源

`GET https://ai.zhouwanx.top/api/v1/model-plaza`（匿名可读，前提是后台开着模型广场）。
最后一次抓取：**2026-10-18**，共 4 个分组 13 个模型：

| 分组 id | 名称 | kind | 倍率 | 倍率可信 | 模型 |
| --- | --- | --- | --- | --- | --- |
| 16 | ChatGPT-ProMax【满血】 | chat | 0.17 | 是 | gpt-5.6, gpt-5.6-sol, gpt-6-astra, gpt-6-sol, gpt-6.1-sol |
| 12 | GPT生图 | image | 1 | 是 | gpt-image-2 |
| 6 | 国产模型 | chat | 1 | 否 | deepseek-v4-pro, deepseek-v4.1-flash, glm-5.3, glm-5.3-flash |
| 11 | 免费分组 | free | 1 | 否 | deepseek-v4-pro, deepseek-v4.1-flash, glm-5.3-flash（价格全 0） |

### 接口里哪些字段进了页面

- `groups[].name` / `description` → 组名与说明
- `groups[].rate_multiplier` → `rateMultiplier`
- `groups[].platform` → `platform`（本实例四组全是 `openai`，这是**协议族**不是厂商）
- `models[].name` → `name`（slug，原样保留）
- `models[].pricing.intervals[]` → `tiers[]`，其中 `input_price` / `output_price` /
  `cache_read_price` 是 per-token 美元价，`per_request_price` 是每张价，
  `tier_label` 是档位名（`≤272K` / `>272K` / `1K` / `2K` / `4K`）
- `models[].long_context_basis` → 组 16 是 `whole_request`：超 272K 后**整单**按高价档

**没进页面的**：`official_pricing`（官方参考价）。使用者明确要求只显示售卖价，
不并列官方价——官方价只用来判断倍率可不可信（见下）。

### 改价流程

1. 重新抓一次接口，看哪些模型变了
2. 改 `src/data/catalog.ts` 里对应模型的 `tiers`（填**渠道单价**，如 `5e-6`，不要填乘过倍率的结果）
3. 改 `UPDATED_AT`（页脚会显示）
4. 如果出现新汉字 → `npm run fonts`
5. `npm run build` → 提交 → 推送（Vercel 自动重建）

### 新增分组/模型

- 新分组：`kind` 选 `chat` / `image` / `free`，决定价格区怎么排
- 新模型：`label` 是给人看的名字（`GPT-5.6`），`name` 是要粘进代码的 slug（`gpt-5.6`），
  `note` 是一句中文说明（**必须写短**，只讲组内相对位置，别复述组规则）
- 分档模型 `tiers` 给两档，`label` 写 `≤272K` / `>272K`
- 新平台：在 `src/components/FilterBar.tsx` 的 `PLATFORM_LABELS` 里加映射
- 之后一定重跑 `npm run fonts`

---

## 5. 计价口径（最容易出错的地方）

照抄 Sub2API 0.2.17 的 `frontend/src/components/modelPlaza/PlazaModelPricingTable.vue:424`：

```
售卖价 = 渠道单价 × 生效倍率(rate_multiplier)
```

- token 类再乘 1e6，显示成「每百万 tokens」
- 生图类不乘 1e6，显示「每张」
- **官方价不乘倍率**，本页不显示官方价
- 官方还有个 `user_rate_multiplier`（用户专属倍率）优先于组倍率；本页是匿名视图，
  只用组倍率

### 倍率什么时候显示

`rateVerified` 是**人工结论**，不是接口字段：只有该分组「渠道单价 == 官方价」时才为 `true`。
此时标价 × 倍率就是实付价，倍率有解释力，才在组头显示「官方价 ×0.17」徽章。
标价本身已经偏离官方价时（乘出来会误导），置 `false`，页面只列实付价、不提倍率。

当前判定：

- 组 16：五个模型的 `pricing` 与 `official_pricing` 完全一致 → `true`，显示 ×0.17
- 组 6：`deepseek-v4-pro` 是官方价的 1.667 倍、`v4.1-flash` 0.667 倍、`glm-5.3-flash` 0.2 倍
  → `false`，不显示
- 组 11、12：`false` / `true`（组 12 的官方价没有 `per_request`，不可比对，但倍率是 1，
  显示与否无差别；代码里置 `true`）

### 分档为什么单独一行

组 16 是 `whole_request` 计费：超过 272K 后整单按高价档。所以页面把首档当主数字、
`>272K` 档放在卡片底部一条带发丝线的子行，档位标记只印一次。**不要**把两档塞进同一列——
那会把该列的标签顶下去，三列标签就错位了，一行卡片的横向扫描就断了。

### 免费分组为什么是三个 `$0`

保留「输入/输出/缓存读」三列，只把数字换成 `$0`（青色 `text-accent-ink`）。
用一个宽格写「免费」会破坏与其他组的行节奏。

---

## 6. 设计系统

### 定位

**报价单 / 制图版**：纸 + 墨 + 单一 teal 强调色。零渐变、零阴影、零玻璃拟态、零 emoji。
分隔只用 1px 发丝线。图标一律 `lucide-react`，示意图形用手写内联 SVG。
模型用直角发丝线卡片承载——卡片是同一张纸上的另一张纸（`bg-sheet` 压在 `bg-paper` 上），
不是浮起来的应用面板：没有圆角、没有阴影、没有半透明填充。

### 令牌（`src/index.css`，浅色 / 深色）

| 令牌 | light | dark |
| --- | --- | --- |
| `--c-paper` | `#f4f5f2` | `#080d0c` |
| `--c-sheet` | `#fdfdfb` | `#0d1413` |
| `--c-soft` | `#eef0ec` | `#111917` |
| `--c-ink` | `#0c1413` | `#e9efec` |
| `--c-ink-2` | `#46534f` | `#a7b4b0` |
| `--c-ink-3` | `#5d6b68` | `#7b8a87` |
| `--c-rule` | `#d7dcd7` | `#26312f` |
| `--c-rule-strong` | `#bcc4be` | `#384744` |
| `--c-accent` | `#0a7a6e` | `#2ec2b0` |
| `--c-accent-ink` | `#075c54` | `#6ce0d1` |
| `--c-accent-wash` | `#e3f0ec` | `#0c2a27` |

`--c-ink-3` 浅色是从 `#6c7976` 调深来的：原值对 paper 只有 4.14、对 sheet 4.45，不达 4.5。
现值 `#5d6b68` 为 5.09 / 5.47（paper / sheet）。

### 字体

- 拉丁与数字：Space Grotesk Variable（标题/正文）、JetBrains Mono Variable（数字/slug）
- 中文：Noto Sans SC 子集，两个字重各一个文件
  - `-400.woff2` 25.6 kB 正文、`-600.woff2` 26.0 kB 标题
  - 只含页面实际用到的汉字（185 个），用 `unicode-range` 限在 CJK 区段
- **必须两个字重**：只声明 600 会让所有中文正文比旁边的西文 400 更粗

### 版式四条硬规则

1. **数字比模型名大**（18px vs 15px）：一页十几个模型，读者是来比价的
2. **卡内三列共用一个 grid**：数字、标签、分档三行落在同一套列上，数字永远在自己标签的正上方
3. **价格沉底**（`mt-auto`）：同一行卡片的数字共用一条基线、分档线落在同一高度，一排卡片读起来是一张横格表
4. **单位跟着标签走**（`输入 / 1M`，不是 `$0.85 / 1M`）：336px 卡片每列只有 93px，数字后面挂单位会溢出；挪走之后数字行是纯数字，跨卡片对齐

### 卡片

一张卡 = 一张纸：`bg-sheet` + 1px `border-rule`，直角、无阴影、无渐变，hover 只把描边提到
`border-rule-strong`。卡与卡 `gap-x-6 gap-y-5`。**每组各自一个网格**，所以模型数不是 3 的倍数时
末行右侧留空位（13 个模型共 5 个空位）；让卡片跨组流动能填满，但会把两个分组排进一行，
组头那个「×0.17」徽章就说不清覆盖哪几张卡了。

实测卡片尺寸：1440 → 336px、1024 → 304px、640 → 276px、390 → 350px（单列）。

### 响应式

- 组头 `sm` 以上吸顶（`sm:sticky sm:top-14`），手机不吸顶——390px 下组头换行到 114px，会吃掉视口。
组头自带一条 `border-b`：吸顶时它是卡片滑下去的那条边（没有它，卡片从组头下面经过时顶边消失、
只剩两条竖边悬着，像被削了顶）；静止时它是组头与网格之间的分隔线，所以网格从它下面 16px
（`pt-4`）开始，不贴着线。
- 卡片：`<sm` 1 列 / `sm` 2 列 / `lg` 3 列；卡内价格始终三列，不折叠
- 640px（2 列最窄处）实测列宽 73px，`$0.085` 与 `>272K $1.70` 都不裁切

---

## 7. 中文字体子集（改文案后必做）

`scripts/subset-font.py` 扫描 `src/` 与 `index.html`，把所有 CJK 字符打成子集：

```bash
pip install fonttools brotli     # 一次性
npm run fonts
```

- 源字体：`NotoSansSC[wght].ttf`（17 MB，从 google/fonts 下载）
- 先按 `wght=400` / `600` 各实例化一次，再 subset 成 woff2
- 扫到的字符数 < 50 会直接拒绝执行（防止路径错了写出一堆空字体）
- 输出：`public/fonts/noto-sans-sc-plaza-{400,600}.woff2`

**不重跑的后果**：新加的字掉回系统字体，同一句话里混两种设计。

验证方法（可选）：用 Playwright 抓 `document.body.innerText`，再用 fontTools 读 cmap 比对，
缺字为空串即通过。上一轮实测：页面出现 167 个汉字，185 个字的子集全部命中。

---

## 8. 部署

### Vercel

仓库根目录就是项目根目录，导入后：

| 项 | 值 |
| --- | --- |
| Framework Preset | Vite |
| Root Directory | `./`（默认） |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm ci` |

无环境变量，纯静态。

### 接进 Sub2API

后台「系统设置 → 自定义菜单」新增一项，URL 填部署地址。点开时 `CustomPageView.vue`
用 iframe 加载，并自动带上 `theme` / `lang` / user id / auth token 等查询参数。

页面内所有返回主站的链接都是 `target="_top"`，会跳出 iframe 整页跳转。

---

## 9. 三个运行时细节（别改坏）

1. **主题**：优先级 `?theme=` → `localStorage['sub2api-plaza:theme']` → `prefers-color-scheme`，
   在 `index.html` 的首屏内联脚本里就定下来，**不会闪**。跨域读不到父站的 localStorage 和
   class，所以只能靠 URL 参数传进来。
2. **主站地址**：`src/lib/site.ts` 从 `document.referrer` 取 origin（父站 Referrer-Policy 是
   `strict-origin-when-cross-origin`，能拿到），取不到回退常量 `https://ai.zhouwanx.top`。
3. **搜索框是 `type="text"` 不是 `type="search"`**：`search` 会渲染浏览器自带的蓝色清除按钮，
   无法上色，违反「不能蓝紫」。清除按钮是自己画的 `X` 图标。

---

## 10. 已知坑（都是真踩过的）

- **`vite preview` 会锁住项目目录**：占着 `dist/` 时对父目录 `mv` 会报
  `Device or resource busy`。移动目录前先 `taskkill` 掉监听端口的 node 进程。
- **`npm run build` 里的 `tsc` 是硬门禁**：`noUnusedLocals` / `noUncheckedIndexedAccess`
  开着，删组件后残留的 import 会让构建直接失败。
- **`@font-face` 只写一个 weight 是个陷阱**（见第 6 节）。
- **中文断行**：默认会把「每百万」拆成「每百 / 万」。段落用了 `break-keep`
  （`word-break: keep-all`），断点只落在空格和标点。
- **Playwright 截首屏外元素**用 `el.screenshot()`，`page.screenshot({clip})` 会报
  `Clipped area is either empty or outside the resulting image`。
- **Element 截图里的 sticky 组头会重叠**：截 `#g16` 这种区块时，吸顶头会盖住第一个模型，
  看着像 bug，实际不是。判断布局要看整页截图。
- Windows 上 bash 与原生 python 的 `/tmp` 不互通，临时文件写 `E:/tmp/...`；
  控制台是 GBK，python `print` 中文会乱码，要精确文本就写 JSON 再读。

---

## 11. 验收清单（改完自检）

```bash
npx tsc --noEmit          # 必须零输出
npx vite build            # 参考：CSS ~24.8 kB (gzip 7.7) / JS ~243 kB (gzip 76.6)
```

浏览器里过一遍：

- [ ] 13 个模型区块、4 个分组
- [ ] 浅色 / 深色两套都正常（`?theme=dark` 直接可测）
- [ ] 390px 宽无横向滚动（`document.documentElement.scrollWidth === 390`）
- [ ] 四个字体面 loaded（含 `Sheet Display SC 400/600`）
- [ ] 筛选：切分组只剩该组；搜索 `deepseek` 命中 4 行；无结果时出空态
- [ ] 排序「价格从低到高」：免费 → 国产 → ChatGPT-ProMax → 生图
- [ ] 零 console 报错、零 404 请求
- [ ] 价格抽查：gpt-5.6 `$0.85 / $5.10 / $0.085`，`>272K` `$1.70 / $7.65 / $0.17`；
      gpt-image-2 `$0.15 / $0.20 / $0.25`；glm-5.3-flash `$0.03 / $0.10 / $0.006`

---

## 12. 还没做、可以考虑的

- **没有自动同步**：改价要手改 `catalog.ts`。想做自动化，唯一可行的路子是在构建时（而非
  浏览器里）用服务端 token 拉接口生成 JSON，但那需要一个带密钥的构建环境，与「纯静态、
  无环境变量」冲突，所以当时没做。
- **没有 LICENSE**：仓库公开但无许可证文件，如需明确授权再加。
- **没有 CI**：可在 GitHub Actions 里跑 `npm ci && npm run build`，防止提交坏代码。
- **数据不一致的风险**：`catalog.ts` 是快照。后台改了价而这里没改，页面就会显示旧价。
  页脚有「更新于 2026-10-18」，改价时记得一起改 `UPDATED_AT`。

---

## 13. Git

```bash
git remote -v
# origin  https://CanYanQwQ@github.com/CanYanQwQ/models.git

git status -sb        # ## main...origin/main
```

历史（5 个提交，从最早的落地页到当前版本）：

```
4614999 docs(plaza): point the deployment notes at the standalone repo
e54e0da feat(plaza): filter by platform, group and rate, and sort by price
cc01874 style(plaza): lay the sheet out as a model-by-model list
c2ad60b docs(plaza): show the sheet in both themes and on a phone
87fca0d feat(plaza): a printed tariff sheet for the model catalogue
```

这个项目曾经是另一个仓库 `sub2api-pages` 里的 `plaza/` 子目录，用 `git subtree split`
拆出来独立，历史完整保留。**那个仓库里的副本已经删除**，不要再去那里找代码。
