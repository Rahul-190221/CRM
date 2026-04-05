import { Bell, Search, ChevronDown, Menu, LogOut } from 'lucide-react'

interface HeaderProps {
  user: {
    name: string
    role: string
  }
  onSearch?: (term: string) => void
  searchTerm?: string
  onLogout: () => void
  onMenuToggle: () => void
}

export default function Header({ user, onSearch, searchTerm, onLogout, onMenuToggle }: HeaderProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <header className="bg-white border-b border-gray-100 px-3 sm:px-6 py-3 shadow-sm sticky top-0 z-30">
      <div className="flex items-center justify-between gap-2 sm:gap-4">

        {/* Hamburger button - mobile only */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>

        {/* Search */}
        <div className="flex-1 min-w-0 max-w-xl">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-primary-600 transition-colors" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm || ''}
              onChange={(e) => onSearch?.(e.target.value)}
              className="w-full pl-9 pr-3 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FACE39]/30 focus:border-[#FACE39]/50 text-sm text-gray-700 placeholder-gray-400 transition-all"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {/* Notifications */}
          <button className="relative p-2 text-gray-500 hover:text-gray-700 transition-all rounded-xl hover:bg-gray-100 border border-transparent hover:border-gray-200">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {/* Vertical Divider - hidden on very small screens */}
          <div className="hidden sm:block h-8 w-px bg-gray-200"></div>

          {/* User Profile */}
          <div className="relative group">
            <div className="flex items-center gap-2 cursor-pointer p-1.5 rounded-xl hover:bg-[#FACE39]/10 transition-all">
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#FACE39] rounded-lg flex items-center justify-center text-black font-extrabold text-sm shadow-sm">
                  {getInitials(user.name)}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-bold text-[#00000F] leading-none mb-1">{user.name}</p>
                <p className="text-[10px] font-bold text-[#00000F]/40 uppercase tracking-widest">{user.role}</p>
              </div>
              <ChevronDown className="hidden sm:block w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>

            {/* Logout Dropdown */}
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-large border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60]">
              <div className="p-2">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 font-bold hover:bg-red-50 rounded-xl transition-all"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
