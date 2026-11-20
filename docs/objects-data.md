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
- 视觉素材：45 个对象使用 Twemoji SVG（CC BY 4.0，© Twitter and contributors，未修改，经 fastly.jsdelivr CDN 获取，来源 jdecked/twemoji@15.1.0）；7 个无对应 emoji 的对象（eraser/desk/child/jupiter/mars/burj/ostrich）保留自绘几何 SVG（CC0）
- Twemoji 的内容边界框经浏览器栅格化实测（scripts/emoji-tools/emoji-bbox.json），渲染时按框裁剪，保证贴合真比例框与地线；About 页已按 CC BY 4.0 要求署名
- 每条属性必须：context 明确（什么口径）+ source + checked_at；估算/范围必须 uncertainty_note
- 体积只收录可辩护对象（球体/标准容器/天体），不编造不规则物体积
