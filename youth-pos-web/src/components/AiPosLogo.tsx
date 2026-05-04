import { Waves } from "lucide-react";

export default function AiPosLogo({
  compact = false,
  dark = false,
}: {
  compact?: boolean;
  dark?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-xl shadow-cyan-500/25">
        <div className="absolute inset-0 rounded-2xl bg-cyan-400 blur-md opacity-35" />
        <Waves className="relative z-10" size={24} />
      </div>

      {!compact && (
        <div>
          <h1
            className={`text-xl font-black tracking-[0.18em] ${
              dark ? "text-[#06243a]" : "text-white"
            }`}
          >
            AI POS
          </h1>
          <p className={dark ? "text-xs text-sky-900/55" : "text-xs text-white/55"}>
            Ocean pickup store
          </p>
        </div>
      )}
    </div>
  );
}