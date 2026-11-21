# 国家面积对比：真实轮廓重叠模式（thetruesizeof 风格）

## Context

用户在体验站点时提出：国家面积对比（目前是抽象方块 `AreaSquares`）希望换成**重叠对比**——两国真实轮廓以同一比例叠放，一眼看出大小差。这是最有传播力的地图对比形态。站点品牌是"真比例诚实"，因此轮廓必须**等积投影 + 按 CIA 官方面积校准 + 两国共用一个比例因子**。已确认：**place 对 place 默认重叠、可切回方块（localStorage 记住）；v1 静态不可拖拽；quiz 保持方块**（重叠图直接暴露答案，会破坏等大出题→揭晓的教学节奏）。

现状关键事实（探索结论）：国家无任何轮廓数据（`silhouette: 'placesquare'` 只是抽象方块，AreaSquares.tsx:149-157 自绘矩形）；四家族分支代码复制在 4 处（ComparisonTool 主画布 361-393 / 打印 528-556 / PresentationMode 78-114 / QuizGame 295-331）；导出契约 = 元素 id `compare-canvas-svg` + 纯内联属性（exportPng.ts）；数据生成走 `scripts/emoji-tools/wave-*.py` 惯例（生成物手工/直接拼入）。

## 1. 数据管线（构建期，不进运行时依赖）

**新增 devDeps**：`world-atlas`（Natural Earth 110m TopoJSON，公有领域）、`topojson-client`、`d3-geo`（+ 对应 @types）。npm registry 可达（记忆：npm pack 可用）。

**新增脚本 `scripts/emoji-tools/build-place-shapes.mjs`**（遵循 wave 脚本 docstring 惯例：单一来源、checked_at、断言）：
1. 内置 67 国 `id → world-atlas name` 映射表（如 `'united-states' → 'United States of America'`），脚本断言 67/67 全匹配、列出漏网者。
2. 每国：`geoAzimuthalEqualArea` 以该国质心为中心投影（形状最不失真、等积）→ 装入 512×512 viewBox、坐标取整 → SVG path 字符串；同时计算投影形状面积，得出**校准系数 `calib = sqrt(CIA面积 / 投影面积)`**。断言 calib ∈ [0.9, 1.1]（超界=数据可疑，报错列出）。
3. 直接写出 **`src/data/placeShapes.ts`**（生成文件，仿 build-fluent-assets.py 直接写产物先例）：`export const PLACE_SHAPES: Record<string, { path: string; viewBox: string; calib: number } | undefined>` + 头注释（Natural Earth PD、生成日期、脚本名、重跑方法）。目标：整文件 ≤ ~250KB 原始（path 取整后 gzip 约 50-70KB）。
4. **不改动 library.ts**——轮廓按 id 关联，避免动 7375 行数据文件；attribution 在 placeShapes.ts 头部 + 画布角注（"Outlines: Natural Earth (public domain)"）。

## 2. 布局引擎（纯函数 + 测试）

**`src/lib/charts.ts` 新增 `overlayLayout(shapes, values, box)`**（与 `areaSquareLayout` 138-180 同风格）：
- 输入各国 `{pathBBox 按 calib 校准后的宽高}`（mm² 域）+ box，输出共享 px 比例因子（装下最大国 bbox）、各国锚定位置（**底部中心对齐**，大国在后、小国半透明在上）、baselineY、ratio、extreme。ChartError 同现有惯例。

**`src/lib/charts.test.ts` 补测试**：等比缩放正确性（一国的宽高严格 ∝ 其校准后 bbox）、锚点底部对齐、超大比值抛错、单对象/缺 shape 的行为。

## 3. 新组件 `src/components/tool/AreaOverlay.tsx`

- **props 与 AreaSquares 完全同构**（objects/attr='area'/box/unitSystem/large/showSources/svgId），**无 reveal**（quiz 不用）。
- 纯 SVG、仅内联属性（导出契约）；大国实色 0.92 → 小国 fill opacity ~0.5 + 实线描边，两国都可见；每国底部标签（名称 + 面积值，复用 `formatAttrValue`/`objectSourceLine` 截断惯例）+ 顶部 ratio 说明（复用 `ratioPhrase`）；角注 "One shared scale — outlines equal-area calibrated to CIA World Factbook totals. Outlines: Natural Earth (public domain)."
- 任一对象无 shape（自定义对象）→ 由调用方回退，组件本身不处理。

## 4. 接入四个渲染位（三改一不改）

- **`ComparisonTool.tsx`**：`StudioState` 增 `areaMode: 'overlay' | 'squares'`（localStorage `sizecompare:studio:v2` 随现有 save/restore 走，110-132 行）；**默认规则：attr=area 且当前对象全部是 library place 且都有 PLACE_SHAPES 条目 → overlay，否则强制 squares 并禁用切换**。主画布 + 打印两处分支接入；画布上方（attr=area 时）加 Overlay/Squares 分段切换（样式仿现有 metric/imperial 切换）。`preloadIds` 路径天然满足默认规则 → 15 个国家对页零改动即默认重叠。
- **`PresentationMode.tsx`**：新增 `areaMode` prop，分支接入。
- **`QuizGame.tsx`：不改**（area 分支继续 AreaSquares + reveal）。
- **GA4**：`comparison_generated` 事件在 attr=area 时附加 `mode` 属性（track.ts 联合类型微扩）。

## 5. 文档

- `docs/objects-data.md` 台账补一节：place 轮廓来源 Natural Earth 110m（PD）、等积投影 + CIA 校准方法、重跑命令。

## 验证

1. `node scripts/emoji-tools/build-place-shapes.mjs` → 输出 67/67 匹配、calib 范围（应在 0.97-1.03 一带）。
2. `npm test`（新增 overlayLayout 测试 + 现有 97 全绿）、`npx astro check`、`npm run build`。
3. `npm run preview` + 浏览器实测（localhost，非 127.0.0.1）：
   - `/compare/china-vs-united-states/` 默认重叠、轮廓可辨识、ratio 正确；
   - Studio 选 Russia + China → 重叠；切 Squares → 方块；刷新后记忆保持；加自定义对象 → 强制方块且切换禁用；
   - **PNG 导出**（重叠图导出无外部图片，比方块还简单）、打印视图、Presentation；
   - `/quiz/` area 题仍为方块 + 揭晓动画。
4. 记忆文件更新项目状态（新功能 + 生成脚本惯例）。