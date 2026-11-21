# Quiz 分享闭环：emoji 战绩 + URL 编码同题挑战

## Context

sitedata.dev 增长榜分析结论：上榜的互动站（royaledle 3.4M/月 DR1.3、cupsimulator 140K/月 DR0）全部具备"可晒的结果 + 编码进 URL 的同题挑战"分享闭环。我们刚上线的 `/quiz/` 目前 `share()` 只分享裸 `/quiz/` URL 和一句纯文本，没有传播杠杆。本次给 quiz 补上：**Wordle 式 emoji 战绩 + 带种子（seed）的挑战链接**——朋友点开链接玩到同一组 10 题，并显示"要打败的分数"。

现有基础（探索确认）：
- `src/lib/quiz.ts`：`mulberry32(seed)` PRNG + `buildQuestionPool()`（确定性排序）+ `pickRound(pool, seed)` —— **一个 seed 已完全决定一轮题目**，分享只差把 seed 放进 URL
- `QuizGame.tsx`：phase 机（intro/asking/revealed/summary）、`answers: Answered[]`（含 correct 标记）、现有 `share()`（navigator.share → 剪贴板降级）、localStorage 只存 `{rounds, best}`（无冲突风险）
- 全站尚无 `URLSearchParams` 用法，本次是首例；comparison 页已有 props 注入先例
- `seed` 初始为 `useState(1)`，`startRound` 取随机数——URL 参数在 mount effect 中覆盖即可（遵循 ComparisonTool.tsx:108-123 的"挂载恢复不得覆盖 URL 意图"教训）

## 改动

### 1. `src/lib/quiz.ts` — 纯函数（可测）
- `export const QUIZ_VERSION = 1` —— 池子内容变化（library/pairs 增删）会改变 seed 对应题目，版本号用于让旧链接优雅降级（版本不符 → 忽略 seed，普通随机开局）
- `parseQuizUrl(search: string): { seed: number | null; beat: number | null }` —— 解析 `?s=&b=&v=`；`s` 合法范围 [1, 2³¹)，`b` ∈ [0, 10]；`v` 缺省视为 1，不符则 seed 置 null
- `quizUrl(seed: number, beat?: number): string` —— 生成 `/quiz/?s=..&b=..&v=..`（含 SITE.origin）
- `buildShareText(correctFlags: boolean[], score: number, url: string): string` —— 输出：
  ```
  SizeCompare Quiz 📏 7/10
  🟩🟥🟩🟩🟥
  🟩🟩🟥🟩🟩
  Same 10 questions — can you beat me?
  https://sizecompare.org/quiz/?s=123456&b=7&v=1
  ```
  （两行各 5 格，Wordle 式 🟩/🟥）

### 2. `src/components/quiz/QuizGame.tsx`
- 新增 state `challenge: { seed: number; beat: number | null } | null`（初始 null）
- mount effect：`parseQuizUrl(location.search)`；有 seed → `setSeed(seed)` + `setChallenge(...)`（URL 意图优先，localStorage 只存战绩不受影响）
- `startRound(seedOverride?)`：challenge 用 override，否则随机；开题后 `history.replaceState(null, '', quizUrl(seed))` —— 刷新页面题目不变，且之后点 Share 时 `location.href` 自然带正确 seed（cupsimulator 模式）
- intro 屏：challenge 存在时显示挑战横幅："🎯 Same 10 questions as your friend — score to beat: 7/10"（无 b 时显示 "a friend's round"）
- summary 屏：challenge 且有 beat 时加一行 verdict（"You beat the challenge! 🏆" / "Not enough — 7/10 to beat"）；emoji 网格预览块（展示将要复制的战绩图）
- "Play again"：随机新 seed、replaceState 更新 URL、`setChallenge(null)`
- `share()`：改用 `buildShareText(answers.map(a => a.correct), score, quizUrl(seed, score))`；保留 navigator.share → 剪贴板降级 + shareNote；成功后 `track('quiz_share')`

### 3. `src/components/tool/track.ts`
- 事件表加 `quiz_share`（沿用现有 quiz_* 模式，ga4Id 未配置时 no-op）

### 4. `src/styles/quiz.css`
- `.quiz-challenge`（intro 横幅）与 `.quiz-share-preview`（等宽字体网格预览）两个类，沿用现有 tokens 和 `.quiz-summary` 风格

### 5. `src/pages/quiz/index.astro`
- FAQ 里分享相关文案更新一句：提到 emoji 战绩与"同题挑战链接"（现有文案只说 native share sheet）

### 6. `src/lib/quiz.test.ts` — 新增单测
- `parseQuizUrl`：合法 s/b/v 解析正确；版本不符 seed 置 null；越界值拒绝；空/畸形参数安全
- `quizUrl` ↔ `parseQuizUrl` 往返一致
- `buildShareText`：恰好 10 格、两行各 5、头部含分数、尾部含 URL

## 验证

1. `npm test` —— 新增单测 + 既有 seed 决定性测试全绿
2. `npm run build` —— 静态构建通过
3. `npm run dev` + 浏览器实测：
   - 玩一轮 → URL 变为 `?s=..&v=..`；刷新 → 同样的 10 题
   - 打完 → summary 显示 emoji 预览；Share 复制的文本含网格和 `?s=..&b=..&v=..`
   - 新标签页打开该链接 → intro 出现挑战横幅（score to beat），开局第一题与原局相同、顺序相同
   - Play again → URL 换新 seed、横幅消失
   - 带 `&v=999` 的链接 → 忽略 seed，正常随机开局

## 说明

- 分享文案英文（站点单语言 EN，i18n 不在本次范围）
- 挑战分数 `b` 是明文的、可作弊，但这是休闲站，dle 类游戏同样如此，不做防伪
- pool 漂移风险由 `QUIZ_VERSION` 兜底：以后 library 大版本变化时 bump 一次即可
