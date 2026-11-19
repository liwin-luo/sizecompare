# SizeCompare.org 产品规划 V1.1（调整执行版）

> 版本：V1.1（在 V1.0 研究稿基础上的调整与执行冻结版）
> 日期：2026-11-19
> 前置文档：`sizecompare-visual-comparison-product-plan.md`（V1.0 方向调整研究稿）
> 状态：**方向已确认，MVP 范围已冻结，进入执行**

---

## 0. 本次决策记录（产品负责人已确认）

| 决策项 | 结论 |
|---|---|
| 产品方向 | **正式切换**为 Teacher-first Visual Size Comparison Maker；原家具适配方向（Space & Fit Compare）归档，不再投入 |
| 对比维度 | 第一期只做「尺寸」，不扩展重量、价格、优缺点 |
| MVP 范围 | **裁剪版 MVP**（见 §3），差异化功能锁死 P0，砍掉非必要项 |
| 技术栈 | Astro（SSG）+ React island + TypeScript；纯静态、无后端；部署 Cloudflare Pages |
| 验证方式 | 无前置访谈渠道 → **原型优先**：上线后用 GSC + 聚合事件 + 教师社区反馈验证（28 天基线） |

---

## 1. V1.0 合理性分析结论

### 1.1 研究可信度核验（2026-11-19 抽查）

V1.0 中 4 个最关键竞品链接经逐一抽查**全部真实存在，且描述准确**：

| 竞品 | 抽查结果 | 对判断的影响 |
|---|---|---|
| LessonCraftStudio | 属实。已从 Big/Small maker 扩展为 26 种题型的 Measurement & Size maker，订阅制 $69/年 | worksheet 赛道确实拥挤且已商业化成熟 |
| Dragoon Apps | 属实。555 对象、Three.js 真 3D、自定义、PNG/JSON/分享链接 | 通用比较器无空白市场 |
| **HandyToolkits** | 属实。自定义输入、同比例并排、尺寸标注线、最多 8 对象、PNG 下载、URL 分享（"Nothing is uploaded"）、广告支持免费 | **已覆盖 V1.0 裁剪版 MVP 约 70% 的功能面** |
| Peabody | 属实。407 组动物对比、儿童参照身高、速度/体重/寿命等 | 动物比较赛道有成熟产品 |

### 1.2 核心判断

- **方向合理**：域名匹配、任务真实（课程标准 K.MD.A.2 直接要求尺寸比较教学）、不依赖商品数据库、变现路径清晰。
- **但差异化窗口比 V1.0 暗示的更窄**：HandyToolkits 已实现大部分通用比较功能。真正的市场空隙**只在教师工作流**：
  1. 课堂投屏模式（全屏、大字、提问揭晓）
  2. 练习纸导出（与真实比例绑定的 A4/Letter 打印）
  3. 课堂提问 / 答案显隐
  4. 测量口径与数据来源标注（measurement context + source，所有竞品均未做好）

  **这 4 项是差异化本体，必须进 P0**；通用比较功能（同尺度、自定义、PNG）只是入场券，不能作为卖点。
- V1.0 的数据准确性设计（§4.3 元数据字段）、COPPA/TFAT 合规意识、不做什么清单，全部保留执行。

---

## 2. 相对 V1.0 的 6 处调整

| # | 调整 | 原因 |
|---|---|---|
| 1 | **投屏模式 + 练习纸导出锁死 P0**；分享链接、图片上传、独立 PDF 生成库移出 MVP | 差异化本体不能延后；打印 CSS + 浏览器「另存为 PDF」已满足 A4/Letter 需求，省掉 PDF 库复杂度 |
| 2 | **Phase 0 从「先访谈再开发」改为「原型优先，上线后数据验证」** | 无美国教师访谈渠道；可交互原型本身就是最好的验证物料；公开上线 + 社区发帖（r/Teachers、教师 Facebook 群、Pinterest）收集真实反馈 |
| 3 | **首期 SEO 页面 11 个 → 7 个** | V1.0 自己的发布准入标准（§6.6：有独立意图 + 有真实资源）不支持首发 11 页；其余页面待 GSC 数据后再定 |
| 4 | **内置对象 20–40 个 → 16 个起步** | 每个对象需来源核验 + 原创 SVG + 授权记录，内容成本高于想象；自定义对象功能已覆盖长尾 |
| 5 | **上线暂不接 AdSense** | 先保证 CWV 与产品体验，建立 28 天流量基线后再申请（与 V1.0 §8.5 判断一致）；变现路径记入路线图而非首日任务 |
| 6 | **修正 V1.0 内部矛盾**：§4.2 Step1 列出 Image 入口，§5.2 又把图片裁剪放 P1 | 统一为：MVP 不做图片上传，三个入口减为两个（Library + Custom） |

---

## 3. 裁剪版 MVP 定义（P0 冻结清单）

### 做（P0）

| 功能 | 验收标准 |
|---|---|
| 2–3 个对象比较 | 可同时显示 2–3 个对象 |
| 自定义对象 | 名称 + 数值 + 单位 + 测量维度（Height/Length/Width/Diameter） |
| 内置对象库 | 16 个有来源、有口径说明的对象（见 §4） |
| 同尺度 SVG 渲染 | 共同 scale factor，纵横比锁定，禁止单独拉伸 |
| 模式 | Side-by-side（并排）+ Reference（参照物） |
| 尺寸标注 | 基线、尺寸线、名称、数值、单位、当前比较维度标签 |
| 单位换算 | cm/m/mm/in/ft，底层数值统一 mm 不失真；英制 ft-in 显示 |
| 维度不匹配警告 | 混用不兼容维度时明确警示 |
| 编辑面板 | 标题、副标题、课堂提问、答案显隐、单位制切换 |
| 投屏模式 | Fullscreen API + 大字版式 + 提问揭晓，隐藏编辑控件 |
| PNG 导出 | 导出与预览一致 |
| 打印/练习纸 | 打印 CSS 输出 A4/Letter 干净版式（浏览器另存为 PDF） |
| 示例项目 | 3–5 个无需输入即可体验的示例 |
| 本地持久化 | localStorage 自动保存当前项目 |
| 移动端适配 | 手机可制作，平板/桌面适合投屏 |

