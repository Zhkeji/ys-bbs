# YS系统圈论坛

一个功能完整的 Next.js 论坛系统，包含论坛、交易、客服工作台等模块。

## 🚀 技术栈

- **框架**: Next.js 14.2.35 (稳定版)
- **数据库**: PostgreSQL (支持 Supabase/Neon)
- **ORM**: Prisma 5.0.0
- **认证**: JWT (轻量级，无需 NextAuth)
- **样式**: Tailwind CSS 3.4.1
- **图标**: Lucide React

## ✨ 功能特性

### 前台
- ✅ 帖子发布/浏览/评论/点赞/收藏
- ✅ 全站搜索
- ✅ 用户主页/个人设置
- ✅ 通知系统
- ✅ 私信系统
- ✅ 装备交易平台
- ✅ 勋章系统
- ✅ 签到系统
- ✅ 积分商城
- ✅ 响应式设计 (PC + 移动端)

### 管理后台 (/admin)
- ✅ 数据仪表盘
- ✅ 用户管理 (封禁/禁言/设置头衔/角色)
- ✅ 帖子管理 (审核/置顶/精华/删除)
- ✅ 分类管理
- ✅ 举报中心
- ✅ 公告管理
- ✅ 广告位管理
- ✅ 页面管理
- ✅ 勋章管理
- ✅ 商品管理
- ✅ 邀请码管理
- ✅ 操作日志
- ✅ 站点设置

### 超管后台 (/super)
- ✅ 站点配置
- ✅ 管理员管理
- ✅ 系统信息监控
- ✅ 操作日志

### 客服工作台 (/cs)
- ✅ 争议工单处理
- ✅ 实时客服聊天
- ✅ 快捷回复模板

## 📦 部署

### 免费部署方案 (Vercel + Supabase)

1. **创建 Supabase 数据库**
   - 访问 https://supabase.com
   - 创建新项目，选择 Free tier
   - 获取连接字符串

2. **创建 Vercel 项目**
   - 导入 GitHub 仓库
   - 添加环境变量：
     ```
     DATABASE_URL=postgresql://postgres.xxx:password@aws-0-singapore.pooler.supabase.com:6543/postgres
     JWT_SECRET=你的随机密钥
     NEXT_PUBLIC_SITE_NAME=YS系统圈论坛
     NEXT_PUBLIC_SITE_URL=https://你的域名.vercel.app
     ```

3. **初始化数据库**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

## 🔐 默认账号

- **超管**: admin / admin123456
- **邀请码**: WELCOME2024

## 📁 项目结构

```
ys-bbs-main/
├── prisma/
│   ├── schema.prisma    # 数据库模型
│   └── seed.ts          # 初始数据
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── api/         # API 路由
│   │   ├── admin/       # 管理后台
│   │   ├── super/       # 超管后台
│   │   ├── cs/          # 客服工作台
│   │   └── ...
│   ├── components/      # React 组件
│   ├── lib/             # 工具函数
│   ├── styles/          # 样式文件
│   └── types/           # TypeScript 类型
└── public/
    ├── static/          # 静态资源
    └── uploads/         # 用户上传文件
```

## 🔧 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 📄 License

MIT