import { ArrowLeft, Home } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

type Props = {
  title: string;
  subtitle?: string;
  back?: string | true;
};

export const PageHeader = ({ title, subtitle, back }: Props) => {
  const nav = useNavigate();
  return (
    <header className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {back && (
            <button
              onClick={() => (back === true ? nav(-1) : nav(back))}
              className="grid size-10 place-items-center rounded-full text-foreground/70 transition hover:bg-secondary hover:text-foreground"
              aria-label="Back"
            >
              <ArrowLeft className="size-5" />
            </button>
          )}
          <h1 className="text-grad-title text-3xl font-extrabold tracking-tight md:text-4xl">
            {title}
          </h1>
        </div>
        <Link
          to="/"
          className="grid size-10 place-items-center rounded-full text-foreground/60 transition hover:bg-secondary hover:text-foreground"
          aria-label="Home"
        >
          <Home className="size-5" />
        </Link>
      </div>
      {subtitle && (
        <p className="ml-1 mt-2 text-sm text-muted-foreground md:ml-[52px]">{subtitle}</p>
      )}
    </header>
  );
};