import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import LiquidGlass from '@/components/ui/LiquidGlass'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col relative">
      <LiquidGlass />
      <div className="relative z-10">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  )
}
