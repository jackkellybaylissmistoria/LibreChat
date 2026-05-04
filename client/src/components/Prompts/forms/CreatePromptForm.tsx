import { useEffect } from 'react';
import { FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, TextareaAutosize, Input } from '@librechat/client';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { LocalStorageKeys, PermissionTypes, Permissions } from 'librechat-data-provider';
import OpenSidebar from '~/components/Chat/Menus/OpenSidebar';
import CategorySelector from '../fields/CategorySelector';
import VariablesDropdown from '../editor/VariablesDropdown';
import PromptVariables from '../display/PromptVariables';
import Description from '../fields/Description';
import { usePromptGroupsContext } from '~/Providers';
import { useLocalize, useAccessStatus } from '~/hooks';
import Command from '../fields/Command';
import { useCreatePrompt } from '~/data-provider';
import { cn } from '~/utils';

type CreateFormValues = {
  name: string;
  prompt: string;
  type: 'text' | 'chat';
  category: string;
  oneliner?: string;
  command?: string;
};

const defaultPrompt: CreateFormValues = {
  name: '',
  prompt: '',
  type: 'text',
  category: '',
  oneliner: undefined,
  command: undefined,
};

const CreatePromptForm = ({
  defaultValues = defaultPrompt,
  onSuccess,
}: {
  defaultValues?: CreateFormValues;
  onSuccess?: (groupId: string) => void;
}) => {
  const localize = useLocalize();
  const navigate = useNavigate();
  const { hasAccess: hasUseAccess } = usePromptGroupsContext() ?? {};
  const { hasAccess: hasCreateAccess, isLoading: isLoadingCreateAccess } = useAccessStatus({
    permissionType: PermissionTypes.PROMPTS,
    permission: Permissions.CREATE,
  });
  const hasAccess = hasUseAccess && hasCreateAccess;

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    // Don't redirect while role permissions are still loading
    if (!hasAccess && !onSuccess && !isLoadingCreateAccess) {
      timeoutId = setTimeout(() => {
        navigate('/c/new');
      }, 1000);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [hasAccess, navigate, onSuccess, isLoadingCreateAccess]);

  const methods = useForm({
    defaultValues: {
      ...defaultValues,
      category: localStorage.getItem(LocalStorageKeys.LAST_PROMPT_CATEGORY) ?? '',
    },
  });

  const {
    watch,
    control,
    handleSubmit,
    formState: { isDirty, isSubmitting, errors, isValid },
  } = methods;

  const createPromptMutation = useCreatePrompt({
    onSuccess: (response) => {
      const groupId = response.prompt.groupId;
      if (onSuccess && groupId) {
        onSuccess(groupId);
      } else {
        navigate(`/prompts/${groupId}`, { replace: true });
      }
    },
  });

  const promptText = watch('prompt');

  const onSubmit = (data: CreateFormValues) => {
    const { name, category, oneliner, command, ...rest } = data;
    const groupData = { name, category } as Pick<
      CreateFormValues,
      'name' | 'category' | 'oneliner' | 'command'
    >;
    if ((oneliner?.length ?? 0) > 0) {
      groupData.oneliner = oneliner;
    }
    if ((command?.length ?? 0) > 0) {
      groupData.command = command;
    }
    createPromptMutation.mutate({
      prompt: rest,
      group: groupData,
    });
  };

  if (!hasAccess) {
    return null;
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full px-4 py-6 e1-fade-up md:px-6 md:py-8"
        data-testid="create-prompt-form"
      >
        <h1 className="sr-only">{localize('com_ui_create_prompt_page')}</h1>

        {/* Mobile header bar */}
        <div className="mb-4 flex items-center justify-between gap-2 sm:hidden">
          <OpenSidebar />
          <CategorySelector />
        </div>

        {/* Page header band */}
        <div className="mb-6 flex flex-col items-start justify-between gap-4 border-b border-border-light/60 pb-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-light/70 bg-surface-tertiary/40 text-primary">
              <FileText className="size-5" aria-hidden />
            </div>
            <div>
              <h2 className="font-display text-lg font-medium tracking-tight text-text-primary md:text-xl">
                {localize('com_ui_create_prompt_page')}
              </h2>
              <p className="text-xs text-text-tertiary">
                {localize('com_ui_prompt_input')}
              </p>
            </div>
          </div>
          <div className="hidden sm:block">
            <CategorySelector />
          </div>
        </div>

        {/* Name field */}
        <div className="mb-5">
          <Controller
            name="name"
            control={control}
            rules={{ required: localize('com_ui_prompt_name_required') }}
            render={({ field }) => (
              <div className="relative flex w-full flex-col">
                <label
                  htmlFor="prompt-name"
                  className="mb-1.5 text-xs font-medium uppercase tracking-wider text-text-tertiary"
                >
                  {localize('com_ui_prompt_name')} *
                </label>
                <Input
                  {...field}
                  id="prompt-name"
                  type="text"
                  className="h-11 rounded-xl border border-border-light/80 bg-surface-primary/80 px-3 text-base text-text-primary backdrop-blur-sm transition-[border-color,box-shadow] duration-150 placeholder:text-text-tertiary focus:border-primary/55 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.12)] focus:ring-0 dark:border-border-medium/60 dark:bg-surface-primary-alt/70"
                  placeholder={localize('com_ui_prompt_name')}
                  tabIndex={0}
                  aria-label={localize('com_ui_prompt_name')}
                  aria-required="true"
                />
                <div
                  className={cn(
                    'mt-1 text-xs text-destructive',
                    errors.name ? 'visible h-auto' : 'invisible h-0',
                  )}
                >
                  {errors.name ? errors.name.message : ' '}
                </div>
              </div>
            )}
          />
        </div>

        <div className="flex w-full flex-col gap-5">
          {/* Prompt text card */}
          <div className="overflow-hidden rounded-2xl border border-border-light/70 bg-surface-primary/60 shadow-[0_1px_2px_rgba(0,0,0,0.03)] backdrop-blur-sm dark:border-border-medium/55 dark:bg-surface-primary-alt/60">
            <header className="flex items-center justify-between border-b border-border-light/60 bg-surface-tertiary/30 px-4 py-2.5 dark:bg-surface-primary-alt/40">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-primary" aria-hidden="true" />
                <h2 className="text-sm font-semibold tracking-tight text-text-primary">
                  {localize('com_ui_prompt_text')}*
                </h2>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <VariablesDropdown fieldName="prompt" />
              </div>
            </header>
            <div className="min-h-32 px-4 py-4 sm:px-5">
              <Controller
                name="prompt"
                control={control}
                rules={{ required: localize('com_ui_prompt_text_required') }}
                render={({ field }) => (
                  <div>
                    <TextareaAutosize
                      {...field}
                      className="w-full resize-none overflow-y-auto bg-transparent font-mono text-sm leading-relaxed text-text-primary placeholder:text-text-tertiary focus:outline-none sm:text-base"
                      minRows={4}
                      maxRows={16}
                      tabIndex={0}
                      placeholder={localize('com_ui_prompt_input')}
                      aria-label={localize('com_ui_prompt_input_field')}
                      aria-required="true"
                    />
                    <div
                      className={cn(
                        'mt-1 text-xs text-destructive',
                        errors.prompt ? 'visible h-auto' : 'invisible h-0',
                      )}
                    >
                      {errors.prompt ? errors.prompt.message : ' '}
                    </div>
                  </div>
                )}
              />
            </div>
          </div>

          <PromptVariables promptText={promptText} />
          <Description
            onValueChange={(value) => methods.setValue('oneliner', value)}
            tabIndex={0}
          />
          <Command onValueChange={(value) => methods.setValue('command', value)} tabIndex={0} />

          <div className="mt-2 flex justify-end border-t border-border-light/60 pt-5">
            <Button
              aria-label={localize('com_ui_create_prompt')}
              className={cn(
                'h-10 rounded-xl px-6 font-medium transition-all duration-150',
                'sm:w-auto',
                (!isDirty || isSubmitting || !isValid) && 'cursor-not-allowed opacity-50',
              )}
              tabIndex={0}
              type="submit"
              data-testid="create-prompt-submit-button"
              aria-disabled={!isDirty || isSubmitting || !isValid || undefined}
              onClick={(e: React.MouseEvent) => {
                if (!isDirty || isSubmitting || !isValid) {
                  e.preventDefault();
                }
              }}
            >
              {localize('com_ui_create_prompt')}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default CreatePromptForm;
