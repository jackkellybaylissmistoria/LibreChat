import React from 'react';
import { cn } from '~/utils';

/**
 * Refined skeleton primitive for fast, calm loading states.
 *
 * Uses a soft fade-pulse (opacity-only, GPU-friendly) instead of a
 * shimmer gradient — feels lighter and avoids the "loud" SaaS look.
 */
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** When true, render as a circular block (e.g. for avatars). */
  circle?: boolean;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, circle = false, style, ...rest }, ref) => (
    <div
      ref={ref}
      aria-hidden
      role="presentation"
      className={cn(
        'e1-skeleton',
        circle ? 'rounded-full' : 'rounded-lg',
        'bg-surface-tertiary/70',
        className,
      )}
      style={style}
      {...rest}
    />
  ),
);
Skeleton.displayName = 'Skeleton';

/**
 * Skeleton row matching the conversation-list density:
 * a small leading dot + a single soft text line.
 */
export const ConvoSkeletonRow: React.FC<{ widthPct?: number }> = ({ widthPct = 70 }) => (
  <div
    className="flex items-center gap-2 px-3 py-2"
    data-testid="conversation-skeleton-row"
  >
    <Skeleton className="h-1.5 w-1.5 rounded-full" />
    <Skeleton className="h-3" style={{ width: `${widthPct}%` }} />
  </div>
);

/**
 * Skeleton for a marketplace agent card.
 */
export const AgentCardSkeleton: React.FC = () => (
  <div
    className="flex h-32 gap-5 overflow-hidden rounded-2xl border border-border-light/60 bg-surface-primary/50 px-6 py-4 md:h-36 lg:h-40"
    data-testid="agent-card-skeleton"
  >
    <Skeleton circle className="h-14 w-14 self-center" />
    <div className="flex flex-1 flex-col justify-center gap-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-5/6" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  </div>
);

export default Skeleton;
