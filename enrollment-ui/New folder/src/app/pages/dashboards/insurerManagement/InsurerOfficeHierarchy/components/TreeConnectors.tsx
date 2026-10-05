interface TreeConnectorsProps {
  level: number;
}

export function TreeConnectors({ level }: Readonly<TreeConnectorsProps>) {
  const connectors: React.ReactNode[] = [];
  
  for (let i = 0; i < level; i++) {
    const isLastLevel = i === level - 1;
    connectors.push(
      <div key={`connector-${i}`} className="relative flex flex-col items-center w-3 min-w-3 sm:w-4 sm:min-w-4">
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-primary/50 dark:bg-primary/40" />
        {isLastLevel && (
          <>
            <div className="absolute left-1/2 top-1/2 w-2.5 h-0.5 -translate-y-1/2 bg-primary/50 dark:bg-primary/40" />
            <div className="absolute left-1/2 top-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/70 dark:bg-primary/60 border-2 border-background shadow-sm" />
          </>
        )}
      </div>
    );
  }

  return <div className="flex items-center gap-0 shrink-0">{connectors}</div>;
}

