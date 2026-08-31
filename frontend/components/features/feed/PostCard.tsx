import { Ellipsis } from "lucide-react";

export function PostCard() {
  return (
    <div className="flex flex-col align-start self-stretch border-2 border-(--bg-input) rounded-lg">
      <div className="flex px-5 pt-2 flex-col items-start self-stretch">
        <header className="flex items-center gap-3 self-stretch">
          <div className="grid w-10 h-10 rounded-full bg-purple-800"></div>
          <div className="flex flex-col items-start w-56">
            <span className="text-sm font-pixel font-semibold">Andres</span>
            <span className="text-xs text-(--text-secondary)">
              Yesterday at 10:48 am
            </span>
          </div>
          <button className="p-2 items-center justify-center">
            <Ellipsis className="text-4xl font-pixel text-(--text-muted)" />
          </button>
        </header>
      </div>
    </div>
  );
}
