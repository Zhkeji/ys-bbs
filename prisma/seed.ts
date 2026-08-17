import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // 创建超级管理员
  const superAdminPassword = await bcrypt.hash('admin123456', 12)
  const superAdmin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@ys-forum.com',
      password: superAdminPassword,
      nickname: 'YS超管',
      role: 'SUPERADMIN',
      title: '站长',
      points: 99999,
      level: 99,
    },
  })
  console.log('✅ Super admin created:', superAdmin.username)

  // 创建默认分类
  const categories = [
    { name: '英雄联盟', slug: 'lol', description: 'LOL开黑/攻略/赛事讨论', icon: 'fas fa-shield-alt', color: '#c89b3c', sortOrder: 1 },
    { name: '王者荣耀', slug: 'honor-of-kings', description: '王者荣耀开黑/攻略/赛事', icon: 'fas fa-crown', color: '#e6a817', sortOrder: 2 },
    { name: 'CS2 / VALORANT', slug: 'fps', description: 'FPS类游戏交流/枪法教学', icon: 'fas fa-crosshairs', color: '#ff4655', sortOrder: 3 },
    { name: '永劫无间', slug: 'naraka', description: '永劫无间攻略/组队', icon: 'fas fa-fan', color: '#d4a017', sortOrder: 4 },
    { name: '原神 / 崩坏星穹铁道', slug: 'mihoyo', description: '米哈游游戏讨论/攻略', icon: 'fas fa-star', color: '#4a90e2', sortOrder: 5 },
    { name: 'Steam / 单机游戏', slug: 'steam', description: 'Steam游戏推荐/评测/史低', icon: 'fab fa-steam', color: '#1b2838', sortOrder: 6 },
    { name: '手游专区', slug: 'mobile', description: '手游推荐/攻略', icon: 'fas fa-mobile-alt', color: '#22c55e', sortOrder: 7 },
    { name: '电竞赛事', slug: 'esports', description: 'LPL/KPL/国际赛事讨论', icon: 'fas fa-trophy', color: '#FFD700', sortOrder: 8 },
    { name: '游戏硬件', slug: 'hardware', description: '外设/显示器/配置推荐', icon: 'fas fa-keyboard', color: '#8b5cf6', sortOrder: 9 },
    { name: '代练/陪玩', slug: 'boosting', description: '代练陪玩发布/接单', icon: 'fas fa-gamepad', color: '#FF6B35', sortOrder: 10 },
    { name: '游戏交易', slug: 'trading', description: '账号/装备/皮肤交易', icon: 'fas fa-exchange-alt', color: '#06b6d4', sortOrder: 11 },
    { name: '闲聊灌水', slug: 'chat', description: '日常闲聊/沙雕图', icon: 'fas fa-coffee', color: '#78716c', sortOrder: 12 },
    { name: '站务管理', slug: 'admin', description: '论坛公告/反馈/建议', icon: 'fas fa-bullhorn', color: '#ef4444', sortOrder: 13 },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }
  console.log('✅ Categories created')

  // 创建默认设置
  const settings = [
    { key: 'site_name', value: 'YS电竞圈', group: 'site', label: '站点名称' },
    { key: 'site_description', value: 'YS电竞圈 - 一站式电竞交流、游戏代练、装备交易平台', group: 'site', label: '站点描述' },
    { key: 'site_url', value: 'http://localhost:3000', group: 'site', label: '站点URL' },
    { key: 'welcome_title', value: '欢迎来到YS电竞圈！', group: 'site', label: '欢迎标题' },
    { key: 'welcome_message', value: 'YS电竞圈 — 英雄联盟/王者荣耀/CS2/原神/Steam 全品类电竞交流社区。开黑组队、攻略分享、游戏代练、装备交易，这里全都有！', group: 'site', label: '欢迎消息' },
    { key: 'theme_primary_color', value: '#5E50CE', group: 'theme', label: '主题色' },
    { key: 'theme_secondary_color', value: '#e6e4f7', group: 'theme', label: '副题色' },
    { key: 'registration_enabled', value: 'true', group: 'security', label: '开放注册' },
    { key: 'invite_only', value: 'false', group: 'security', label: '邀请制' },
    { key: 'auto_approve', value: 'true', group: 'content', label: '自动审核' },
    { key: 'maintenance_mode', value: 'false', group: 'site', label: '维护模式' },
    { key: 'qq_group', value: '146732405', group: 'site', label: 'QQ群' },
    { key: 'logo_text', value: 'YS', group: 'brand', label: 'Logo文字' },
    { key: 'logo_subtitle', value: '系统圈论坛', group: 'brand', label: 'Logo副标题' },
  ]

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
  }
  console.log('✅ Settings created')

  // 创建默认页面
  const pages = [
    {
      title: '社区公约',
      slug: 'rules',
      content: `# YS系统圈论坛社区公约

## 总则
本公约是YS系统圈论坛用户行为准则，请所有用户遵守。

## 用户行为规范
1. 尊重他人，禁止人身攻击、辱骂、歧视等行为
2. 禁止发布违法违规内容
3. 禁止发布广告、垃圾信息
4. 禁止恶意刷帖、灌水
5. 尊重知识产权，转载请注明出处

## 内容规范
1. 帖子内容应与所在板块主题相关
2. 禁止发布色情、暴力、恐怖等不良内容
3. 禁止发布涉及政治敏感的内容
4. 禁止发布虚假信息

## 处罚措施
违反以上规定者，视情节轻重给予警告、禁言、封号等处罚。

## 免责声明
YS系统圈论坛不对用户发布的内容承担法律责任。`,
    },
    {
      title: '隐私政策',
      slug: 'privacy',
      content: `# YS系统圈论坛隐私政策

## 信息收集
我们收集您在注册和使用服务时提供的个人信息，包括但不限于用户名、邮箱地址等。

## 信息使用
我们使用收集的信息来提供、维护和改进我们的服务，以及保护用户安全。

## 信息保护
我们采取合理的安全措施来保护您的个人信息不被未经授权的访问、使用或泄露。

## Cookie使用
本站使用Cookie来改善您的使用体验。`,
    },
  ]

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    })
  }
  console.log('✅ Pages created')

  // 创建默认勋章
  const badges = [
    { name: '新手上路', description: '完成注册', icon: '🐣', color: '#22c55e' },
    { name: '活跃达人', description: '发帖超过50篇', icon: '🔥', color: '#FF6B35' },
    { name: '知识渊博', description: '获得100个点赞', icon: '📚', color: '#5E50CE' },
    { name: '签到达人', description: '连续签到30天', icon: '📅', color: '#f59e0b' },
    { name: '问题解决者', description: '10个帖子被标记为已解决', icon: '✅', color: '#06b6d4' },
    { name: '社区贡献者', description: '举报被采纳10次', icon: '🛡️', color: '#8b5cf6' },
  ]

  for (const badge of badges) {
    const exists = await prisma.badge.findFirst({ where: { name: badge.name } })
    if (!exists) {
      await prisma.badge.create({ data: badge })
    }
  }
  console.log('✅ Badges created')

  // 创建默认邀请码
  const inviteCode = await prisma.inviteCode.findFirst({ where: { code: 'WELCOME2024' } })
  if (!inviteCode) {
    await prisma.inviteCode.create({
      data: {
        code: 'WELCOME2024',
        maxUses: 100,
        creatorId: superAdmin.id,
      },
    })
  }
  console.log('✅ Default invite code created: WELCOME2024')

  console.log('🎉 Seed completed!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
