import { Plus, Trash2 } from "lucide-react";

interface DynamicArrayProps {
  value: string[];
  onChange: (newValue: string[]) => void;
  placeholder?: string;
  label: string;
}

export function DynamicArray({ value = [], onChange, placeholder = "Add new...", label }: DynamicArrayProps) {
  const handleAdd = () => {
    onChange([...value, ""]);
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, text: string) => {
    const updated = [...value];
    updated[index] = text;
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">{label}</label>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-400 font-semibold cursor-pointer"
        >
          <Plus size={14} /> Add Item
        </button>
      </div>

      {value.length === 0 ? (
        <p className="text-xs text-zinc-500 italic">No entries yet. Click "Add Item" to add.</p>
      ) : (
        <div className="space-y-2">
          {value.map((item, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <input
                type="text"
                value={item}
                onChange={(e) => handleChange(idx, e.target.value)}
                placeholder={placeholder}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-200 outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="text-zinc-500 hover:text-red-400 p-2 rounded-lg hover:bg-zinc-800/50 transition cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
