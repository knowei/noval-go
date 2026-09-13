import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Drawer } from "@/components/layout/Drawer";
import { ModelSettingsModal } from "@/components/modals/ModelSettingsModal";
import { UserSwitchModal } from "@/components/modals/UserSwitchModal";

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
      <body className="min-h-screen bg-[#0e0f14] text-gray-100 antialiased flex flex-col font-sans selection:bg-pink-500/30 selection:text-pink-200">
        <Navbar />
        <Drawer />
        <ModelSettingsModal />
        <UserSwitchModal />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
