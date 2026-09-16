import type { Metadata } from "next";
import "./globals.css";
import { PrimarySidebar } from "@/components/layout/PrimarySidebar";
import { Drawer } from "@/components/layout/Drawer";
import { ModelSettingsModal } from "@/components/modals/ModelSettingsModal";
import { UserSwitchModal } from "@/components/modals/UserSwitchModal";
import { ModCenterModal } from "@/components/modals/ModCenterModal";

export const metadata: Metadata = {
  title: "NOVAL-GO · AI沉浸式角色扮演风月剧场",
  description: "高质量二次元、都市日常、心理解构与破甲向互动小说平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="min-h-screen bg-[#0e0f14] text-gray-100 antialiased flex flex-row font-sans selection:bg-pink-500/30 selection:text-pink-200 overflow-x-hidden">
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
      </body>
    </html>
  );
}
