import Image from "next/image";
import type { ImageAsset } from "@/config/site";

type Props = {
  image: ImageAsset;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** Hide the placeholder label (e.g. very small slots) */
  compactLabel?: boolean;
};

/**
 * Shows the real image when `image.src` is set, otherwise a designed,
 * clearly-labelled placeholder. The parent controls size/aspect ratio.
 */
export default function ImageSlot({
  image,
  sizes = "(min-width: 1024px) 40vw, 100vw",
  priority = false,
  className = "",
  compactLabel = false,
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
        <SceneShape />
      </div>

      {/* corner marks */}
      <Corners />

      {/* bottom fade for legibility */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />

      {!compactLabel && (
        <span className={`dev-tag absolute left-3 bottom-3 max-w-[calc(100%-1.5rem)] overflow-hidden text-ellipsis !bg-black/50 backdrop-blur-sm`}>
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
