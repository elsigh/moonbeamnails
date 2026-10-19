import { cn } from "cn";

interface NailPalette {
  grounds: [string, string, string];
  nails: [string, string, string, string, string];
  sheen: string;
  stars: boolean;
}

interface NailSetArtProps {
  className?: string;
  title: string;
}

const LAVENDER: NailPalette = {
  grounds: ["#f7f2fb", "#e7d8f4", "#f3eef8"],
  nails: ["#d9c4ee", "#e7d4f6", "#cbb6e6", "#efe2f8", "#d4c0ea"],
  sheen: "rgba(255,255,255,0.55)",
  stars: false,
};

const MOONBEAM: NailPalette = {
  grounds: ["#fbf8ff", "#f3ead4", "#e7eef6"],
  nails: ["#f7f1e4", "#f3e7c8", "#fbf6ee", "#efe4c4", "#f6efe2"],
  sheen: "rgba(255,248,230,0.7)",
  stars: false,
};

const OPAL: NailPalette = {
  grounds: ["#f8f4fb", "#e7f3ef", "#f6e4f0"],
  nails: ["#f4dcec", "#dceee8", "#e6d8f6", "#f7e4d8", "#e4eaf6"],
  sheen: "rgba(255,255,255,0.62)",
  stars: false,
};

const STARLIT: NailPalette = {
  grounds: ["#1b2438", "#2a3350", "#3a3158"],
  nails: ["#243044", "#1c2740", "#2c3858", "#201c38", "#2a314c"],
  sheen: "rgba(214,222,238,0.28)",
  stars: true,
};

const NAIL_X = [18, 78, 138, 198, 258];
const NAIL_Y = [78, 58, 46, 58, 78];

function paletteFor(title: string): NailPalette {
  const key = title.toLowerCase();
  if (key.includes("star") || key.includes("night") || key.includes("celestial")) return STARLIT;
  if (key.includes("lavender")) return LAVENDER;
  if (key.includes("opal") || key.includes("shimmer")) return OPAL;
  if (key.includes("moon") || key.includes("glow")) return MOONBEAM;
  const sets = [LAVENDER, MOONBEAM, OPAL, STARLIT];
  const index = [...key].reduce((sum, char) => sum + char.charCodeAt(0), 0) % sets.length;
  return sets[index] ?? MOONBEAM;
}

export function NailSetArt({ className, title }: NailSetArtProps) {
  const palette = paletteFor(title);
  return (
    <div
      aria-hidden="true"
      className={cn("relative size-full overflow-hidden", className)}
      style={{
        backgroundImage: `linear-gradient(160deg, ${palette.grounds[0]}, ${palette.grounds[1]} 48%, ${palette.grounds[2]})`,
      }}
    >
      <svg aria-hidden="true" className="size-full" viewBox="0 0 320 320">
        {palette.stars
          ? [
              [40, 36],
              [96, 28],
              [250, 40],
              [286, 92],
              [24, 150],
              [300, 180],
            ].map(([cx, cy]) => (
              <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.4" fill="#f4f0f8" opacity="0.8" />
            ))
          : null}
        {palette.nails.map((fill, index) => (
          <g
            key={`${fill}-${NAIL_X[index]}`}
            transform={`translate(${NAIL_X[index]} ${NAIL_Y[index]})`}
          >
            <path
              d="M22 4c12 0 20 16 20 40 0 42-5 86-9 104-3 12-7 18-11 18s-8-6-11-18c-4-18-9-62-9-104C2 20 10 4 22 4Z"
              fill={fill}
            />
            <path
              d="M14 22c3-8 10-12 16-8"
              fill="none"
              stroke={palette.sheen}
              strokeLinecap="round"
              strokeWidth="2.5"
            />
            {palette.stars ? (
              <circle cx="22" cy="78" r="1.6" fill="#f6f3f8" />
            ) : (
              <path
                d="M27 86a6 6 0 1 0 0 10 5 5 0 1 1 0-10Z"
                fill={palette.grounds[2]}
                opacity="0.55"
              />
            )}
          </g>
        ))}
      </svg>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -inset-y-10 -left-1/3 w-1/2 rotate-12 bg-white/30 blur-md motion-safe:animate-sheen" />
      </div>
    </div>
  );
}
