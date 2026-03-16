import { Bell, Search, ChevronDown, Menu, Filter, LogOut } from 'lucide-react'
import Image from 'next/image'

interface HeaderProps {
  user: {
    name: string
    role: string
  }
  onSearch?: (term: string) => void
  searchTerm?: string
  onLogout: () => void
}

export default function Header({ user, onSearch, searchTerm, onLogout }: HeaderProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-3 shadow-sm sticky top-0 z-50">
      <div className="flex items-center justify-between">
        {/* Logo */}
      

        {/* Left Side: Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-primary-600 transition-colors" />
            <input
              type="text"
              placeholder="Search for anything..."
              value={searchTerm || ''}
              onChange={(e) => onSearch?.(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FACE39]/30 focus:border-[#FACE39]/50 text-sm text-white placeholder-white/30 transition-all"
            />
          </div>
        </div>

        {/* Right Side: Actions & Profile */}
        <div className="flex items-center gap-4 ml-6">
          {/* Notifications */}
          <button className="relative p-2.5 text-[#00000F]/50 hover:text-white transition-all rounded-xl hover:bg-[#FACE39]/10 border border-transparent hover:border-gray-100">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-danger rounded-full border-2 border-white shadow-sm"></span>
          </button>

          {/* Vertical Divider */}
          <div className="h-8 w-px bg-white/10"></div>

          {/* User Profile */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="flex items-center gap-3 cursor-pointer p-1.5 rounded-xl hover:bg-[#FACE39]/10 transition-all peer">
                <div className="relative">
                  <div className="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center text-black font-extrabold text-sm shadow-sm border border-primary-600/10">
                    {getInitials(user.name)}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success-dark border-2 border-white rounded-full"></div>
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-bold text-[#00000F] leading-none mb-1">{user.name}</p>
                  <p className="text-[10px] font-bold text-[#00000F]/40 uppercase tracking-widest">{user.role}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>

              {/* Simple Logout Dropdown */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-large border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60]">
                <div className="p-2">
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger font-bold hover:bg-danger-light rounded-xl transition-all"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
