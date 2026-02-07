export default function Checkmark() {
  return (
    <svg
      className="w-14 h-14 rounded-full block stroke-[3] stroke-brand-white stroke-[round] shadow-[inset_0px_0px_0px_var(--color-secondary)] animate-[checkmark-fill_0.4s_ease-in-out_1s_forwards,checkmark-scale_0.3s_ease-in-out_1.5s_both]"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 52 52"
      style={{ strokeMiterlimit: 10 }}
    >
      <circle
        className="stroke-secondary fill-none animate-[checkmark-stroke_0.6s_cubic-bezier(0.65,0,0.45,1)_0.6s_forwards]"
        style={{
          strokeDasharray: 166,
          strokeDashoffset: 166,
          strokeWidth: 2,
          strokeMiterlimit: 10,
        }}
        cx="26"
        cy="26"
        r="25"
      />
      <path
        className="fill-none animate-[checkmark-stroke_0.3s_cubic-bezier(0.65,0,0.45,1)_1.4s_forwards]"
        style={{
          transformOrigin: '50% 50%',
          strokeDasharray: 48,
          strokeDashoffset: 48,
        }}
        d="M14.1 27.2l7.1 7.2 16.7-16.8"
      />
    </svg>
  );
}
