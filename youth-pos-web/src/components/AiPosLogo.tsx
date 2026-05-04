import { Sparkles } from "lucide-react";

export default function AiPosLogo({
  compact = false,
  dark = false,
}: {
  compact?: boolean;
  dark?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d6a84f] text-white shadow-xl shadow-[#d6a84f]/25">
        <div className="absolute inset-0 rounded-2xl bg-[#d6a84f] blur-md opacity-35" />
        <Sparkles className="relative z-10" size={22} />
      </div>

      {!compact && (
        <div>
          <h1
            className={`text-xl font-black tracking-[0.18em] ${
              dark ? "text-[#1f1a14]" : "text-white"
            }`}
          >
            AI POS
          </h1>
          <p className={dark ? "text-xs text-black/45" : "text-xs text-white/45"}>
            Smart pickup store
          </p>
        </div>
      )}
    </div>
  );
}