### 不做（推迟到 P1+，验证后按数据决定）

分享链接、图片上传与本地裁剪、独立 PDF 生成库、2–5 对象排序练习、worksheet 题型生成、对象库搜索、多主题、账号体系、AI 估尺寸、3D、AdSense 接入。

---

## 4. 首期内置对象库（16 个 + 来源口径要求）

| 类别 | 对象 |
|---|---|
| Classroom | 铅笔（新 #2 笔长）、橡皮、30cm 尺、书、课桌（标准高度）、门（标准高度） |
| Everyday | 苹果（直径）、篮球（官方 7 号球直径）、网球（直径）、A4 纸（ISO 216）、信用卡（ISO/IEC 7810 ID-1）、易拉罐（12 oz 高度） |
| Animals | 老鼠（体长）、猫、狗（拉布拉多）、大象（非洲丛林象肩高）、长颈鹿（肩高/总高）、蓝鲸（体长） |
| References | 儿童身高（约 1.2 m，标注为例示值）、成人身高（约 1.7 m，标注为例示值） |

数据规范（每条记录必填）：`id, name, category, dimension_type, value, min/max(如适用), unit, measurement_context, source_url, source_name, checked_at, uncertainty_note, image_asset(原创 SVG), image_license(自绘), attribution`。

来源优先级：ISO/行业官方标准（A4、信用卡、篮球）＞ 权威机构（史密森尼、大学、博物馆动物数据）＞ 自测日常物品（明确记录测量方法）。逐条台账见 `docs/objects-data.md`。

---

## 5. 首批页面（7 个）

| URL | 定位 | 关键要求 |
|---|---|---|
| `/` | 首页 | 可交互示例 + 三步说明 + 工具入口 |
| `/tools/size-comparison-maker/` | 核心工具页 | 工具本体 + 使用说明 + FAQ |
| `/size-comparison-for-kids/` | 受众落地页 | **教师框架措辞**（teaching size comparison to kids），内容面向教师，避免儿童向视觉 |
| `/animal-size-comparison/` | 示例画廊页 | 内置动物示例 + 数据来源说明 |
| `/guides/how-to-teach-big-and-small/` | 教学指南 | 年龄适配、课堂步骤、常见误区 |
| `/privacy/` | 隐私政策 | 无账号、无上传、本地处理、GA4 聚合事件说明 |
| `/about/` | 关于 | 数据来源方法论 |

SEO 基础：canonical、sitemap（仅规范页面）、robots、OG、JSON-LD（WebApplication；FAQPage 仅在有真实 FAQ 时用）、GA4 聚合事件（tool_start / object_added / comparison_generated / export_png / print_started / presentation_started，不含 PII）。

其余 V1.0 列出的 URL（worksheets、everyday-object、classroom-activities、how-to-compare-object-sizes 等）**待 28 天 GSC 数据后按查询词决定**，不自动批量生成。

---

## 6. 技术架构（冻结）

- **Astro 5 SSG** + `@astrojs/react` island（工具页按需 hydrate）+ `@astrojs/sitemap`
- 纯静态输出 → Cloudflare Pages；**无后端、无数据库、无用户上传**
- 内部单位统一 **mm**；显示层换算；英制提供 ft-in 组合显示
- SVG 渲染：viewBox 由最大对象决定，单一 scale factor；对象剪影为自绘几何风 SVG（规避版权）
- PNG 导出：SVG 序列化 → canvas → toBlob，无第三方依赖
- 测试：vitest 覆盖单位换算、尺度因子、输入校验、维度不匹配逻辑
- 无外部字体（系统字体栈）保 CWV；可访问性：对比度 AA、信息不只靠颜色传达

## 7. 执行路线

| 阶段 | 内容 | 状态 |
|---|---|---|
| Phase 1 | 规划落库（本文档）+ Astro 脚手架 + git | 进行中 |
| Phase 2 | 核心引擎（units/scale/objects）+ vitest | |
| Phase 3 | 工具 UI（React island：画布/选择器/编辑/投屏/导出） | |
| Phase 4 | 对象库内容生产（16 条 + 来源台账） | |
| Phase 5 | 7 个页面 + SEO 基础 + GA4 事件 | |
| Phase 6 | 浏览器 5 任务实测 + Lighthouse ≥90 + 构建验证 + 部署 | |
| Phase 7（上线后） | 28 天基线 → 决定 worksheet maker / 分享链接 / AdSense / 页面扩展 | 非本次开发 |

## 8. 合规基调（贯穿所有实现）

- 网站操作者是教师/家长等成人；学生只是材料观看者
- 无账号、无上传、无学生个人信息；一切比较数据存浏览器本地
- "for kids" 页面全部用教师受众措辞与视觉；整体不做幼儿向设计
- GA4 仅聚合事件；后续接广告前重新评估 TFAT 儿童年龄处理设置
- 数据口径与不确定性永远可见；估算范围明确标注
