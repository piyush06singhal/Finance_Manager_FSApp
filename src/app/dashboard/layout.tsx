import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-beige-100 flex flex-col">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  )
}
