# 对象库数据台账 V2（attributes audit log）

> 每个对象每条属性独立溯源。基准单位：线性 mm、重量 g、体积 ml。
> 首轮核验：2026-11-19（v1 对象）｜第二波核验：2026-11-20（新对象）
> 复审计划：上线后 3 个月或内容大改前重新核验全部 ⏳ 项。
> 状态：✅ 页面直接证实｜📖 标准/官方定义值｜⏳ 待复核（数值可靠，来源页未直接确认）

## 核验状态总览（52 对象）

### 官方/标准来源（📖 高置信）
- **Space（NASA Fact Sheet）**：Sun、Earth、Moon、Jupiter、Mars 的 diameter + volume —— 全部 ✅（NSSDC 官方数值表）
- **标准尺寸**：A4 paper（ISO 216）、Credit card（ISO/IEC 7810）、Ruler 30cm、Door 80in —— 📖
- **Apple 官方规格**：Smartphone（iPhone 15 147.6mm/171g）、Laptop（MBA 13 304mm/1240g）—— ⏳ 页面动态加载，数值为官方公开规格
- **官方站点**：Eiffel（330m/10,100t）、Burj（828m）、Liberty（93m, NPS）、Everest（8,848.86m, 2020 尼中联合测量）—— ✅/⏳

### 动物（✅/⏳，均带 range + uncertainty note）
- ✅ 直接证实：House mouse（ADW：头体长 65–95mm 原文证实；体重 ⏳ 常识 17–25g）
- AKC 品种标准：Dog (Labrador) 肩高/体重（22.5–24.5in / 65–80lb）—— ⏳ 待对标准文档复核
- NatGeo/SD Zoo/BAS/Britannica：Elephant、Giraffe、Blue whale、Polar bear、Ostrich、Lion、Pig、Cow、Horse、Rabbit、Great white shark、Emperor penguin —— ⏳ 常见权威表述，已标注范围
- **T. rex**：AMNH —— ⏳ 化石估算强制标注 uncertainty（hip 3.6–4m / length 11–13m / mass 5–10t）

### 日常/食物（⏳ 范围已标注）
- Basketball：Ø 由官方 29.5in 周长换算；weight 22oz NBA ⏳
- Tennis ball：ITF 规格 65.4–68.6mm / 56–59.4g ⏳（ITF 站迁移至 world.tennis，下次更新 URL）
- Food（USDA/FDC/NWPB 参考）：banana、egg（USDA large 57g ✅ 标准）、watermelon、pineapple、orange、bottle —— ⏳ 范围标注
- 小物品（pencil/eraser/ruler/book/desk/door/creditcard/sodacan）：常识标准值 + 范围 ⏳

### 载具（⏳）
- Car / Pickup：厂商官方规格数值（Camry 4880mm/3,300lb；F-150 5890mm/4,700lb），动态页面待复核
- Bus：Type D 常见尺寸范围 ⏳；Bicycle 典型范围 ⏳

## 下一轮审计 TODO
1. NBA 规则 PDF / ITF world.tennis / AKC 标准文档直接复核三个球类+拉布拉多数值
2. 厂商页面（Apple/Toyota/Ford）动态渲染，改用官方 PDF 规格表或 support 页
3. 小物品（pencil/eraser/creditcard 等）找厂商规格页替换"常识值"
4. school bus 找州 DOT 规格表
5. Cow 重量找 USDA 奶牛统计页

## 规则
- 视觉素材：45 个对象使用 Microsoft Fluent Emoji（Color 3D 风格 SVG，MIT 许可，可商用免署名；来源 microsoft/fluentui-emoji@main，经 @iconify-json/fluent-emoji@1.2.7 + fastly.jsdelivr CDN 获取）；7 个无对应 emoji 的对象（eraser/desk/child/jupiter/mars/burj/ostrich）保留自绘几何 SVG（CC0）
- Fluent 图标的内容边界框经浏览器栅格化实测（scripts/emoji-tools/fluent-bbox.json），裁剪框已烧进每个 SVG 的根 viewBox——渲染全幅贴合真比例框与地线；SVG 内部 defs ID 已按对象前缀化（跨图标 10k+ ID 冲突规避）；About 页保留 MIT 署名（非强制，善意保留）
- 每条属性必须：context 明确（什么口径）+ source + checked_at；估算/范围必须 uncertainty_note
- 体积只收录可辩护对象（球体/标准容器/天体），不编造不规则物体积

---

## 2026-11-20 扩容批次（139 个新对象，库总量 191）

| 批次 | 数量 | 来源体系 | 置信度 |
|---|---|---|---|
| 狗品种 | 24 | AKC 品种标准（肩高/体重区间中值） | ⏳ 标准值，下次对 AKC 单品种页复核 |
| 猫品种 | 10 | CFA 品种档案（体重）+ 代表性体长 | ⏳ 体长非注册标准，已标注 |
| 电视 | 7 | 由标称对角线 + 16:9 面板比推导宽/高 | 📖 推导明确，含公式说明 |
| 床垫 | 6 | 美标床垫尺寸 | 📖 标准值 |
| 球类 | 9 | FIFA/NFL/FIVB/MLB/WPA/ITTF/USBC/NHL/World Rugby 官方规格 | ⏳ 规格区间中值，待对官方文档复核 |
| 食物 | 29 | USDA FoodData Central（典型中等零售份） | ⏳ 范围已标注 |
| 动物补充 | 22 | NatGeo / Britannica / BAS / SD Zoo | ⏳ 范围已标注 |
| 载具补充 | 11 | Boeing/Robinson/NASA 官方或典型区间 | ⏳ 区间已标注（消防车/救护车等近似） |
| 乐器 | 6 | Yamaha 等厂商典型规格 | ⏳ |
| 天体 | 1 | NASA Saturn Fact Sheet | ✅ |
| 日常 | 15 | IEC 60086（AA）/ ANSI A19 / 厂商典型 | ⏳ 区间已标注 |

