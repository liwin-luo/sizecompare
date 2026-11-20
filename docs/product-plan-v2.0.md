# SizeCompare 产品规划 V2.0 — 通用 Compare 平台

> 版本：V2.0（方向重构版，取代 V1.1）
> 日期：2026-11-20
> 前置文档：`product-plan-v1.1.md`（教师优先版本，已归档保留）
> 状态：**方向已确认，进入执行**

---

## 0. 决策记录（产品负责人已确认）

| 决策项 | 结论 |
|---|---|
| 产品定位 | **通用 compare 平台**：用户在这里找到想比较的东西，比较多维度属性（重量/体积/高度等） |
| 受众 | 通用受众；**删除教师页面与教师框架文案** |
| 首发属性 | 尺寸（高度/长度/宽度/直径）+ **重量** + **体积**，三族全上 |
| 对象库规模 | 约 50 个，每个属性逐条来源核验 |
| 对比对静态页 | 生成 25–40 个精选热门对（programmatic SEO），不做 N² 组合 |
| 技术栈 | 沿用 Astro + React island + 纯静态（不变） |

## 1. 与 V1.1 的关系

保留并复用（V1.1 的核心资产）：
- 单位换算引擎（mm 基准，精确系数）与输入校验
- 真比例渲染引擎（共同 scale factor、锁定纵横比、极端比值警告）
- 自绘 CC0 剪影库与授权原则
- 数据溯源字段设计与台账制度
- PNG 导出 / 打印工作表 / 投屏模式 / localStorage 持久化
- COPPA 友好姿态：无账号、无上传、无学生数据

改变：
- 受众从教师转为通用；教师内容页删除
- 单一「尺寸维度」模型 → **多属性测量模型**（每对象 1–3 个属性各自溯源）
- 单一可视化 → **三族可视化**（线性真比例 / 重量条形 / 体积立方根球体）
- 单一工具入口 → **发现层**（搜索 + 分类浏览 + 精选对比对页）

## 2. 属性系统

`AttributeKey = 'height' | 'length' | 'width' | 'diameter' | 'weight' | 'volume'`

- 线性族（height/length/width/diameter）：真比例并排渲染，画布标注各对象自己的维度
- 重量：横向条形图，条长严格按真实比例；显示比值
- 体积：球体半径 ∝ ∛V（三维诚实缩放），画布注明缩放规则避免「看起来差不多」误导

对象模型 v2：

```text
Object v2
- id, name, category, silhouette
- measurements: Partial<Record<AttributeKey, Measurement>>
Measurement
- value / min / max（基准单位：线性 mm、重量 g、体积 ml）
- measurement_context, source_url, source_name, checked_at, uncertainty_note
```

一个对象不一定有全部属性；比较时由选中对象**共同拥有的属性**推导可用属性页签；无共同属性时明确提示。

## 3. 可视化诚实性规则（延续 V1.1 并扩展）

- 线性族：同一属性共用一个 scale factor；混用不同线性维度时警示
- 重量：条形长度 ∝ 真实质量，不截断坐标轴
- 体积：球体半径 ∝ ∛V；画布固定注明 "Sphere size scaled by volume (radius ∝ ∛V)"
- 极端比值：警告但不偷偷放大最小对象；比值直接标注（"about 66× heavier"）
- 所有数值显示随单位制切换（公制/英制），底层值不变

## 4. 对象库（~50）

类别：Animals(~18)、Everyday(~15，含原 classroom 物品)、Food(~6)、Space(~5，NASA fact sheet)、Buildings(~4)、Vehicles(~4)。

- 动物普遍带 height + weight；天体带 diameter + volume；日常物带 length/height + weight 或 volume（可辩护者）
- 每个属性独立溯源；台账 v2 记录置信度（直接证实/标准引用/待复核）+ 复审计划

## 5. 页面架构（v2）

```text
/                       首页：搜索 hero + 热门对比 + 分类入口 + 属性说明
/studio/                Compare Studio（核心工具，原 /tools/size-comparison-maker/）
/compare/               对比索引：分类浏览 + 全部精选对
/compare/<a>-vs-<b>/    精选对比对页（~30 个，SSR 内容 + 嵌入 Studio）
/animal-size-comparison/ 动物数据页（扩重量列）
/about/  /privacy/       通用化文案
```

删除：`/size-comparison-for-kids/`、`/guides/how-to-teach-big-and-small/`、教师导航。

对比对页质量门槛（沿用 V1.1 §6.6）：真实数据 + 交互比较 + 数据表 + 来源 + 手写 blurb；无共同属性的对不入选。

## 6. 执行阶段

| 阶段 | 内容 |
|---|---|
| R1 | 本文档 + 删教师页 + 通用化基础文案 |
| R2 | attributes.ts + units 扩展（重量/体积/km/上限）+ WeightBars + VolumeSpheres + 模型 v2 + 测试 |
| R3 | 对象库 ~50 + 台账 v2 |
| R4 | Compare Studio（搜索、属性页签、三可视化、通用文案） |
| R5 | 首页 v2 + /compare/ 索引 + ~30 对比页 + 周边 |
| R6 | 全套验证 + 部署指引 |

## 7. 合规与隐私（不变）

无账号、无上传、无后端；一切本地处理；GA4 仅聚合事件；上线暂不接广告。
