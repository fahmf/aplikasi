import Link from 'next/link'
import { BookOpen, Users, School, BarChart3, GraduationCap, BookMarked } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/lessons', label: 'Pelajaran', icon: BookOpen },
  { href: '/questions', label: 'Soal', icon: GraduationCap },
  { href: '/users', label: 'Pengguna', icon: Users },
  { href: '/classes', label: 'Kelas', icon: School },
  { href: '/reports', label: 'Laporan', icon: BarChart3 },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Topbar */}
      <header className="bg-white border-b border-gray-200 h-14 flex items-center px-6 gap-4 sticky top-0 z-40">
        <div className="font-extrabold text-emerald-700 text-lg flex items-center gap-2">
          <span>Quizz</span>
          <span className="text-gray-300">·</span>
          <span className="font-cairo text-base font-semibold">لوحة التحكم</span>
        </div>
        <nav className="flex gap-1 ml-4">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors font-medium"
            >
              <item.icon size={15} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/reader"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors font-medium border border-stone-200"
          >
            <BookMarked size={14} />
            Ruang Baca
          </Link>
          <span className="text-xs text-gray-400">Admin</span>
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">A</div>
        </div>
      </header>

      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
