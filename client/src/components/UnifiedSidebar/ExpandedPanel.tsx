import { memo, useCallback, lazy, Suspense } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRecoilValue } from 'recoil';
import { SquarePen } from 'lucide-react';
import { QueryKeys } from 'librechat-data-provider';
import { Skeleton, Sidebar, Button, TooltipAnchor } from '@librechat/client';
import type { NavLink } from '~/common';
import { CLOSE_SIDEBAR_ID } from '~/components/Chat/Menus/OpenSidebar';
import { useActivePanel, resolveActivePanel, DEFAULT_PANEL } from '~/Providers';
import { useLocalize, useNewConvo } from '~/hooks';
import { clearMessagesCache, cn } from '~/utils';
import store from '~/store';

const AccountSettings = lazy(() => import('~/components/Nav/AccountSettings'));

const NewChatButton = memo(function NewChatButton({
  setActive,
}: {
  setActive: (id: string) => void;
}) {
  const localize = useLocalize();
  const queryClient = useQueryClient();
  const { newConversation } = useNewConvo();
  const conversation = useRecoilValue(store.conversationByIndex(0));
  const switchToHistory = useRecoilValue(store.newChatSwitchToHistory);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        clearMessagesCache(queryClient, conversation?.conversationId);
        queryClient.invalidateQueries([QueryKeys.messages]);
        newConversation();
        if (switchToHistory) {
          setActive(DEFAULT_PANEL);
        }
      }
    },
    [queryClient, conversation?.conversationId, newConversation, switchToHistory, setActive],
  );

  return (
    <TooltipAnchor
      side="right"
      description={localize('com_ui_new_chat')}
      render={
        <a
          href="/c/new"
          data-testid="new-chat-button"
          aria-label={localize('com_ui_new_chat')}
          className={cn(
            'group relative flex h-10 w-10 items-center justify-center rounded-xl',
            'border border-border-light/70 bg-surface-primary',
            'shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-150 ease-out',
            'hover:-translate-y-0.5 hover:border-primary/40 hover:bg-surface-tertiary/60',
            'hover:shadow-[0_6px_18px_-8px_rgba(0,0,0,0.12)]',
            'dark:border-border-medium/60 dark:bg-surface-primary-alt',
          )}
          onClick={handleClick}
        >
          <SquarePen className="h-[18px] w-[18px] text-text-primary transition-transform duration-150 group-hover:scale-105" />
        </a>
      }
    />
  );
});

const NavIconButton = memo(function NavIconButton({
  link,
  isActive,
  expanded,
  setActive,
  onExpand,
  onCollapse,
}: {
  link: NavLink;
  isActive: boolean;
  expanded: boolean;
  setActive: (id: string) => void;
  onExpand?: () => void;
  onCollapse?: () => void;
}) {
  const localize = useLocalize();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (link.onClick) {
        link.onClick(e);
        return;
      }
      if (isActive && expanded) {
        onCollapse?.();
        return;
      }
      if (!isActive) {
        setActive(link.id);
      }
      if (!expanded) {
        onExpand?.();
      }
    },
    [link, isActive, setActive, expanded, onExpand, onCollapse],
  );

  return (
    <TooltipAnchor
      description={localize(link.title)}
      side="right"
      render={
        <Button
          size="icon"
          variant="ghost"
          aria-label={localize(link.title)}
          aria-pressed={isActive}
          className={cn(
            'group relative h-10 w-10 rounded-xl transition-all duration-150 ease-out',
            isActive
              ? 'bg-surface-tertiary text-text-primary shadow-[0_1px_2px_rgba(0,0,0,0.04)] before:absolute before:left-0 before:top-1/2 before:h-5 before:w-[3px] before:-translate-x-3 before:-translate-y-1/2 before:rounded-r-full before:bg-primary before:opacity-100 before:content-[""]'
              : 'text-text-tertiary hover:bg-surface-tertiary/60 hover:text-text-primary',
          )}
          onClick={handleClick}
        >
          <link.icon
            className={cn(
              'h-[18px] w-[18px] transition-transform duration-150',
              'group-hover:scale-105',
            )}
            aria-hidden="true"
          />
        </Button>
      }
    />
  );
});

function ExpandedPanel({
  links,
  expanded = true,
  onCollapse,
  onExpand,
}: {
  links: NavLink[];
  expanded?: boolean;
  onCollapse?: () => void;
  onExpand?: () => void;
}) {
  const localize = useLocalize();
  const { active, setActive } = useActivePanel();
  const effectiveActive = resolveActivePanel(active, links);

  const toggleLabel = expanded ? 'com_nav_close_sidebar' : 'com_nav_open_sidebar';
  const toggleClick = expanded ? onCollapse : onExpand;

  return (
    <div className="relative flex h-full flex-shrink-0 flex-col gap-1.5 border-r border-border-light/60 bg-surface-primary/85 px-3 py-3 backdrop-blur-md dark:border-border-medium/40 dark:bg-surface-primary/70">
      {/* Subtle gradient at top */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-primary/[0.04] to-transparent dark:from-primary/[0.05]"
      />
      <TooltipAnchor
        side="right"
        description={localize(toggleLabel)}
        render={
          <Button
            id={expanded ? CLOSE_SIDEBAR_ID : undefined}
            data-testid={expanded ? 'close-sidebar-button' : 'open-sidebar-button'}
            size="icon"
            variant="ghost"
            aria-label={localize(toggleLabel)}
            aria-expanded={expanded}
            className="group h-10 w-10 rounded-xl text-text-tertiary transition-all duration-150 hover:bg-surface-tertiary/60 hover:text-text-primary"
            onClick={toggleClick}
          >
            <Sidebar
              aria-hidden="true"
              className="h-[18px] w-[18px] transition-transform duration-150 group-hover:scale-105"
            />
          </Button>
        }
      />
      <NewChatButton setActive={setActive} />
      <div className="my-1 h-px w-8 self-center bg-gradient-to-r from-transparent via-border-medium to-transparent" />
      <div className="flex flex-col gap-1.5 overflow-y-auto">
        {links.map((link) => (
          <NavIconButton
            key={link.id}
            link={link}
            isActive={link.id === effectiveActive}
            expanded={expanded ?? true}
            setActive={setActive}
            onExpand={onExpand}
            onCollapse={onCollapse}
          />
        ))}
      </div>

      <div className="mt-auto pt-2">
        <div className="mb-2 h-px w-8 self-center bg-gradient-to-r from-transparent via-border-medium to-transparent" />
        <Suspense fallback={<Skeleton className="h-10 w-10 rounded-xl" />}>
          <AccountSettings collapsed />
        </Suspense>
      </div>
    </div>
  );
}

export default memo(ExpandedPanel);
