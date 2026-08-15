import { X } from "lucide-react";

interface ElementsPanelProps {
  elements: number[];
  onDelete?: (value: number) => void;
}

export default function ElementsPanel({ elements, onDelete }: ElementsPanelProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col p-3">
      <div className="mb-2.5 flex items-center justify-between">
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-ink">
          Elements {elements.length > 0 && `(${elements.length})`}
        </h3>
      </div>

      {elements.length === 0 ? (
        <p className="text-center font-mono text-xs text-ink-faint py-4">
          No elements in tree
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-64 pr-1">
          {elements.map((value) => (
            <div
              key={value}
              className="group flex items-center justify-between rounded-md border border-hairline bg-panel-raised py-2 px-2.5 font-mono text-xs text-ink shadow-xs transition-colors"
            >
              <span className="font-medium">{value}</span>

              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(value)}
                  className="ml-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-node-red/20 hover:text-node-red cursor-pointer"
                  aria-label={`Delete element ${value}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}