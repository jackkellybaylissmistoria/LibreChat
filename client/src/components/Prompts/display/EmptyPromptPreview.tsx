import React from 'react';
import { Sparkles, FileText } from 'lucide-react';
import { useLocalize } from '~/hooks';

export default function EmptyPromptPreview() {
  const localize = useLocalize();

  return (
    <div
      className="flex h-full w-full items-center justify-center px-6"
      data-testid="empty-prompt-preview"
    >
      <div className="e1-fade-up relative flex w-full max-w-md flex-col items-center text-center">
        {/* Soft amber halo */}
        <span
          aria-hidden
          className="pointer-events-none absolute -top-4 h-44 w-72 rounded-full bg-primary/10 blur-3xl dark:bg-primary/15"
        />

        {/* Icon stack */}
        <div className="relative mb-6 flex items-center justify-center">
          <div
            aria-hidden
            className="absolute -left-7 top-1 h-14 w-14 rotate-[-9deg] rounded-2xl border border-border-light/70 bg-surface-tertiary/60 dark:border-border-medium/60 dark:bg-surface-primary-alt"
          />
          <div
            aria-hidden
            className="absolute -right-7 top-1 h-14 w-14 rotate-[9deg] rounded-2xl border border-border-light/70 bg-surface-tertiary/60 dark:border-border-medium/60 dark:bg-surface-primary-alt"
          />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-border-light/70 bg-surface-primary shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)] dark:border-border-medium/60 dark:bg-surface-primary-alt">
            <FileText className="h-7 w-7 text-text-secondary" aria-hidden />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_4px_10px_-2px_hsl(var(--primary)/.5)]">
              <Sparkles className="h-3 w-3" aria-hidden />
            </span>
          </div>
        </div>

        <h2 className="font-display text-xl font-medium tracking-tight text-text-primary md:text-2xl">
          {localize('com_ui_select_or_create_prompt')}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-text-tertiary">
          Pick a prompt from the list — or craft a new one. Saved prompts can be reused
          and shared across your conversations.
        </p>
      </div>
    </div>
  );
}
