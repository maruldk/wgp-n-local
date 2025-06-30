
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Users,
  Filter,
  UserCog,
  Building2,
  LogOut,
  Menu,
  X,
  Bot,
  BarChart3,
  Euro,
  FolderKanban,
  Clock,
  FileText,
  Calculator,
  PieChart,
  Receipt,
  Target,
  Calendar,
  Zap,
  Brain,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  className?: string;
}

const mainNavItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Kunden',
    href: '/customers',
    icon: Users,
  },
  {
    title: 'Leads',
    href: '/leads',
    icon: Filter,
  },
  {
    title: 'KI-Assistent',
    href: '/ai-chat',
    icon: Bot,
  },
  {
    title: 'Event Orchestration',
    href: '/event-orchestration',
    icon: Zap,
  },
  {
    title: 'ML Analytics',
    href: '/ml-analytics',
    icon: Brain,
  },
];

const analyticsNavItems = [
  {
    title: 'Analytics Dashboard',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    title: 'Berichte',
    href: '/analytics/reports',
    icon: FileText,
  },
  {
    title: 'KPI Metriken',
    href: '/analytics/metrics',
    icon: Target,
  },
];

const financeNavItems = [
  {
    title: 'Rechnungen',
    href: '/finance/invoices',
    icon: Receipt,
  },
  {
    title: 'Transaktionen',
    href: '/finance/transactions',
    icon: Euro,
  },
  {
    title: 'Budgets',
    href: '/finance/budgets',
    icon: Calculator,
  },
  {
    title: 'Finanzberichte',
    href: '/finance/reports',
    icon: PieChart,
  },
];

const aiNavItems = [
  {
    title: 'ML Analytics',
    href: '/ml-analytics',
    icon: BarChart3,
  },
  {
    title: 'Self-Learning',
    href: '/self-learning',
    icon: Brain,
  },
  {
    title: 'AI Chat',
    href: '/ai-chat',
    icon: Bot,
  },
  {
    title: 'Event Orchestration',
    href: '/event-orchestration',
    icon: Zap,
  },
];

const projectNavItems = [
  {
    title: 'Projekte',
    href: '/projects',
    icon: FolderKanban,
  },
  {
    title: 'Aufgaben',
    href: '/projects/tasks',
    icon: Calendar,
  },
  {
    title: 'Zeiterfassung',
    href: '/projects/timesheets',
    icon: Clock,
  },
];

const adminNavItems = [
  {
    title: 'Benutzerverwaltung',
    href: '/admin/users',
    icon: UserCog,
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    title: 'Mandantenverwaltung',
    href: '/admin/tenants',
    icon: Building2,
    roles: ['SUPER_ADMIN'],
  },
];

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  const userRole = session?.user?.role;
  const visibleAdminItems = adminNavItems.filter((item) =>
    item.roles.includes(userRole || '')
  );

  return (
    <div
      className={cn(
        'flex h-screen flex-col border-r bg-background transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">WG</span>
            </div>
            <span className="font-semibold text-lg">weGROUP</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
        {/* Main Navigation */}
        <div className="space-y-2">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                  isActive && 'bg-accent text-accent-foreground',
                  isCollapsed && 'justify-center px-2'
                )}
              >
                <Icon className="h-4 w-4" />
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </div>

        {/* Analytics Section */}
        <div className="space-y-2 border-t pt-4">
          {!isCollapsed && (
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              weANALYTICS
            </h3>
          )}
          {analyticsNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                  isActive && 'bg-accent text-accent-foreground',
                  isCollapsed && 'justify-center px-2'
                )}
              >
                <Icon className="h-4 w-4" />
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </div>

        {/* AI Section */}
        <div className="space-y-2 border-t pt-4">
          {!isCollapsed && (
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              weAI Systems
            </h3>
          )}
          {aiNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                  isActive && 'bg-accent text-accent-foreground',
                  isCollapsed && 'justify-center px-2'
                )}
              >
                <Icon className="h-4 w-4" />
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </div>

        {/* Finance Section */}
        <div className="space-y-2 border-t pt-4">
          {!isCollapsed && (
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              weFINANCE
            </h3>
          )}
          {financeNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                  isActive && 'bg-accent text-accent-foreground',
                  isCollapsed && 'justify-center px-2'
                )}
              >
                <Icon className="h-4 w-4" />
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </div>

        {/* Projects Section */}
        <div className="space-y-2 border-t pt-4">
          {!isCollapsed && (
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              wePROJECT
            </h3>
          )}
          {projectNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                  isActive && 'bg-accent text-accent-foreground',
                  isCollapsed && 'justify-center px-2'
                )}
              >
                <Icon className="h-4 w-4" />
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </div>

        {/* Admin Section */}
        {visibleAdminItems.length > 0 && (
          <div className="space-y-2 border-t pt-4">
            {!isCollapsed && (
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Administration
              </h3>
            )}
            {visibleAdminItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                    isActive && 'bg-accent text-accent-foreground',
                    isCollapsed && 'justify-center px-2'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {!isCollapsed && <span>{item.title}</span>}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* User Info & Logout */}
      <div className="border-t p-4">
        {!isCollapsed && session?.user && (
          <div className="mb-4 space-y-1">
            <p className="text-sm font-medium">{session.user.name}</p>
            <p className="text-xs text-muted-foreground">{session.user.email}</p>
            <p className="text-xs text-muted-foreground">{session.user.role}</p>
            {session.user.tenantName && (
              <p className="text-xs text-muted-foreground">
                {session.user.tenantName}
              </p>
            )}
          </div>
        )}
        <Button
          variant="ghost"
          size={isCollapsed ? 'icon' : 'sm'}
          onClick={handleSignOut}
          className={cn('w-full', isCollapsed && 'h-8 w-8')}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">Abmelden</span>}
        </Button>
      </div>
    </div>
  );
}
