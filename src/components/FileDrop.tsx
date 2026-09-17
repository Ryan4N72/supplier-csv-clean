"use client";

type Props = {
  label: string;
  hint: string;
  fileName: string | null;
  accept?: string;
  onFile: (file: File) => void;
};

export function FileDrop({
  label,
  hint,
  fileName,
  accept = ".csv,.xlsx,.xls",
  onFile,
}: Props) {
  return (
    <label className="flex cursor-pointer flex-col gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white p-5 transition hover:border-indigo-400 hover:bg-indigo-50/40">
      <div className="text-sm font-semibold text-slate-800">{label}</div>
      <div className="text-xs text-slate-500">{hint}</div>
      <div className="mt-1 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
        {fileName ? (
          <span className="font-medium text-indigo-700">已选：{fileName}</span>
        ) : (
          <span>点击或拖拽上传（xlsx / csv）</span>
        )}
      </div>
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
    </label>
  );
}
