import { useCallback } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { Spinner } from '@librechat/client';
import { PermissionTypes, Permissions } from 'librechat-data-provider';
import EmptyPromptPreview from '../display/EmptyPromptPreview';
import CreatePromptForm from '../forms/CreatePromptForm';
import { useAccessStatus } from '~/hooks';
import PromptForm from '../forms/PromptForm';

export default function InlinePromptsView() {
  const { promptId } = useParams();
  const navigate = useNavigate();
  const isNew = promptId === undefined;

  const { hasAccess, isLoading: isLoadingAccess } = useAccessStatus({
    permissionType: PermissionTypes.PROMPTS,
    permission: Permissions.USE,
  });

  const { hasAccess: hasCreateAccess, isLoading: isLoadingCreateAccess } = useAccessStatus({
    permissionType: PermissionTypes.PROMPTS,
    permission: Permissions.CREATE,
  });

  const handleCreateSuccess = useCallback(
    (groupId: string) => {
      navigate(`/prompts/${groupId}`, { replace: true });
    },
    [navigate],
  );

  // Wait for role queries to resolve before evaluating access — avoids the
  // flash of redirect on direct URL navigation while permissions are loading.
  if (isLoadingAccess || isLoadingCreateAccess) {
    return (
      <div
        className="flex h-full w-full items-center justify-center bg-presentation"
        data-testid="inline-prompts-view-loading"
        aria-live="polite"
        role="status"
      >
        <Spinner className="size-5 text-text-tertiary" />
      </div>
    );
  }

  if (!hasAccess) {
    return <Navigate to="/c/new" replace />;
  }

  if (isNew && !hasCreateAccess) {
    return <EmptyPromptPreview />;
  }

  return (
    <div
      className="flex h-full w-full flex-col overflow-y-auto bg-presentation"
      data-testid="inline-prompts-view"
    >
      <div className="mx-auto w-full max-w-3xl flex-1 e1-fade-up">
        {isNew ? (
          <CreatePromptForm onSuccess={handleCreateSuccess} />
        ) : (
          <PromptForm promptId={promptId} />
        )}
      </div>
    </div>
  );
}
