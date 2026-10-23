const BLOSSOM_PETAL =
  "M0 0.05C0.42-0.35 0.62-1.55 0.48-2.55C0.28-3.05 0.12-2.85 0-3.45C-0.12-2.85-0.28-3.05-0.48-2.55C-0.62-1.55-0.42-0.35 0 0.05Z";

const PETAL_TURNS = ["0", "72", "144", "216", "288"];

export function Blossom() {
  return (
    <g>
      {PETAL_TURNS.map((angle) => (
        <path
          key={angle}
          d={BLOSSOM_PETAL}
          fill="#f3b7c9"
          transform={`rotate(${angle}) scale(1.05)`}
        />
      ))}
      <circle cx="0" cy="0" fill="#fff0f5" r="0.55" />
    </g>
  );
}
