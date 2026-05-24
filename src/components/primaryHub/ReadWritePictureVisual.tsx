import {
  BookOpen,
  Library,
  Palette,
  School,
  UserRound,
} from "lucide-react";
import type { ReadWritePictureVisual } from "@/lib/primaryHub/readWriteTypes";

type Props = {
  visual: ReadWritePictureVisual;
  alt: string;
};

function VisualFrame({ alt, children }: { alt: string; children: React.ReactNode }) {
  return (
    <div
      aria-label={alt}
      className="overflow-hidden rounded-2xl border border-[#EEEAE0] bg-[#FFF8F0] px-4 py-6"
    >
      {children}
    </div>
  );
}

function PlaceBooksVisual() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-end gap-2 rounded-xl border-2 border-[#C4A882] bg-[#E8D5B5] px-6 py-4">
        <Library className="h-10 w-10 text-[#8B6914]" strokeWidth={1.75} />
        <BookOpen className="h-8 w-8 text-[#378ADD]" strokeWidth={1.75} />
        <BookOpen className="h-9 w-9 -rotate-6 text-[#FF6B35]" strokeWidth={1.75} />
        <BookOpen className="h-8 w-8 rotate-6 text-[#6FA92A]" strokeWidth={1.75} />
      </div>
      <p className="text-sm font-semibold text-[#2C2C2A]">📚 Books</p>
    </div>
  );
}

function PlacePlaygroundVisual() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex h-28 w-44 items-center justify-center">
        <div className="absolute inset-0 rounded-[50%] border-4 border-dashed border-[#6FA92A] bg-[#EAF3DE]/60" />
        <svg viewBox="0 0 64 64" className="relative h-14 w-14" aria-hidden="true">
          <circle cx="32" cy="32" r="28" fill="#fff" stroke="#2C2C2A" strokeWidth="2" />
          <path
            d="M32 8 L32 56 M8 32 L56 32 M14 14 L50 50 M50 14 L14 50"
            stroke="#2C2C2A"
            strokeWidth="1.5"
            fill="none"
          />
          <polygon
            points="32,18 36,28 46,28 38,34 41,44 32,38 23,44 26,34 18,28 28,28"
            fill="#FF6B35"
          />
        </svg>
      </div>
      <p className="text-sm font-semibold text-[#2C2C2A]">⚽ Football · Track</p>
    </div>
  );
}

function FloorBuildingVisual() {
  return (
    <div className="mx-auto flex w-full max-w-xs flex-col overflow-hidden rounded-xl border-2 border-[#C4A882]">
      <div className="flex items-center justify-between border-b-2 border-[#C4A882] bg-[#E6F1FB] px-4 py-3">
        <span className="rounded-md bg-[#378ADD] px-2 py-0.5 text-xs font-bold text-white">2F</span>
        <div className="flex items-center gap-2">
          <Library className="h-6 w-6 text-[#378ADD]" strokeWidth={1.75} />
          <span className="text-sm font-semibold text-[#2C2C2A]">Library</span>
        </div>
      </div>
      <div className="flex items-center justify-between bg-[#FFF8F0] px-4 py-3">
        <span className="rounded-md bg-[#FF6B35] px-2 py-0.5 text-xs font-bold text-white">1F</span>
        <div className="flex items-center gap-2">
          <School className="h-6 w-6 text-[#FF6B35]" strokeWidth={1.75} />
          <span className="text-sm font-semibold text-[#2C2C2A]">Classroom</span>
        </div>
      </div>
    </div>
  );
}

function RoomRowVisual() {
  const rooms = [
    { label: "Library", icon: Library, highlight: false },
    { label: "Teachers' Office", icon: School, highlight: true },
    { label: "Art Room", icon: Palette, highlight: false },
  ] as const;

  return (
    <div className="grid grid-cols-3 gap-2">
      {rooms.map(({ label, icon: Icon, highlight }) => (
        <div
          key={label}
          className={`flex flex-col items-center gap-2 rounded-xl border-2 px-2 py-3 text-center ${
            highlight
              ? "border-[#FF6B35] bg-[#FFF0EB] shadow-sm ring-2 ring-[#FF6B35]/30"
              : "border-[#EEEAE0] bg-white"
          }`}
        >
          <Icon
            className={`h-7 w-7 ${highlight ? "text-[#FF6B35]" : "text-[#888780]"}`}
            strokeWidth={1.75}
          />
          <span
            className={`text-[11px] font-semibold leading-tight sm:text-xs ${
              highlight ? "text-[#FF6B35]" : "text-[#2C2C2A]"
            }`}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

function StudentCountVisual() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <UserRound
            key={i}
            className="h-10 w-10 text-[#378ADD]"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        ))}
        <span className="text-2xl font-bold text-[#888780]">···</span>
      </div>
      <div className="rounded-2xl border-2 border-[#378ADD] bg-[#E6F1FB] px-8 py-3">
        <span className="text-4xl font-black tabular-nums text-[#378ADD]">40</span>
      </div>
      <p className="text-xs text-[#888780]">many students in this class</p>
    </div>
  );
}

export default function ReadWritePictureVisual({ visual, alt }: Props) {
  const body = (() => {
    switch (visual) {
      case "place_books":
        return <PlaceBooksVisual />;
      case "place_playground":
        return <PlacePlaygroundVisual />;
      case "floor_building":
        return <FloorBuildingVisual />;
      case "room_row":
        return <RoomRowVisual />;
      case "student_count":
        return <StudentCountVisual />;
    }
  })();

  return <VisualFrame alt={alt}>{body}</VisualFrame>;
}
