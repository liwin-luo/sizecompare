# 部署与上线指引（SizeCompare V2）

> 站点：纯静态 Astro 构建，无后端、无数据库、无上传。
> 产物：`dist/`（40 页 + sitemap）。

## 1. Cloudflare Pages 部署（推荐）

1. 把仓库推到 GitHub：
   ```bash
   git remote add origin <你的仓库地址>
   git push -u origin main
   ```
2. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git。
3. 构建配置：
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node version: 环境变量 `NODE_VERSION=20`
4. 绑定自定义域 `sizecompare.org`（Custom domains → 按提示加 CNAME 到 `<project>.pages.dev`）。

## 2. 上线后立刻做

- [ ] 打开 https://sizecompare.org/robots.txt 确认指向 `https://sizecompare.org/sitemap-index.xml`
- [ ] Google Search Console → 添加资源（Domain 或 URL prefix）→ 提交 `sitemap-index.xml`
- [ ] 手动请求收录：`/`、`/studio/`、`/compare/`、`/animal-size-comparison/` + 5 个重点对比页
- [ ] GA4：创建属性 → 拿到 Measurement ID（G-XXXX）→ 填入 `src/site.config.ts` 的 `ga4Id` → 重新部署
- [ ] Lighthouse 跑分（`npx lighthouse https://sizecompare.org/ --view`），四项目标 ≥ 90

## 3. GA4 事件（代码已埋好，接入即生效）

`tool_start` / `object_added` / `comparison_generated`（含 attr）/ `export_png` / `print_started` / `presentation_started` —— 全部聚合事件，无 PII。

## 4. 28 天验证节奏（对照 docs/product-plan-v2.0.md §7）

| 周 | 看什么 | 决策 |
|---|---|---|
| 1–2 | GSC 收录、抓取错误、CWV | 修技术问题 |
| 3–4 | Query 报告：真实搜索词落在哪些页面 | 决定下一批对比对/主题页 |
| 28 天 | 事件漏斗：tool_start→comparison_generated→export | 决定 P1 优先级 |

## 5. 内容扩展规则（防薄内容）

- 新对比对：只加两边都有实测属性、blurb 手写、数值可核验的组合；跑 `npx vitest run src/data/pairs.test.ts` 确认完整性
- 新对象：每属性必须有 source + context + checked_at；估算必须 uncertainty_note；更新 `docs/objects-data.md` 台账
- ⏳ 待复核项（见台账）在第一次内容审计时补强

## 6. 本地开发

```bash
npm install
npm run dev        # 开发
npm test           # vitest（73 用例）
npm run check      # astro check 类型检查
npm run build      # 产物 dist/
npm run preview    # 本地预览产物
```
