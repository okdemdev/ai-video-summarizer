import Home07Icon from '@/logos/home-07-stroke-rounded';
import Settings02Icon from '@/logos/settings-02-stroke-rounded';
import Image from 'next/image';

import { DashboardItems } from './DashboardItems';
import FilePasteIcon from '@/logos/file-paste-stroke-rounded';

export const navLinks = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home07Icon,
  },
  {
    name: 'History',
    href: '/dashboard/history',
    icon: FilePasteIcon,
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings02Icon,
  },
];

export function Sidebar() {
  return (
    <div className="">
      <Image src="/logo.svg" alt="logo" width={60} height={60} className="m-4" />
      <DashboardItems />
      <div>{/* FOOTER */}</div>
    </div>
  );
}
