import { ChevronRight, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { LEVELS } from "@/data/course";
import { PageHeader } from "@/components/PageHeader";

const Index = () => {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-10 md:px-8 md:py-14">
      <PageHeader title="选择学习级别" subtitle="选择适合你的级别，开始学习之旅" />

      <section className="grid gap-5 md:grid-cols-2 md:gap-6">
        {LEVELS.map((lv) => (
          <Link
            key={lv.id}
            to={`/level/${lv.id}`}
            className={`group relative flex items-center justify-between overflow-hidden rounded-2xl ${lv.gradient} px-6 py-7 text-white shadow-tile transition-transform hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-12px_hsl(250_50%_30%/0.45)]`}
          >
            {/* Decorative bubbles */}
            <span className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-white/15 blur-xl" />
            <span className="pointer-events-none absolute -bottom-16 right-20 size-28 rounded-full bg-white/10 blur-lg" />

            <div className="relative flex items-center gap-5">
              <div className="grid size-14 place-items-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <GraduationCap className="size-7" />
              </div>
              <div>
                <div className="text-xl font-extrabold tracking-wider md:text-2xl">{lv.name}</div>
                <div className="mt-1 text-sm font-medium opacity-90">{lv.unitsCount} 单元</div>
              </div>
            </div>

            <ChevronRight className="relative size-6 opacity-80 transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
      </section>
    </main>
  );
};

export default Index;
