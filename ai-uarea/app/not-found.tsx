import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="card max-w-md p-8 text-center">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl border border-line bg-[#0f1a2c] text-cyan-glow">
          <Compass size={20} />
        </div>
        <h1 className="text-[18px] font-semibold">ไม่พบหน้าที่ต้องการ</h1>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-txt-mute">
          หน้านี้อาจถูกย้ายหรือถูกลบ — กลับไปที่ศูนย์ควบคุมเพื่อดูสถานะฝูง AI
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Link href="/" className="btn btn-primary btn-sm">
            ไปที่ศูนย์ควบคุม
          </Link>
          <Link href="/runs" className="btn btn-sm">
            ดูผลการทดสอบ
          </Link>
        </div>
      </div>
    </div>
  );
}
