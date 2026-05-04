import { useCallback } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { PermissionTypes, Permissions } from 'librechat-data-provider';
import EmptyPromptPreview from '../display/EmptyPromptPreview';
import CreatePromptForm from '../forms/CreatePromptForm';
import { useHasAccess } from '~/hooks';
import PromptForm from '../forms/PromptForm';

export default function InlinePromptsView() {
  const { promptId } = useParams();
  const navigate = useNavigate();
  const isNew = promptId === undefined;

  const hasAccess = useHasAccess({
    permissionType: PermissionTypes.PROMPTS,
    permission: Permissions.USE,
  });

  const hasCreateAccess = useHasAccess({
    permissionType: PermissionTypes.PROMPTS,
    permission: Permissions.CREATE,
  });

  const handleCreateSuccess = useCallback(
    (groupId: string) => {
      navigate(`/prompts/${groupId}`, { replace: true });
    },
    [navigate],
  );

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
