import type { Metadata, Viewport } from "next";
import "./globals.css";
import Shell from "@/components/Shell";
import { loadSnapshot, storageMode } from "@/lib/store";

export const metadata: Metadata = {
  title: "AI UAREAnizer — Zero Touch UAT Orchestrator",
  description:
    "ศูนย์ควบคุมฝูง AI สำหรับทดสอบระบบแบบ Zero Touch: ออกแบบ flow, รันด้วย Playwright/Stagehand, ตรวจ API/ฐานข้อมูล, เปิด Issue, แก้ไข และตรวจซ้ำอัตโนมัติ",
  applicationName: "AI UAREAnizer",
};

export const viewport: Viewport = {
  themeColor: "#04070e",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const snapshot = await loadSnapshot();
  const counts = {
    issues: snapshot.issues.filter((i) => !["closed", "wontfix"].includes(i.status)).length,
    live: snapshot.runs.filter((r) => r.status === "running").length,
    projects: snapshot.projects.filter((p) => p.status === "active").length,
    agents: snapshot.agents.filter((a) => a.status === "active").length,
  };

  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
        />
      </head>
      <body>
        <Shell
          counts={counts}
          storage={storageMode()}
          user={{ name: "สุจิตร · Owner", role: "owner", email: "admin@uarea.in" }}
        >
          {children}
        </Shell>
      </body>
    </html>
  );
}
