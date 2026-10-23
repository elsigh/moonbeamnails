import { Link } from "@/components/ui/link";

const STARS = [
  { delay: "0s", left: "8%", size: "2px", top: "14%" },
  { delay: "0.8s", left: "18%", size: "1.5px", top: "28%" },
  { delay: "1.4s", left: "27%", size: "2px", top: "12%" },
  { delay: "0.3s", left: "36%", size: "1.5px", top: "22%" },
  { delay: "1.8s", left: "62%", size: "2px", top: "10%" },
  { delay: "0.6s", left: "74%", size: "1.5px", top: "18%" },
  { delay: "1.1s", left: "84%", size: "2.5px", top: "12%" },
  { delay: "2s", left: "91%", size: "1.5px", top: "26%" },
  { delay: "0.4s", left: "12%", size: "1.5px", top: "46%" },
  { delay: "1.6s", left: "70%", size: "2px", top: "42%" },
  { delay: "0.9s", left: "88%", size: "1.5px", top: "58%" },
  { delay: "1.2s", left: "48%", size: "1.5px", top: "8%" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-twilight text-pearl">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(201,182,228,0.45),transparent_42%),radial-gradient(ellipse_at_10%_80%,rgba(90,110,160,0.35),transparent_46%)]"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {STARS.map((star) => (
          <span
            key={`${star.top}-${star.left}`}
            className="absolute rounded-full bg-pearl motion-safe:animate-twinkle"
            style={{
              animationDelay: star.delay,
              height: star.size,
              left: star.left,
              top: star.top,
              width: star.size,
            }}
          />
        ))}
      </div>
      <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-5 py-14 md:grid-cols-[1.15fr_0.85fr] md:py-24 lg:px-10">
        <div className="grid justify-items-center gap-5 text-center md:justify-items-start md:text-left">
          <p className="text-xs font-medium tracking-widest text-silver uppercase">
            Handmade press-ons
          </p>
          <h1 className="font-display text-5xl text-pearl md:text-7xl">Moonbeam Nails</h1>
          <p className="max-w-xl text-base text-pearl/90 md:text-lg">
            Soft lavender, pearl, and moonlight silver, painted in small batches by Opal. Choose a
            set, then the size listed on it, and wear them tonight.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 md:justify-start">
            <Link
              href="/collections/all"
              className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg bg-pearl px-5 text-sm font-medium text-twilight transition-colors hover:bg-white"
            >
              Shop all
            </Link>
            <Link
              href="/#sizing"
              className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border border-pearl/40 px-5 text-sm font-medium text-pearl transition-colors hover:bg-white/10"
            >
              How sizing works
            </Link>
          </div>
        </div>
        <Crescent />
      </div>
    </section>
  );
}

function Crescent() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto aspect-square w-56 sm:w-72 md:w-full md:max-w-md"
    >
      <div className="absolute inset-[12%] rounded-full bg-lavender/40 blur-3xl motion-safe:animate-moon" />
      <svg className="relative size-full" viewBox="0 0 320 320">
        <defs>
          <linearGradient id="moon-face" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#fbf8ff" />
            <stop offset="55%" stopColor="#e7e4f2" />
            <stop offset="100%" stopColor="#d5c6ee" />
          </linearGradient>
        </defs>
        <path
          d="M196 46c-62 8-108 62-108 126 0 64 48 116 112 122-58-14-100-66-100-126C100 104 146 54 196 46Z"
          fill="url(#moon-face)"
        />
        <path
          d="M168 92c8 2 12 10 10 18-6 2-14-2-16-10-2-6 0-10 6-8Z"
          fill="#c9b6e4"
          opacity="0.7"
        />
      </svg>
    </div>
  );
}
