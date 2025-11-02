import { memo } from 'react';

const MAX_STARS = 6;

const StarIcon = ({ filled }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={`${filled ? 'text-yellow-400' : 'text-gray-600 dark:text-gray-500'} h-5 w-5`}
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

function StarSelector({
  label,
  value = 0,
  max = MAX_STARS,
  onChange,
  disabled = false,
  helperText,
  className = ''
}) {
  const stars = Array.from({ length: max }, (_, index) => index + 1);

  const handleSelect = (star) => {
    if (disabled) return;
    if (star === value) {
      onChange?.(0);
    } else {
      onChange?.(star);
    }
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {label ? (
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{label}</p>
      ) : null}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {stars.map((star) => {
            const filled = star <= value;
            return (
              <button
                key={star}
                type="button"
                onClick={() => handleSelect(star)}
                disabled={disabled}
                className={`rounded-full p-1 transition-transform duration-150 ${
                  disabled ? 'cursor-not-allowed opacity-60' : 'hover:-translate-y-0.5 hover:scale-110'
                }`}
                aria-label={label ? `${label} ${star}` : `Set to ${star}`}
              >
                <StarIcon filled={filled} />
              </button>
            );
          })}
        </div>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{value}/{max}</span>
      </div>
      {helperText ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
}

export default memo(StarSelector);
