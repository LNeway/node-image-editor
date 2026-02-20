import TopToolbar from './TopToolbar';

export default function AppLayout() {
  return (
    <div className="h-screen w-screen flex flex-col bg-bg-primary text-text-primary">
      <TopToolbar />
      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 bg-bg-secondary border-r border-border-color p-4">
          <div className="text-lg font-semibold mb-4">Node Library</div>
          <div className="text-sm text-text-secondary">
            Node library panel will be implemented in Phase 4
          </div>
        </div>
        <div className="flex-1 relative">
          <div className="absolute inset-0 flex items-center justify-center text-text-secondary">
            Canvas will be implemented in Phase 4
          </div>
        </div>
        <div className="w-72 bg-bg-secondary border-l border-border-color p-4">
          <div className="text-lg font-semibold mb-4">Properties</div>
          <div className="text-sm text-text-secondary">
            Properties panel will be implemented in Phase 4
          </div>
        </div>
      </div>
      <div className="h-8 bg-bg-secondary border-t border-border-color flex items-center px-4 text-sm text-text-secondary">
        Status Bar
      </div>
    </div>
  );
}
