import type { Metadata } from "next";
import "./globals.css";
import { PrimarySidebar } from "@/components/layout/PrimarySidebar";
import { Drawer } from "@/components/layout/Drawer";
import { ModelSettingsModal } from "@/components/modals/ModelSettingsModal";
import { UserSwitchModal } from "@/components/modals/UserSwitchModal";
import { ModCenterModal } from "@/components/modals/ModCenterModal";
import { SiteAccessGate } from "@/components/layout/SiteAccessGate";

export const metadata: Metadata = {
  title: "幻诺剧场 (Novala) · AI沉浸式角色扮演与心动誓约",
  description: "基于大语言模型驱动的高沉浸互动小说与角色扮演私密剧场，支持自由剧情演化、多分支抉择、心智好感度与角色誓约系统。",
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark" suppressHydrationWarning>
      <head>
        <meta name="darkreader-lock" content="darkreader-lock" />
      </head>
      <body suppressHydrationWarning className="min-h-screen bg-[#0e0f14] text-gray-100 antialiased flex flex-row font-sans selection:bg-pink-500/30 selection:text-pink-200 overflow-x-hidden">
        <SiteAccessGate>
          {/* Leftmost Global Navigation Sidebar */}
          <PrimarySidebar />

          {/* Global Overlays */}
          <Drawer />
          <ModelSettingsModal />
          <UserSwitchModal />
          <ModCenterModal />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
            {children}
          </div>
        </SiteAccessGate>
      </body>
    </html>
  );
}
