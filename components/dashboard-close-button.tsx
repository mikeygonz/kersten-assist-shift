import { memo } from 'react';
import { Button } from './ui/button';
import { INITIAL_DASHBOARD, useDashboard } from '@/hooks/use-dashboard';
import { XIcon } from 'lucide-react';

function PureDashboardCloseButton() {
  const { setDashboard } = useDashboard();

  return (
    <Button
      data-testid="artifact-close-button"
      variant="ghost"
      className="h-8 w-8 p-0 text-[#999] hover:text-[#666] hover:bg-gray-50"
      onClick={() => {
        setDashboard((currentDashboard) =>
          currentDashboard.status === 'streaming'
            ? {
                ...currentDashboard,
                isVisible: false,
              }
            : { ...INITIAL_DASHBOARD, status: 'idle' },
        );
      }}
    >
      <XIcon className="h-4 w-4" />
    </Button>
  );
}

export const DashboardCloseButton = memo(PureDashboardCloseButton, () => true);
