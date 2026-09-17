"use client";

type Props = {
  label: string;
  hint: string;
  fileName: string | null;
  accept?: string;
  onFile: (file: File) => void;
  onClear?: () => void;
};

export function FileDrop({
  label,
  hint,
  fileName,
  accept = ".csv,.xlsx,.xls",
  onFile,
  onClear,
}: Props) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white p-5 transition hover:border-indigo-400 hover:bg-indigo-50/40">
      <div className="text-sm font-semibold text-slate-800">{label}</div>
      <div className="text-xs text-slate-500">{hint}</div>
      <div className="mt-1 flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
        {fileName ? (
          <span className="truncate font-medium text-indigo-700">已选：{fileName}</span>
        ) : (
          <span className="text-slate-500">尚未选择文件</span>
        )}
        {fileName && onClear && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClear();
            }}
            className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 hover:text-slate-900"
          >
            清除
          </button>
        )}
      </div>
      <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-indigo-300 hover:text-indigo-700">
        {fileName ? "重新选择文件" : "选择文件（xlsx / csv）"}
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = "";
          }}
        />
      </label>
    </div>
  );
}
