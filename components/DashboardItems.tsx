'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navLinks } from './Sidebar';

export function DashboardItems() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-2 mx-4 my-16">
      {navLinks.map((item) => (
        <Link href={item.href} key={item.name} className="flex items-center gap-2 ">
          <div
            className={`${
              pathname === item.href ? 'bg-[#323232] border border-[#535353]' : ''
            } p-2 rounded-lg cursor-pointer flex items-center gap-2 w-full`}
          >
            <item.icon
              className={`${pathname === item.href ? 'text-[#ffffe3]' : 'text-[#ffffe3]/50'}`}
            />
            <p
              className={`${
                pathname === item.href
                  ? 'text-[#ffffe3] font-bold tracking-wide'
                  : 'text-[#ffffe3]/50 font-bold tracking-wide'
              }`}
            >
              {item.name}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
