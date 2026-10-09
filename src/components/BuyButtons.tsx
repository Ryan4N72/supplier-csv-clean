const base =
  "inline-flex w-full items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold shadow-sm sm:w-auto";

export function BuyButtons() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <a href="/app" className={`${base} bg-indigo-600 text-white hover:bg-indigo-500`}>
        Open the cleaner
      </a>
    </div>
  );
}
