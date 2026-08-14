# LPT留言墙 · 项目记忆

## 视觉风格规范（手账速写 / 奶油纸贴纸风）
落地载体：Next.js App Router 项目里的 `app/globals.css`（用 Tailwind v4 `@theme` 把下方色值/字体/阴影定义为设计 token，再写少量自定义工具类：.card / .tilt-left / .tilt-right / .badge / .btn / .pop）。原根目录 `theme.css` 已在 2026-08-13 初始化 Next.js 时被替换删除。

### 配色
- 页面背景 `#F5F0E8` + 点阵纸纹 radial-gradient `#E4DCCB` 间距 26px
- 卡片背景 `#FAF6EF`
- 主文字/描边墨黑 `#1C1911`；次要文字 `#7A7468`
- 强调色暖橙红 `#E8634A`，仅点睛（按钮/激活态/关键词），不铺大面积
- 辅助点缀：草绿 `#6B9E7A`、湖蓝 `#4A7FA5`、金 `#D4A800`、便签黄 `#FBE8A6`

### 字体
- 英文标题 Google Fonts `Caveat`；中文标题楷体 `"Kaiti SC","STKaiti",serif`
- 正文系统无衬线，行高 1.6

### 形状与质感（硬约束）
- 所有卡片：1.5px 实线描边 `#1C1911` + 圆角 16px
- 阴影只用硬边偏移：`3px 4px 0 rgba(28,25,17,.16)`；重要卡片 `6px 6px 0`
- **禁止**：模糊阴影(blur)、毛玻璃(backdrop-filter)、大面积渐变背景
- 卡片像贴纸轻微倾斜：rotate(-1.2deg~+1.5deg) 交替；hover 回正+轻微上移
- 标签/徽章：便签黄底 + 1.5px 墨线描边 + 硬边投影，胶囊形

### 动效
- hover/过渡 `0.15s ease`
- 入场弹入 scale .7→1.05→1，约 250ms

### 文案
- 界面所有文字简体中文；专有名词(GitHub/Vercel/Supabase 等)保留英文

## 后端 Supabase（2026-08-12 接入）
- **在用的项目（2026-08-14 切换）= xy7-M's Project（Singapore）**：ref `gzbbrqadznnwiuaqgfue`，URL `https://gzbbrqadznnwiuaqgfue.supabase.co`，Region ap-southeast-1（Singapore）
- `.env.local` 已指向该项目；`public.messages` 表 + RLS + 实时已建好
- 旧项目 `ffyhqmfhwdgqclpiybgj`（xy7-M's Project 1，Mumbai ap-south-1）已弃用，数据留在原地不再使用
- 前端用 anon/public（Legacy JWT，role=anon）；**绝不可**把 service_role / `sb_secret_*` 放前端
- 数据表 `messages`：`id bigint generated always as identity primary key`、`content text not null`、`created_at timestamptz default now()`
- 已开 RLS + 两条 public 策略（SELECT USING true / INSERT WITH CHECK true）
- `messages` 已加入 `supabase_realtime` publication（实时推送）
- 注：项目后台显示名是 `xy7-M的项目1`（非 lpt-wall）；Region 创建后不可改

## 技术栈（2026-08-13 起）
- **框架**：Next.js 15（App Router）+ React 19 + TypeScript
- **样式**：Tailwind CSS v4（`@tailwindcss/postcss`），CSS 变量定义在 `app/globals.css`
- **包管理**：npm（`package-lock.json` 已生成）
- **Node**：本机刚装 Node.js LTS（用 `npx create-next-app@latest` 创建）
- **运行**：`npm run dev` → 默认 `http://localhost:3000`（Turbopack）
- **目录结构**：`app/`（路由 + 页面）、`public/`（静态资源）、`next.config.ts`、`postcss.config.mjs`、`eslint.config.mjs`
- **Supabase 客户端**：用 `@supabase/supabase-js@2`（待装），URL + anon key 已存放在 `.workbuddy/memory/MEMORY.md` 上方
- **目标**：把留言墙页面搬进 `app/page.tsx`，套用 globals.css 里的手账贴纸风 token
