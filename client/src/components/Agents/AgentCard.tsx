import React, { useMemo, useState } from 'react';
import { Label, OGDialog, OGDialogTrigger } from '@librechat/client';
import type t from 'librechat-data-provider';
import { useLocalize, TranslationKeys, useAgentCategories } from '~/hooks';
import { cn, renderAgentAvatar, getContactDisplayName } from '~/utils';
import AgentDetailContent from './AgentDetailContent';

interface AgentCardProps {
  agent: t.Agent;
  onSelect?: (agent: t.Agent) => void;
  className?: string;
}

/**
 * Card component to display agent information with integrated detail dialog
 */
const AgentCard: React.FC<AgentCardProps> = ({ agent, onSelect, className = '' }) => {
  const localize = useLocalize();
  const { categories } = useAgentCategories();
  const [isOpen, setIsOpen] = useState(false);

  const categoryLabel = useMemo(() => {
    if (!agent.category) return '';

    const category = categories.find((cat) => cat.value === agent.category);
    if (category) {
      if (category.label && category.label.startsWith('com_')) {
        return localize(category.label as TranslationKeys);
      }
      return category.label;
    }

    return agent.category.charAt(0).toUpperCase() + agent.category.slice(1);
  }, [agent.category, categories, localize]);

  const displayName = getContactDisplayName(agent);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && onSelect) {
      onSelect(agent);
    }
  };

  return (
    <OGDialog open={isOpen} onOpenChange={handleOpenChange}>
      <OGDialogTrigger asChild>
        <div
          data-testid={`agent-card-${agent.id}`}
          className={cn(
            'group relative flex flex-col gap-3 overflow-hidden rounded-2xl',
            'cursor-pointer select-none p-5',
            'border border-border-light/70 bg-surface-primary/70 backdrop-blur-sm',
            'shadow-[0_1px_0_0_rgba(0,0,0,0.02)]',
            'transition-[transform,border-color,box-shadow,background-color] duration-150 ease-out',
            'hover:-translate-y-0.5 hover:border-primary/40 hover:bg-surface-primary',
            'hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)]',
            'dark:border-border-medium/60 dark:bg-surface-primary-alt',
            'dark:hover:bg-surface-primary-alt dark:hover:shadow-[0_10px_30px_-14px_rgba(0,0,0,0.55)]',
            '[&_*]:cursor-pointer',
            'min-h-[10rem]',
            className,
          )}
          aria-label={localize('com_agents_agent_card_label', {
            name: agent.name,
            description: agent.description ?? '',
          })}
          aria-describedby={agent.description ? `agent-${agent.id}-description` : undefined}
          tabIndex={0}
          role="button"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsOpen(true);
            }
          }}
        >
          {/* Subtle amber accent line that slides in on hover */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 transition-opacity duration-150 group-hover:opacity-100"
          />

          {/* Header row: avatar + category */}
          <div className="flex items-start justify-between gap-3">
            <div className="relative">
              <div className="overflow-hidden rounded-xl ring-1 ring-border-light/70 dark:ring-border-medium/50">
                {renderAgentAvatar(agent, { size: 'sm', showBorder: false })}
              </div>
              <span
                aria-hidden
                className="absolute -inset-1 -z-10 rounded-2xl bg-primary/0 blur-xl transition-colors duration-200 group-hover:bg-primary/15"
              />
            </div>
            {categoryLabel && (
              <span
                className={cn(
                  'shrink-0 rounded-full border border-border-light/80 px-2.5 py-0.5',
                  'text-[11px] font-medium uppercase tracking-wider text-text-secondary',
                  'transition-colors duration-150',
                  'group-hover:border-primary/40 group-hover:text-primary',
                  'dark:border-border-medium/60',
                )}
              >
                {categoryLabel}
              </span>
            )}
          </div>

          {/* Body */}
          <div className="flex min-w-0 flex-1 flex-col">
            <Label className="font-display line-clamp-1 text-base font-semibold tracking-tight text-text-primary md:text-lg">
              {agent.name}
            </Label>

            {agent.description && (
              <p
                id={`agent-${agent.id}-description`}
                className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-text-secondary"
                aria-label={localize('com_agents_description_card', {
                  description: agent.description,
                })}
              >
                {agent.description}
              </p>
            )}
          </div>

          {/* Footer */}
          {displayName && (
            <div className="mt-auto flex items-center gap-1.5 pt-1 text-xs text-text-tertiary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary/60" aria-hidden />
              <span className="truncate">
                {localize('com_ui_by_author', { 0: displayName || '' })}
              </span>
            </div>
          )}
        </div>
      </OGDialogTrigger>

      <AgentDetailContent agent={agent} />
    </OGDialog>
  );
};

export default AgentCard;
