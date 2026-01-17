type RatingStarsProps = {
  value: number | null;
  onChange?: (v: number | null) => void;
  /** Allow clearing the rating (sets to null) */
  clearable?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
};

export function RatingStars({
  value,
  onChange,
  clearable = false,
  size = "md",
}: RatingStarsProps) {
  const sizeClass = {
    sm: "text-sm",
    md: "text-xl",
    lg: "text-2xl",
  }[size];

  function handleClick(i: number) {
    if (!onChange) return;
    // If clearable and clicking the same value, clear it
    if (clearable && value === i) {
      onChange(null);
    } else {
      onChange(i);
    }
  }

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => handleClick(i)}
          className={`${sizeClass} ${onChange ? "cursor-pointer hover:scale-110" : "cursor-default"} transition`}
          aria-label={`Rate ${i}`}
          disabled={!onChange}
        >
          {value !== null && i <= value ? "★" : "☆"}
        </button>
      ))}
      {clearable && value !== null && onChange && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="ml-2 text-xs text-zinc-400 hover:text-zinc-600"
          aria-label="Clear rating"
        >
          Skip
        </button>
      )}
    </div>
  );
}
