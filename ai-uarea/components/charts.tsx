// Server-safe SVG charts (no chart library, no client JS).

export function TrendChart({
  data,
  height = 190,
}: {
  data: { label: string; runs: number; passed: number; passRate: number }[];
  height?: number;
}) {
  const w = 720;
  const h = height;
  const padB = 26;
  const padT = 12;
  const innerH = h - padB - padT;
  const maxRuns = Math.max(...data.map((d) => d.runs), 4);
  const bw = (w - 24) / data.length;

  const linePts = data.map((d, i) => {
    const x = 12 + i * bw + bw / 2;
    const y = padT + innerH - (d.passRate / 100) * innerH;
    return `${x},${y}`;
  });

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.16" />
          </linearGradient>
          <linearGradient id="barGradPass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {[0, 25, 50, 75, 100].map((g) => {
          const y = padT + innerH - (g / 100) * innerH;
          return (
            <g key={g}>
              <line x1="12" x2={w - 12} y1={y} y2={y} stroke="#142034" strokeDasharray="2 5" strokeWidth="1" />
              <text x="0" y={y + 3} fill="#4a5a78" fontSize="8" fontFamily="monospace">
                {g}
              </text>
            </g>
          );
        })}

        {data.map((d, i) => {
          const x = 12 + i * bw + bw * 0.22;
          const barW = bw * 0.56;
          const totalH = (d.runs / maxRuns) * innerH;
          const passH = d.runs ? (d.passed / d.runs) * totalH : 0;
          const yBase = padT + innerH;
          return (
            <g key={d.label + i}>
              <rect x={x} y={yBase - totalH} width={barW} height={totalH} rx="2" fill="url(#barGrad)" opacity="0.45" />
              <rect x={x} y={yBase - passH} width={barW} height={passH} rx="2" fill="url(#barGradPass)" />
              {i % 2 === 0 && (
                <text x={x + barW / 2} y={h - 8} fill="#4a5a78" fontSize="8.5" textAnchor="middle" fontFamily="monospace">
                  {d.label}
                </text>
              )}
            </g>
          );
        })}

        <polyline
          points={linePts.join(" ")}
          fill="none"
          stroke="#a78bfa"
          strokeWidth="1.4"
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity="0.9"
        />
        {linePts.map((p, i) => {
          const [x, y] = p.split(",").map(Number);
          return <circle key={i} cx={x} cy={y} r="2" fill="#a78bfa" />;
        })}
      </svg>
      <div className="mt-1 flex items-center gap-4 text-[10.5px] text-txt-mute">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-mint" /> รันที่ผ่าน
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-[#22d3ee]/60" /> รันทั้งหมด
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-[2px] w-4 bg-[#a78bfa]" /> อัตราผ่าน (%)
        </span>
      </div>
    </div>
  );
}

export function MiniLine({ data, color = "#22d3ee", width = 62, height = 20 }: { data: number[]; color?: string; width?: number; height?: number }) {
  const pts = data.length ? data : [0, 0];
  const max = Math.max(...pts, 1);
  const step = width / Math.max(pts.length - 1, 1);
  const d = pts
    .map((v, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${(height - (v / max) * (height - 2) - 1).toFixed(1)}`)
    .join(" ");
  return (
    <svg width={width} height={height} className="shrink-0">
      <path d={d} fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.9" />
    </svg>
  );
}

export function HeatStrip({ cells }: { cells: { day: string; runs: number; rate: number }[] }) {
  return (
    <div className="flex items-end gap-[3px]">
      {cells.map((c) => {
        const h = 6 + Math.min(c.runs, 8) * 3;
        const color = c.runs === 0 ? "#182338" : c.rate >= 90 ? "#34d399" : c.rate >= 70 ? "#fbbf24" : "#fb7185";
        return <div key={c.day} title={`${c.day} · ${c.runs} runs · ${c.rate}%`} style={{ height: h, background: color }} className="w-[5px] rounded-[1px]" />;
      })}
    </div>
  );
}
