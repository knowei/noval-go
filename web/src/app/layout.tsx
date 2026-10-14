import type { Metadata } from "next";
import "./globals.css";
import "@/lib/uuid";
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var pref = localStorage.getItem('noval_theme') || 'system';
                  var eff = 'dark';
                  if (pref === 'light') {
                    eff = 'light';
                  } else if (pref === 'pink') {
                    eff = 'pink';
                  } else if (pref === 'dark') {
                    eff = 'dark';
                  } else {
                    eff = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  var root = document.documentElement;
                  root.classList.remove('dark', 'light', 'pink');
                  root.classList.add(eff);
                  root.setAttribute('data-theme', eff);
                  root.setAttribute('data-theme-pref', pref);
                } catch(e) {}
              })();
            `
          }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-screen bg-[var(--app-bg,#0e0f14)] text-[var(--app-text-main,#f1f5f9)] antialiased flex flex-row font-sans selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden transition-colors duration-200">
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
