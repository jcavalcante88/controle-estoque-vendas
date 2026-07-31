'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LayoutDashboard, Package, Boxes, ShoppingCart, BarChart3, LogOut, Key, Menu, X, Settings, Lightbulb } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Visão Geral', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/produtos', label: 'Produtos', icon: Package },
  { href: '/dashboard/estoque', label: 'Estoque', icon: Boxes },
  { href: '/dashboard/vendas', label: 'Vendas', icon: ShoppingCart },
  { href: '/dashboard/relatorios', label: 'Relatórios', icon: BarChart3 },
  { href: '/dashboard/configuracoes', label: 'Configurações', icon: Settings },
  { href: '/onboarding', label: 'Tutorial', icon: Lightbulb, special: true },
];

interface Props { userName: string; trialInfo?: string }

function NavContent({ userName, trialInfo, onClose }: Props & { onClose?: () => void }) {
  const pathname = usePathname();
  return (
    <>
      <div className="px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Key size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">Chaveiro Pro</p>
            <p className="text-xs text-white/40 mt-0.5">Gestão</p>
          </div>
        </div>
      </div>

      {trialInfo && (
        <div className="mx-3 mt-3 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p className="text-xs text-amber-400 font-medium">{trialInfo}</p>
        </div>
      )}

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon, exact, special }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                special
                  ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-300 border border-amber-500/30 hover:from-amber-500/30 hover:to-amber-600/30'
                  : active
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25 shadow-sm'
                  : 'text-white/50 hover:bg-white/5 hover:text-white/80'
              }`}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <p className="px-3 text-xs text-white/30 truncate mb-2">{userName}</p>
        <button
          onClick={() => signOut({ redirectTo: '/login' })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={17} />
          Sair
        </button>
      </div>
    </>
  );
}

export function DashboardSidebar({ userName, trialInfo }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-xl shadow-lg"
      >
        <Menu size={20} className="text-white" />
      </button>

      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setOpen(false)} />
      )}

      {/* Mobile drawer */}
      <aside className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-[#0f0500]/90 backdrop-blur-xl border-r border-white/10 flex flex-col z-50 transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <button onClick={() => setOpen(false)} className="absolute top-3 right-3 p-1.5 hover:bg-white/10 rounded-lg">
          <X size={18} className="text-white/50" />
        </button>
        <NavContent userName={userName} trialInfo={trialInfo} onClose={() => setOpen(false)} />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 bg-black/20 backdrop-blur-xl border-r border-white/10 flex-col min-h-screen sticky top-0 h-screen overflow-y-auto">
        <NavContent userName={userName} trialInfo={trialInfo} />
      </aside>
    </>
  );
}
