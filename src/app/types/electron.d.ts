interface Window {
  electronAPI: {
    setApplicationMenu: (template: any[]) => void;
    onMenuItemClick: (callback: (id: string) => void) => void;
  };
}
