import { useEffect, useState } from 'react';
import * as Ariakit from '@ariakit/react';
import { ShieldEllipsis } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { Permissions, SystemRoles } from 'librechat-data-provider';
import {
  OGDialog,
  OGDialogTitle,
  OGDialogContent,
  OGDialogTrigger,
  Button,
  Switch,
  DropdownPopup,
} from '@librechat/client';
import type { Control, UseFormSetValue, UseFormGetValues } from 'react-hook-form';
import type { PermissionTypes } from 'librechat-data-provider';
import type { TranslationKeys } from '~/hooks/useLocalize';
import { useLocalize, useAuthContext, useRoleSelector } from '~/hooks';

type FormValues = Record<Permissions, boolean>;

export interface PermissionConfig {
  permission: Permissions;
  labelKey: TranslationKeys;
}

export interface AdminSettingsDialogProps {
  /** The permission type from PermissionTypes enum */
  permissionType: PermissionTypes;
  /** Localization key for the section name (e.g., 'com_ui_memories', 'com_ui_agents') */
  sectionKey: TranslationKeys;
  /** Array of permission configurations to display */
  permissions: PermissionConfig[];
  /** Unique ID for the role dropdown menu */
  menuId: string;
  /** Mutation function and loading state from the permission update hook */
  mutation: {
    mutate: (data: { roleName: string; updates: Record<Permissions, boolean> }) => void;
    isLoading: boolean;
  };
  /** Whether to show the admin access warning when ADMIN role and USE permission is displayed (default: true) */
  showAdminWarning?: boolean;
  /** Custom trigger element. If not provided, uses default button with icon and text */
  trigger?: React.ReactNode;
  /** Additional className for the dialog content */
  dialogContentClassName?: string;
  /** Custom callback when a permission change requires confirmation */
  onPermissionConfirm?: (
    permission: Permissions,
    newValue: boolean,
    onChange: (value: boolean) => void,
  ) => void;
  /** Permissions that require confirmation before changing (only applies when onPermissionConfirm is provided) */
  confirmPermissions?: Permissions[];
  /** Custom content to render after the permissions form (e.g., confirmation dialogs) */
  extraContent?: React.ReactNode;
}

type LabelControllerProps = {
  label: string;
  permission: Permissions;
  control: Control<FormValues, unknown, FormValues>;
  setValue: UseFormSetValue<FormValues>;
  getValues: UseFormGetValues<FormValues>;
  onConfirm?: (newValue: boolean, onChange: (value: boolean) => void) => void;
};

const LabelController: React.FC<LabelControllerProps> = ({
  control,
  permission,
  label,
  onConfirm,
}) => (
  <div className="mb-4 flex items-center justify-between gap-2">
    {label}
    <Controller
      name={permission}
      control={control}
      render={({ field }) => (
        <Switch
          {...field}
          checked={field.value}
          onCheckedChange={(val) => {
            if (val === false && onConfirm) {
              onConfirm(val, field.onChange);
            } else {
              field.onChange(val);
            }
          }}
          value={field.value?.toString()}
          aria-label={label}
        />
      )}
    />
  </div>
);