- 视觉素材：新对象全部走 Fluent Emoji（MIT）；品种类共用通用 dog/cat 图标（同画布靠名称区分）
- 下轮审计重点：AKC 单品种页数值、球类官方规格 PDF、食物 USDA 条目锚定

## 第三波核验（2026-11-21，商业品类扩展）

### 新增对象（4）
| 组 | 数量 | 来源 | 状态 |
|---|---|---|---|
| 床垫补充 | 1 | Wikipedia Bed size（Twin XL 965×2032mm） | 📖 标准值 |
| 行李箱 | 3 | Wikipedia Hand luggage（IATA 56×45×25 建议上限；easyJet 小行李 45×36×20；随身小包典型上限 40×30×20，带 range） | ✅ 当日 curl 拉取原文证实；航司各自上限不同已标注 |

### 商业对象视觉重构（17 个：电视 7 / 床垫 7 / 行李箱 3）
- 弃用 Fluent Emoji 卡通图，改为自绘产品化剪影（tvpanel / mattress / suitcase，CC0 原创作品）
- 修正诚实性问题：emoji 宽高比 ≠ 产品真实比例（电视原 0.928 → 真实 16:9 = 0.5625；床垫原 1.421 → 各自真实宽/长）
- 新增 `rect: ['width','height']` 成对属性机制：显示任一边时，另一边取实测值（见 objects.ts / ScaleCanvas objectVisual），两轴均真实比例
- bed.svg / television.svg / luggage.svg 资产及 fluent-map 对应条目已删除

### 新增精选对（8，商业意图词）
bed-queen×bed-full、bed-king×bed-queen、bed-full×bed-twin、bed-twin-xl×bed-twin、tv-65×tv-55、tv-75×tv-65、luggage-carry-on×luggage-personal-item、luggage-carry-on×luggage-cabin-eu

## 第四波：area 属性家族 + 国家数据 + 答题模式（2026-11-21）

### area 属性家族（新第四家族）
- 基准单位 mm²；`AreaUnit` = mm²/cm²/m²/km²/sq ft/sq mi（英制按 1 ft = 0.3048 m 精确定义换算）
- 界限：MIN_AREA_MM2 = 1 m²，MAX_AREA_MM2 = 1e10 km²
- 可视化：`AreaSquares`（charts.ts `areaSquareLayout`）——方块边长 ∝ √面积（与体积球 ∛V 同哲学），单一共享 scale
- area 格式化带千分位（国家尺度读感：9,596,960 km²）；ratioPhrase/answerLine 用 "N× the area of"

### 新增对象（67，category: 'place'）
| 组 | 数量 | 来源 | 状态 |
|---|---|---|---|
| 全球国家 Top 61 | 61 | CIA World Factbook — Geography > Area: total（land + water） | 📖 单一口径全库一致，checked_at 2026-11-21 |
| 小国对照 | 6 | 同上（Vatican 0.44 / Monaco 2.02 / Liechtenstein 160 / Luxembourg 2,586 / Belgium 30,528 / Netherlands 41,850 km²） | 📖 |

- 生成脚本 `scripts/emoji-tools/wave-places.py`（输出 wave-places.txt 后拼入 library.ts）；mm² 字面量经 round-trip 校验与 km² 源值精确一致
- Fluent Emoji 无国旗图标（微软系不做国旗 emoji），国家条目不带 image——AreaSquares 纯方块 + 名称渲染，选择器用 `placesquare` 剪影占位（CC0）
- 注：France 用 CIA total 643,801 km²（含海外领地）；Morocco 446,550 为 CIA 口径

### 新增精选对（15，area 属性）
china×united-states、canada×united-states、russia×china、brazil×australia、china×india、france×ukraine、egypt×turkey、mexico×indonesia、mongolia×france、netherlands×belgium、united-states×india、australia×india、spain×sweden 等——blurb 手写，数值口径已人工复核

### 答题模式（/quiz/）
- 机制：出题时画布等大小（真实比例与数值隐藏）→ 作答后 `computeRevealLayout` 从等大布局插值到真实布局（p=1 时与 computeLayout 完全一致），几何平均为等大参考
- 四画布（ScaleCanvas/WeightBars/VolumeSpheres/AreaSquares）均支持 `reveal` prop（默认 1 = 原行为，PNG 导出不受影响）
- 引擎 `src/lib/quiz.ts`：题池 = 精选 PAIRS + 库内同属性自动对（比值 ∈ [1.2, 80]），难度按比分档（≥3× 易 / 1.6–3× 中 / 1.2–1.6× 难），10 题一局 3易+4中+3难、同局对象不重复，mulberry32 种子随机
- useReveal 遵守 prefers-reduced-motion（直接跳终态）；最佳成绩存 localStorage `sizecompare:quiz:v1`；GA4 事件 quiz_start / quiz_answer / quiz_round_end
