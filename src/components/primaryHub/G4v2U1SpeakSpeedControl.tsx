import {
  G4V2_U1_SPEAK_SPEED_LEVELS,
  type G4v2U1SpeakSpeed,
} from "@/lib/primaryHub/g4v2U1SpeakSpeed";

type Props = {
  speed: G4v2U1SpeakSpeed;
  onChange: (speed: G4v2U1SpeakSpeed) => void;
  className?: string;
};

export default function G4v2U1SpeakSpeedControl({ speed, onChange, className = "" }: Props) {
  return (
    <div
      className={`flex flex-wrap items-center gap-2 rounded-xl border border-[#EEEAE0] bg-[#FFF8F0] px-3 py-2 ${className}`}
      role="group"
      aria-label="朗读速度"
    >
      <span className="text-xs font-medium text-[#888780]">朗读速度</span>
      {G4V2_U1_SPEAK_SPEED_LEVELS.map((level) => {
        const active = speed === level.value;
        return (
          <button
            key={level.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(level.value)}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
              active
                ? "bg-[#378ADD] text-white shadow-sm"
                : "bg-white text-[#185FA5] hover:bg-[#E6F1FB]"
            }`}
          >
            {level.label}
          </button>
        );
      })}
    </div>
  );
}
