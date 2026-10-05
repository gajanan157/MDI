import WorkspaceLayout from '@/app/workspace/WorkspaceLayout';

// Every protected route shares the same operational shell; page logic stays intact.
export function DynamicLayout() { return <WorkspaceLayout />; }