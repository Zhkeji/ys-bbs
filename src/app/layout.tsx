import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'YS电竞圈 - 一站式电竞交流交易平台',
  description: 'YS电竞圈 — 英雄联盟/王者荣耀/CS2/原神/Steam 全品类电竞交流社区，开黑组队、攻略分享、游戏代练、装备交易',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      </head>
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  )
}
