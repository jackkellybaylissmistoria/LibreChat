import { useLocation } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { Button, Sidebar, TooltipAnchor } from '@librechat/client';
import { usePromptGroupsContext } from '~/Providers';
import { useLocalize } from '~/hooks';
import PanelNavigation from './PanelNavigation';
import List from '../lists/List';
import { cn } from '~/utils';

export default function GroupSidePanel({
  children,
  className = '',
  closePanelRef,
  onClose,
  isChatRoute: isChatRouteProp,
}: {
  children?: React.ReactNode;
  className?: string;
  closePanelRef?: React.RefObject<HTMLButtonElement>;
  onClose?: () => void;
  isChatRoute?: boolean;
}) {
  const location = useLocation();
  const localize = useLocalize();
  const isChatRoute = isChatRouteProp ?? location.pathname?.startsWith('/c/') ?? false;

  const context = usePromptGroupsContext();
  if (!context) {
    return null;
  }
  const { promptGroups, groupsQuery, nextPage, prevPage, hasNextPage, hasPreviousPage } = context;

  return (
    <div
      id="prompts-panel"
      className={cn(
        'relative flex h-full w-full flex-col bg-surface-primary/85 backdrop-blur-md',
        'border-r border-border-light/50 dark:border-border-medium/40',
        className,
      )}
    >
      {/* Header band */}
      <div className="relative flex shrink-0 items-center gap-2 border-b border-border-light/50 px-3 py-2.5 dark:border-border-medium/40">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-primary/[0.04] to-transparent dark:from-primary/[0.06]"
        />
        <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-border-light/70 bg-surface-tertiary/40 text-primary dark:border-border-medium/55">
          <FileText className="size-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-sm font-semibold tracking-tight text-text-primary">
            {localize('com_ui_prompts')}
          </h2>
          <p className="truncate text-[11px] text-text-tertiary">
            {localize('com_ui_create_prompt_page')}
          </p>
        </div>
        {onClose && (
          <TooltipAnchor
            description={localize('com_nav_close_sidebar')}
            render={
              <Button
                ref={closePanelRef}
                size="icon"
                variant="ghost"
                data-testid="close-prompts-panel-button"
                aria-label={localize('com_nav_close_sidebar')}
                aria-expanded={true}
                className="h-8 w-8 rounded-lg text-text-tertiary transition-colors duration-150 hover:bg-surface-tertiary/60 hover:text-text-primary"
                onClick={onClose}
              >
                <Sidebar className="size-4" />
              </Button>
            }
          />
        )}
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="scrollbar-gutter-stable flex h-full min-h-0 flex-col gap-2 overflow-y-auto overflow-x-hidden px-3 pb-2 pt-3 text-text-primary">
          <div className="shrink-0 space-y-2">{children}</div>
          <List
            groups={promptGroups}
            isLoading={!!groupsQuery.isLoading}
            isChatRoute={isChatRoute}
          />
        </div>
        <div
          className={cn(
            'pointer-events-none inset-x-0 bottom-0 bg-gradient-to-t from-surface-primary from-60% to-transparent px-3 pb-3 pt-2',
          )}
        >
          <div className="pointer-events-auto">
            <PanelNavigation
              onPrevious={prevPage}
              onNext={nextPage}
              hasNextPage={hasNextPage}
              hasPreviousPage={hasPreviousPage}
              isLoading={groupsQuery.isFetching}
              isChatRoute={isChatRoute}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