const AdminSettingsDialog: React.FC<AdminSettingsDialogProps> = ({
  permissionType,
  sectionKey,
  permissions,
  menuId,
  mutation,
  showAdminWarning = true,
  trigger,
  dialogContentClassName,
  onPermissionConfirm,
  confirmPermissions = [],
  extraContent,
}) => {
  const localize = useLocalize();
  const { user } = useAuthContext();
  const { mutate, isLoading } = mutation;

  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const {
    selectedRole,
    isSelectedCustomRole,
    isCustomRoleLoading,
    isCustomRoleError,
    defaultValues,
    roleDropdownItems,
  } = useRoleSelector(permissionType);

  const {
    reset,
    control,
    setValue,
    getValues,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues,
  });

  useEffect(() => {
    if (isSelectedCustomRole && (isCustomRoleLoading || isCustomRoleError)) {
      return;
    }
    reset(defaultValues);
  }, [isSelectedCustomRole, isCustomRoleLoading, isCustomRoleError, defaultValues, reset]);

  if (user?.role !== SystemRoles.ADMIN) {
    return null;
  }

  const onSubmit = (data: FormValues) => {
    mutate({ roleName: selectedRole, updates: data });
  };

  const defaultTrigger = (
    <Button
      size="sm"
      variant="outline"
      className="relative h-9 w-full gap-2 rounded-lg border-border-light font-medium focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-primary"
      aria-label={localize('com_ui_admin_settings')}
    >
      <ShieldEllipsis className="size-5 cursor-pointer" aria-hidden="true" />
      {localize('com_ui_admin_settings')}
    </Button>
  );

  return (
    <>
      <OGDialog>
        <OGDialogTrigger asChild>{trigger ?? defaultTrigger}</OGDialogTrigger>
        <OGDialogContent
          className={
            dialogContentClassName ??
            'w-11/12 max-w-lg overflow-hidden border-border-light/70 bg-surface-primary text-text-primary'
          }
        >
          <div className="-mx-6 -mt-6 mb-2 border-b border-border-light/60 bg-gradient-to-b from-surface-tertiary/40 to-transparent px-6 pb-5 pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-light/70 bg-surface-primary text-primary shadow-sm">
                <ShieldEllipsis className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <OGDialogTitle className="font-display text-lg font-medium tracking-tight">
                  {localize('com_ui_admin_settings_section', { section: localize(sectionKey) })}
                </OGDialogTitle>
                <p className="mt-0.5 text-xs text-text-tertiary">
                  {localize('com_ui_admin_settings')}
                </p>
              </div>
            </div>
          </div>

          {/* Role selection dropdown */}
          <div className="flex items-center justify-between gap-3 rounded-xl border border-border-light/70 bg-surface-tertiary/40 px-3 py-2">
            <span className="text-sm font-medium text-text-secondary">
              {localize('com_ui_role_select')}
            </span>
            <DropdownPopup
              unmountOnHide={true}
              menuId={menuId}
              isOpen={isRoleMenuOpen}
              setIsOpen={setIsRoleMenuOpen}
              trigger={
                <Ariakit.MenuButton
                  data-testid="admin-settings-role-dropdown"
                  className="inline-flex min-w-[7rem] items-center justify-center rounded-lg border border-border-light/80 bg-surface-primary px-3 py-1.5 text-sm font-medium text-text-primary shadow-sm transition-colors duration-150 hover:border-primary/40 hover:bg-surface-hover"
                >
                  {selectedRole}
                </Ariakit.MenuButton>
              }
              items={roleDropdownItems}
              itemClassName="items-center justify-center"
              sameWidth={true}
            />
          </div>
          {/* Permissions form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="py-4">
              {permissions.map(({ permission, labelKey }) => {
                const label = localize(labelKey);
                const needsConfirm =
                  selectedRole === SystemRoles.ADMIN &&
                  confirmPermissions.includes(permission) &&
                  onPermissionConfirm;

                return (
                  <div
                    key={permission}
                    className="rounded-xl px-3 py-1 transition-colors duration-150 hover:bg-surface-tertiary/40"
                  >
                    <LabelController
                      control={control}
                      permission={permission}
                      label={label}
                      getValues={getValues}
                      setValue={setValue}
                      onConfirm={
                        needsConfirm
                          ? (newValue, onChange) =>
                              onPermissionConfirm(permission, newValue, onChange)
                          : undefined
                      }
                    />
                    {showAdminWarning &&
                      selectedRole === SystemRoles.ADMIN &&
                      permission === Permissions.USE && (
                        <div className="-mt-2 mb-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                          <span>{localize('com_ui_admin_access_warning')}</span>{' '}
                          <a
                            href="https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/interface"
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium underline underline-offset-2"
                          >
                            {localize('com_ui_more_info')}
                          </a>
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end gap-2 border-t border-border-light/60 pt-4">
              <Button
                type="submit"
                variant="submit"
                data-testid="admin-settings-save-button"
                disabled={
                  isSubmitting ||
                  isLoading ||
                  (isSelectedCustomRole && (isCustomRoleLoading || isCustomRoleError))
                }
                aria-label={localize('com_ui_save')}
              >
                {localize('com_ui_save')}
              </Button>
            </div>
          </form>
        </OGDialogContent>
      </OGDialog>
      {extraContent}
    </>
  );
};

export default AdminSettingsDialog;
