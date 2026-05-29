"use client";

import { Button } from "@/components/ui/button";
import { CupSoda, LogOut, Package, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { editorTouchSm } from "./editorUi";

interface EditorHeaderProps {
  username: string;
  onLogout: () => void;
}

const navItems = [
  {
    href: "/editor",
    label: "Orders",
    shortLabel: "Orders",
    icon: ShoppingCart,
  },
  {
    href: "/editor/drink-orders",
    label: "Drink Orders",
    shortLabel: "Drinks",
    icon: CupSoda,
  },
  {
    href: "/editor/products",
    label: "Products",
    shortLabel: "Stock",
    icon: Package,
  },
];

const EditorHeader: React.FC<EditorHeaderProps> = ({ username, onLogout }) => {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/editor" ? pathname === href : pathname.startsWith(href);

  return (
    <>
      <header className="bg-white shadow-sm border-b sticky top-0 z-40 safe-area-inset-top">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16 gap-2">
            <div className="flex items-center min-w-0 flex-1 gap-2 sm:gap-3">
              <Image
                src="/crown.png"
                alt="King Kebab Supply"
                width={32}
                height={32}
                className="h-8 w-8 sm:h-8 sm:w-8 shrink-0"
              />
              <div className="min-w-0">
                <h1 className="text-sm sm:text-xl font-semibold text-gray-900 truncate leading-tight">
                  Editor
                </h1>
                <p className="text-xs text-gray-500 truncate max-w-[140px] sm:max-w-none">
                  {username}
                </p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${editorTouchSm} ${
                      active
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <Button
              variant="outline"
              onClick={onLogout}
              size="sm"
              className={`${editorTouchSm} shrink-0 px-2.5 sm:px-3`}
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile bottom tab bar — thumb-friendly */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-[env(safe-area-inset-bottom,0px)]"
        aria-label="Editor navigation"
      >
        <div className="grid grid-cols-3 max-w-lg mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 py-2.5 px-1 min-h-[3.25rem] touch-manipulation active:bg-gray-100 transition-colors ${
                  active ? "text-blue-600" : "text-gray-500"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "stroke-[2.5px]" : ""}`} />
                <span
                  className={`text-[10px] font-medium leading-tight ${
                    active ? "text-blue-600" : "text-gray-600"
                  }`}
                >
                  {item.shortLabel}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default EditorHeader;
