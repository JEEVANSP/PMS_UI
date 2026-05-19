import { Download, Printer } from "lucide-react";

type Props = {
  onPrint: () => void;
  onDownload: () => void;
  isPrinting?: boolean;
  isDownloading?: boolean;
};

export function LabelPreviewToolbar({
  onPrint,
  onDownload,
  isPrinting = false,
  isDownloading = false,
}: Props) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onDownload}
        disabled={isPrinting || isDownloading}
        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        type="button"
      >
        <Download size={16} className={isDownloading ? "animate-bounce" : ""} />
        {isDownloading ? "Generating PDF..." : "Download PDF"}
      </button>

      <button
        onClick={onPrint}
        disabled={isPrinting || isDownloading}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        type="button"
      >
        <Printer size={16} />
        {isPrinting ? "Preparing..." : "Print Label"}
      </button>
    </div>
  );
}
