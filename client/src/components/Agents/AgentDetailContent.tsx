import React from 'react';
import { Link, Pin, PinOff } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { OGDialogContent, Button, useToastContext } from '@librechat/client';
import {
  QueryKeys,
  Constants,
  EModelEndpoint,
  PermissionBits,
  LocalStorageKeys,
  AgentListResponse,
} from 'librechat-data-provider';
import type t from 'librechat-data-provider';
import { useLocalize, useDefaultConvo, useFavorites } from '~/hooks';
import { renderAgentAvatar, clearMessagesCache } from '~/utils';
import { useChatContext } from '~/Providers';

interface SupportContact {
  name?: string;
  email?: string;
}

interface AgentWithSupport extends t.Agent {
  support_contact?: SupportContact;
}

interface AgentDetailContentProps {
  agent: AgentWithSupport;
}

/**
 * Dialog content for displaying agent details
 * Used inside OGDialog with OGDialogTrigger for proper focus management
 */
const AgentDetailContent: React.FC<AgentDetailContentProps> = ({ agent }) => {
  const localize = useLocalize();
  const queryClient = useQueryClient();
  const { showToast } = useToastContext();
  const getDefaultConversation = useDefaultConvo();
  const { conversation, newConversation } = useChatContext();
  const { isFavoriteAgent, toggleFavoriteAgent } = useFavorites();
  const isFavorite = isFavoriteAgent(agent?.id);

  const handleFavoriteClick = () => {
    if (agent) {
      toggleFavoriteAgent(agent.id);
    }
  };

  /**
   * Navigate to chat with the selected agent
   */
  const handleStartChat = () => {
    if (agent) {
      const keys = [QueryKeys.agents, { requiredPermission: PermissionBits.EDIT }];
      const listResp = queryClient.getQueryData<AgentListResponse>(keys);
      if (listResp != null) {
        if (!listResp.data.some((a) => a.id === agent.id)) {
          const currentAgents = [agent, ...JSON.parse(JSON.stringify(listResp.data))];
          queryClient.setQueryData<AgentListResponse>(keys, { ...listResp, data: currentAgents });
        }
      }

      localStorage.setItem(`${LocalStorageKeys.AGENT_ID_PREFIX}0`, agent.id);

      clearMessagesCache(queryClient, conversation?.conversationId);
      queryClient.invalidateQueries([QueryKeys.messages]);

      /** Template with agent configuration */
      const template = {
        conversationId: Constants.NEW_CONVO as string,
        endpoint: EModelEndpoint.agents,
        agent_id: agent.id,
        title: localize('com_agents_chat_with', { name: agent.name || localize('com_ui_agent') }),
      };

      const currentConvo = getDefaultConversation({
        conversation: { ...(conversation ?? {}), ...template },
        preset: template,
      });

      newConversation({
        template: currentConvo,
        preset: template,
      });
    }
  };

  /**
   * Copy the agent's shareable link to clipboard
   */
  const handleCopyLink = () => {
    const baseUrl = new URL(window.location.origin);
    const chatUrl = `${baseUrl.origin}/c/new?agent_id=${agent.id}`;
    navigator.clipboard
      .writeText(chatUrl)
      .then(() => {
        showToast({
          message: localize('com_agents_link_copied'),
        });
      })
      .catch(() => {
        showToast({
          message: localize('com_agents_link_copy_failed'),
        });
      });
  };

  /**
   * Format contact information with mailto links when appropriate
   */
  const formatContact = () => {
    if (!agent?.support_contact) return null;

    const { name, email } = agent.support_contact;

    if (name && email) {
      return (
        <a href={`mailto:${email}`} className="text-primary hover:underline">
          {name}
        </a>
      );
    }

    if (email) {
      return (
        <a href={`mailto:${email}`} className="text-primary hover:underline">
          {email}
        </a>
      );
    }

    if (name) {
      return <span>{name}</span>;
    }

    return null;
  };

  return (
    <OGDialogContent className="overflow-hidden border-border-light/70 p-0 sm:max-w-lg">
      {/* Cover band with soft amber halo */}
      <div className="relative h-28 overflow-hidden bg-gradient-to-br from-surface-tertiary/40 via-surface-primary to-surface-primary dark:from-surface-primary-alt dark:via-surface-primary dark:to-surface-primary">
        <span
          aria-hidden
          className="absolute -top-10 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl dark:bg-primary/20"
        />
        {/* dot pattern */}
        <span
          aria-hidden
          className="absolute inset-0 opacity-[0.18] dark:opacity-[0.10]"
          style={{
            backgroundImage:
              'radial-gradient(currentColor 0.5px, transparent 0.5px)',
            backgroundSize: '14px 14px',
            color: 'hsl(var(--muted-foreground))',
          }}
        />
      </div>

      {/* Avatar floats over the cover */}
      <div className="-mt-12 flex flex-col items-center px-6">
        <div className="relative">
          <div className="overflow-hidden rounded-2xl bg-surface-primary p-1 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.18)] ring-1 ring-border-light/70 dark:ring-border-medium/60">
            {renderAgentAvatar(agent, { size: 'xl' })}
          </div>
          <span
            aria-hidden
            className="absolute -inset-2 -z-10 rounded-3xl bg-primary/15 blur-2xl"
          />
        </div>

        <h2
          className="font-display mt-4 text-center text-2xl font-medium tracking-[-0.025em] text-text-primary"
          data-testid="agent-detail-name"
        >
          {agent?.name || localize('com_agents_loading')}
        </h2>

        {/* Contact info */}
        {agent?.support_contact && formatContact() && (
          <div className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-text-tertiary">
            <span className="h-1 w-1 rounded-full bg-primary/70" aria-hidden />
            <span>
              {localize('com_agents_contact')}: {formatContact()}
            </span>
          </div>
        )}

        {/* Description */}
        {agent?.description && (
          <p className="mt-5 max-h-48 overflow-y-auto whitespace-pre-wrap rounded-xl border border-border-light/60 bg-surface-tertiary/30 px-4 py-3 text-center text-sm leading-relaxed text-text-secondary dark:border-border-medium/40 dark:bg-surface-primary-alt/40">
            {agent.description}
          </p>
        )}
      </div>

      {/* Action footer */}
      <div className="mt-6 flex items-center gap-2 bg-surface-tertiary/20 px-5 py-4 dark:bg-surface-primary-alt/40">
        <Button
          variant="outline"
          size="icon"
          onClick={handleFavoriteClick}
          title={isFavorite ? localize('com_ui_unpin') : localize('com_ui_pin')}
          aria-label={isFavorite ? localize('com_ui_unpin') : localize('com_ui_pin')}
          data-testid="agent-detail-pin-button"
          className="h-10 w-10 rounded-xl border-border-light/80 bg-surface-primary text-text-secondary transition-colors duration-150 hover:border-primary/40 hover:text-primary dark:border-border-medium/55"
        >
          {isFavorite ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleCopyLink}
          title={localize('com_agents_copy_link')}
          aria-label={localize('com_agents_copy_link')}
          data-testid="agent-detail-copy-link-button"
          className="h-10 w-10 rounded-xl border-border-light/80 bg-surface-primary text-text-secondary transition-colors duration-150 hover:border-primary/40 hover:text-primary dark:border-border-medium/55"
        >
          <Link className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button
          variant="submit"
          className="ml-auto h-10 flex-1 rounded-xl px-6 font-medium"
          onClick={handleStartChat}
          disabled={!agent}
          data-testid="agent-detail-start-chat-button"
        >
          {localize('com_agents_start_chat')}
        </Button>
      </div>
    </OGDialogContent>
  );
};

export default AgentDetailContent;
