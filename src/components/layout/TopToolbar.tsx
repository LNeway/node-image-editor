export default function TopToolbar() {
  return (
    <div className="h-12 bg-bg-secondary border-b border-border-color flex items-center px-4 gap-4">
      <div className="font-semibold text-lg">Node Image Editor</div>
      <div className="flex-1" />
      <button className="px-3 py-1 bg-bg-tertiary rounded text-sm hover:bg-opacity-80">
        New
      </button>
      <button className="px-3 py-1 bg-bg-tertiary rounded text-sm hover:bg-opacity-80">
        Open
      </button>
      <button className="px-3 py-1 bg-bg-tertiary rounded text-sm hover:bg-opacity-80">
        Save
      </button>
    </div>
  );
}
