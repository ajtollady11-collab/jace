import Image from "next/image";
import type { ImageAsset } from "@/config/site";

type Variant = "portrait" | "group" | "scene";

type Props = {
  image: ImageAsset;
  variant?: Variant;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** Hide the placeholder label (e.g. very small slots) */
  compactLabel?: boolean;
  labelPosition?: "top" | "bottom";
};

/**
 * Shows the real image when `image.src` is set, otherwise a designed,
 * clearly-labelled placeholder. The parent controls size/aspect ratio.
 */
export default function ImageSlot({
  image,
  variant = "portrait",
  sizes = "(min-width: 1024px) 40vw, 100vw",
  priority = false,
  className = "",
  compactLabel = false,
  labelPosition = "bottom",
}: Props) {
  if (image.src) {
    return (
      <div className={`relative overflow-hidden bg-card ${className}`}>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={`${image.placeholderLabel.toLowerCase()} — ${image.alt}`}
      className={`relative overflow-hidden bg-[#131315] ${className}`}
    >
      {/* soft key light */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 70% 0%, rgba(224,197,139,0.10), transparent 55%), radial-gradient(90% 70% at 0% 100%, rgba(255,255,255,0.035), transparent 60%)",
        }}
      />
      <div aria-hidden className="grid-bg absolute inset-0 opacity-60" />

      <div aria-hidden className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.03]">
        {variant === "portrait" && <PortraitShape />}
        {variant === "group" && <GroupShape />}
        {variant === "scene" && <SceneShape />}
      </div>

      {/* corner marks */}
      <Corners />

      {/* bottom fade for legibility */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />

      {!compactLabel && (
        <span className={`dev-tag absolute left-3 ${labelPosition === "top" ? "top-3" : "bottom-3"} max-w-[calc(100%-1.5rem)] overflow-hidden text-ellipsis !bg-black/50 backdrop-blur-sm`}>
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
          <span className="truncate">{image.placeholderLabel}</span>
        </span>
      )}
    </div>
  );
}

function Corners() {
  const c = "absolute h-4 w-4 border-gold/50";
  return (
    <div aria-hidden className="pointer-events-none absolute inset-3">
      <span className={`${c} left-0 top-0 border-l border-t`} />
      <span className={`${c} right-0 top-0 border-r border-t`} />
      <span className={`${c} bottom-0 left-0 border-b border-l opacity-0`} />
      <span className={`${c} bottom-0 right-0 border-b border-r`} />
    </div>
  );
}

function PortraitShape() {
  return (
    <svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
      <defs>
        <linearGradient id="pf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a2a2e" />
          <stop offset="1" stopColor="#18181b" />
        </linearGradient>
        <linearGradient id="rim" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#C8A96B" stopOpacity=".35" />
          <stop offset=".4" stopColor="#C8A96B" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g>
        <ellipse cx="150" cy="168" rx="52" ry="62" fill="url(#pf)" />
        <path d="M128 222 h44 v26 h-44z" fill="#1d1d20" />
        <path d="M40 400 C 44 300, 92 258, 150 254 C 208 258, 256 300, 260 400 Z" fill="url(#pf)" />
        <ellipse cx="150" cy="168" rx="52" ry="62" fill="url(#rim)" />
        <path d="M40 400 C 44 300, 92 258, 150 254 C 208 258, 256 300, 260 400 Z" fill="url(#rim)" />
      </g>
    </svg>
  );
}

function GroupShape() {
  const person = (x: number, y: number, s: number, o: number) => (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      <ellipse cx="0" cy="-150" rx="46" ry="55" fill="url(#gf)" />
      <path d="M-100 0 C -96 -88, -54 -104, 0 -108 C 54 -104, 96 -88, 100 0 Z" fill="url(#gf)" />
      <ellipse cx="0" cy="-150" rx="46" ry="55" fill="url(#grim)" />
      <path d="M-100 0 C -96 -88, -54 -104, 0 -108 C 54 -104, 96 -88, 100 0 Z" fill="url(#grim)" />
    </g>
  );
  return (
    <svg viewBox="0 0 600 600" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
      <defs>
        <linearGradient id="gf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a2a2e" />
          <stop offset="1" stopColor="#161619" />
        </linearGradient>
        <linearGradient id="grim" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#C8A96B" stopOpacity=".28" />
          <stop offset=".45" stopColor="#C8A96B" stopOpacity="0" />
        </linearGradient>
      </defs>
      {person(110, 600, 0.95, 0.55)}
      {person(490, 600, 0.95, 0.55)}
      {person(200, 600, 1.1, 0.8)}
      {person(400, 600, 1.1, 0.8)}
      {person(300, 600, 1.35, 1)}
    </svg>
  );
}

function SceneShape() {
  return (
    <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
      <g fill="none" stroke="#C8A96B" strokeOpacity=".22">
        <circle cx="300" cy="70" r="40" />
        <circle cx="300" cy="70" r="80" strokeOpacity=".12" />
        <circle cx="300" cy="70" r="120" strokeOpacity=".07" />
      </g>
      <path d="M0 200 C 90 180, 160 215, 250 190 S 360 170, 400 185 L 400 260 L 0 260 Z" fill="#1a1a1d" />
    </svg>
  );
}
