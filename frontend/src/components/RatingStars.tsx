export function RatingStars({
  value,
  onChange,
}: {
  value: number;
  onChange?: (v: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i)}
          className="text-xl"
          aria-label={`Rate ${i}`}
        >
          {i <= value ? "★" : "☆"}
        </button>
      ))}
    </div>
  );
}
