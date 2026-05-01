'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { Loader2, Info, Download, Upload } from 'lucide-react';
import { z } from 'zod';

// Validation schemas
const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z
  .object({
    current: z.string().min(1, 'Current password is required'),
    new: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(
        /[^A-Za-z0-9]/,
        'Password must contain at least one special character'
      ),
    confirm: z.string()
  })
  .refine((data) => data.new === data.confirm, {
    message: "Passwords don't match",
    path: ['confirm']
  });

export default function AccountPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const deleteAllUserDataMutation = useMutation(api.users.deleteAllUserData);
  const exportUserDataAsBackupMutation = useMutation(
    api.users.exportUserDataAsBackup
  );
  const importUserDataFromBackupMutation = useMutation(
    api.users.importUserDataFromBackup
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Email state
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [primaryEmail, setPrimaryEmail] = useState('');
  const [editingEmailId, setEditingEmailId] = useState<string | null>(null);
  const [editedEmailValue, setEditedEmailValue] = useState('');
  const [isAddingEmail, setIsAddingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  // Password state
  const [passwordFields, setPasswordFields] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  // Loading states
  const [isLoading, setIsLoading] = useState({
    addingEmail: false,
    updatingEmail: false,
    removingEmail: false,
    settingPrimary: false,
    changingPassword: false,
    deletingAccount: false,
    toggling2FA: false,
    backingUp: false,
    restoring: false
  });

  // Dialog state
  const [openDialog, setOpenDialog] = useState({
    deleteAccount: false,
    removeEmail: false,
    backupBeforeDelete: false
  });
  const [emailToRemove, setEmailToRemove] = useState<string | null>(null);
  const [shouldBackupBeforeDelete, setShouldBackupBeforeDelete] =
    useState(false);

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Load user data
  useEffect(() => {
    if (isLoaded && user) {
      const primaryEmailAddress =
        user.primaryEmailAddress?.emailAddress ||
        user.emailAddresses[0]?.emailAddress ||
        '';
      setPrimaryEmail(primaryEmailAddress);

      // If the user has 2FA enabled, set the state
      setTwoFactorEnabled(user.twoFactorEnabled || false);
    }
  }, [isLoaded, user]);

  // Validate email
  const validateEmail = useCallback((email: string) => {
    try {
      emailSchema.parse(email);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setEmailError(error.errors[0].message);
      } else {
        setEmailError('Invalid email format');
      }
      return false;
    }
  }, []);

  // Validate password fields
  const validatePasswords = useCallback(() => {
    try {
      passwordSchema.parse(passwordFields);
      setPasswordErrors({
        current: '',
        new: '',
        confirm: ''
      });
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors = { current: '', new: '', confirm: '' };
        error.errors.forEach((err) => {
          const field = err.path[0];
          if (
            field &&
            (field === 'current' || field === 'new' || field === 'confirm')
          ) {
            newErrors[field] = err.message;
          }
        });
        setPasswordErrors(newErrors);
      }
      return false;
    }
  }, [passwordFields]);

  // Add new email address
  const addEmailAddress = async () => {
    if (!user) return;
    if (!validateEmail(newEmail)) return;

    setIsLoading((prev) => ({ ...prev, addingEmail: true }));
    try {
      await user.createEmailAddress({
        email: newEmail
      });
      toast.success('Email verification sent', {
        description: 'Please check your inbox to verify this email address'
      });
      setNewEmail('');
      setIsAddingEmail(false);
      setEmailError('');
    } catch (error) {
      toast.error('Error adding email', {
        description:
          error instanceof Error ? error.message : 'Failed to add email address'
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, addingEmail: false }));
    }
  };

  // Start editing email
  const startEditEmail = (emailId: string, currentEmail: string) => {
    setEditingEmailId(emailId);
    setEditedEmailValue(currentEmail);
    setEmailError('');
  };

  // Cancel editing email
  const cancelEditEmail = () => {
    setEditingEmailId(null);
    setEditedEmailValue('');
    setEmailError('');
  };

  // Save email changes
  const saveEmailChange = async (emailId: string) => {
    if (!user) return;
    if (!validateEmail(editedEmailValue)) return;

    setIsLoading((prev) => ({ ...prev, updatingEmail: true }));
    try {
      await user.createEmailAddress({
        email: editedEmailValue
      });
      toast.success('Email verification sent', {
        description: 'Please check your inbox to verify this new email address'
      });
      setEditingEmailId(null);
      setEditedEmailValue('');
    } catch (error) {
      toast.error('Error updating email', {
        description:
          error instanceof Error
            ? error.message
            : 'Failed to update email address'
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, updatingEmail: false }));
    }
  };

  // Open remove email dialog
  const openRemoveEmailDialog = (emailId: string) => {
    setEmailToRemove(emailId);
    setOpenDialog((prev) => ({ ...prev, removeEmail: true }));
  };

  // Remove email address
  const removeEmailAddress = async () => {
    if (!user || !emailToRemove) return;

    // Don't allow removing the primary email
    if (emailToRemove === user.primaryEmailAddressId) {
      toast.error('Cannot remove primary email', {
        description: 'Please set another email as primary first'
      });
      setOpenDialog((prev) => ({ ...prev, removeEmail: false }));
      return;
    }

    setIsLoading((prev) => ({ ...prev, removingEmail: true }));
    try {
      // await user.removeEmailAddress(emailToRemove);
      // toast.success('Email removed', {
      //   description: 'The email address has been removed from your account'
      // });
      setOpenDialog((prev) => ({ ...prev, removeEmail: false }));
    } catch (error) {
      toast.error('Error removing email', {
        description:
          error instanceof Error
            ? error.message
            : 'Failed to remove email address'
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, removingEmail: false }));
    }
  };

  // Set primary email
  const setPrimaryEmailAddress = async (emailId: string) => {
    if (!user) return;

    setIsLoading((prev) => ({ ...prev, settingPrimary: true }));
    try {
      // await user.setPrimaryEmailAddress({ emailAddressId: emailId });
      // toast.success('Primary email updated');

      // Update primary email in state
      const newPrimaryEmail = user.emailAddresses.find(
        (email) => email.id === emailId
      )?.emailAddress;
      if (newPrimaryEmail) {
        setPrimaryEmail(newPrimaryEmail);
      }
    } catch (error) {
      toast.error('Error setting primary email', {
        description:
          error instanceof Error ? error.message : 'Failed to set primary email'
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, settingPrimary: false }));
    }
  };

  // Handle password field changes
  interface PasswordFields {
    current: string;
    new: string;
    confirm: string;
  }

  const handlePasswordChange = (field: keyof PasswordFields, value: string) => {
    setPasswordFields((prev: PasswordFields) => ({
      ...prev,
      [field]: value
    }));
  };

  // Update password
  const updatePassword = async () => {
    if (!user) return;
    if (!validatePasswords()) return;

    setIsLoading((prev) => ({ ...prev, changingPassword: true }));
    try {
      await user.updatePassword({
        currentPassword: passwordFields.current,
        newPassword: passwordFields.new
      });
      toast.success('Password updated successfully');
      // Reset password fields
      setPasswordFields({
        current: '',
        new: '',
        confirm: ''
      });
    } catch (error) {
      toast.error('Error updating password', {
        description:
          error instanceof Error ? error.message : 'Failed to update password'
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, changingPassword: false }));
    }
  };

  // Toggle 2FA
  const toggle2FA = async () => {
    if (!user) return;

    setIsLoading((prev) => ({ ...prev, toggling2FA: true }));
    try {
      if (twoFactorEnabled) {
        // await user.disable2FA();
        // toast.success('Two-factor authentication disabled');
      } else {
        // This would typically start a 2FA setup flow
        // For this example, we'll just show a success message
        // await user.create2FASetup();
        // toast.info('Two-factor authentication setup started', {
        //   description: 'Follow the instructions to complete setup'
        // });
      }
      setTwoFactorEnabled(!twoFactorEnabled);
    } catch (error) {
      toast.error(`Error ${twoFactorEnabled ? 'disabling' : 'enabling'} 2FA`, {
        description:
          error instanceof Error
            ? error.message
            : 'Failed to update 2FA settings'
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, toggling2FA: false }));
    }
  };

  // Delete account
  const deleteAccount = async () => {
    if (!user) return;

    setIsLoading((prev) => ({ ...prev, deletingAccount: true }));
    try {
      // First, backup data if user requested it
      if (shouldBackupBeforeDelete) {
        toast.message('Creating backup...');
        await downloadBackup();
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Then delete all Convex data
      toast.message('Deleting account data...');
      await deleteAllUserDataMutation();

      // Then delete the Clerk user
      await user.delete();

      // Close the dialog
      setOpenDialog((prev) => ({ ...prev, deleteAccount: false }));

      // Show success toast
      toast.success('Account deleted successfully');

      // Redirect to sign-in page after a short delay to allow toast to display
      setTimeout(() => {
        router.push('/sign-in');
      }, 1000);
    } catch (error) {
      toast.error('Error deleting account', {
        description:
          error instanceof Error ? error.message : 'Failed to delete account'
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, deletingAccount: false }));
    }
  };

  // Download backup
  const downloadBackup = async () => {
    setIsLoading((prev) => ({ ...prev, backingUp: true }));
    try {
      const backupData = await exportUserDataAsBackupMutation();

      if (!backupData) {
        toast.error('Failed to create backup', {
          description: 'Could not fetch your data'
        });
        return;
      }

      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
        .slice(0, -6);
      const filename = `backup_${user?.id || 'user'}_${timestamp}.json`;

      // Create blob and download
      const dataStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Backup downloaded successfully', {
        description: `File saved as ${filename}`
      });
    } catch (error) {
      toast.error('Error creating backup', {
        description:
          error instanceof Error ? error.message : 'Failed to create backup'
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, backingUp: false }));
    }
  };

  // Restore from backup
  const handleRestoreFile = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading((prev) => ({ ...prev, restoring: true }));
    try {
      toast.loading('Reading backup file...');
      const fileContent = await file.text();
      const backupData = JSON.parse(fileContent);

      // Verify backup format
      if (!backupData.version || !backupData.tables) {
        throw new Error('Invalid backup file format');
      }

      toast.loading('Restoring data...');
      const result = await importUserDataFromBackupMutation({ backupData });

      if (result.success) {
        toast.success('Data restored successfully', {
          description: `${result.importedCount} records imported`
        });
      }
    } catch (error) {
      toast.error('Error restoring backup', {
        description:
          error instanceof Error ? error.message : 'Failed to restore backup'
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, restoring: false }));
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Show loading state if user data isn't loaded yet
  if (!isLoaded) {
    return (
      <div className='flex h-full items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
        <span className='ml-2 text-lg'>Loading account information...</span>
      </div>
    );
  }

  return (
    <ScrollArea className='h-[calc(100dvh-175px)] flex-1'>
      <div className='px-4 py-2 pb-28 md:flex-1 md:px-6 md:pb-0 lg:px-8 lg:py-4'>
        <div className='max-w-3xl'>
          <div>
            <h2 className='text-xl font-bold'>Account</h2>
            <p className='text-sm text-muted-foreground'>
              Update your account settings and change your password
            </p>
          </div>

          <div className='mt-6 space-y-6'>
            {/* Email Addresses Section */}
            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Email Addresses</h3>

              {/* Display existing emails */}
              <div className='space-y-2'>
                {user?.emailAddresses.map((emailObj) => (
                  <div
                    key={emailObj.id}
                    className='flex items-center justify-between rounded border p-2'
                  >
                    {editingEmailId === emailObj.id ? (
                      // Edit mode
                      <div className='flex w-full items-center space-x-2'>
                        <div className='flex-1 space-y-1'>
                          <Input
                            type='email'
                            value={editedEmailValue}
                            onChange={(e) =>
                              setEditedEmailValue(e.target.value)
                            }
                            className={emailError ? 'border-red-500' : ''}
                            placeholder='Enter new email'
                            aria-invalid={!!emailError}
                            aria-describedby={
                              emailError ? 'email-error' : undefined
                            }
                          />
                          {emailError && (
                            <p
                              id='email-error'
                              className='text-xs text-red-500'
                            >
                              {emailError}
                            </p>
                          )}
                        </div>
                        <div className='flex gap-2'>
                          <Button
                            size='sm'
                            onClick={() => saveEmailChange(emailObj.id)}
                            disabled={isLoading.updatingEmail}
                          >
                            {isLoading.updatingEmail ? (
                              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            ) : null}
                            Save
                          </Button>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={cancelEditEmail}
                            disabled={isLoading.updatingEmail}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Display mode
                      <>
                        <div>
                          <span>{emailObj.emailAddress}</span>
                          {emailObj.id === user.primaryEmailAddressId && (
                            <span className='ml-2 rounded bg-green-100 px-2 py-0.5 text-xs text-green-800'>
                              Primary
                            </span>
                          )}
                          {emailObj.verification?.status !== 'verified' && (
                            <span className='ml-2 rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800'>
                              Unverified
                            </span>
                          )}
                        </div>
                        <div className='flex gap-2'>
                          {emailObj.id !== user.primaryEmailAddressId && (
                            <Button
                              size='sm'
                              onClick={() =>
                                setPrimaryEmailAddress(emailObj.id)
                              }
                              disabled={
                                isLoading.settingPrimary ||
                                emailObj.verification?.status !== 'verified'
                              }
                            >
                              {isLoading.settingPrimary ? (
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                              ) : null}
                              Make Primary
                            </Button>
                          )}
                          <Button
                            size='sm'
                            variant='outline'
                            disabled
                            onClick={() =>
                              startEditEmail(emailObj.id, emailObj.emailAddress)
                            }
                          >
                            Edit
                          </Button>
                          {emailObj.id !== user.primaryEmailAddressId && (
                            <Button
                              size='sm'
                              variant='destructive'
                              onClick={() => openRemoveEmailDialog(emailObj.id)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Add new email section */}
              {isAddingEmail ? (
                <div className='space-y-2 rounded border p-4'>
                  <Label htmlFor='new-email'>New Email</Label>
                  <div className='space-y-1'>
                    <Input
                      id='new-email'
                      type='email'
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder='Enter new email address'
                      className={emailError ? 'border-red-500' : ''}
                      aria-invalid={!!emailError}
                      aria-describedby={
                        emailError ? 'new-email-error' : undefined
                      }
                    />
                    {emailError && (
                      <p id='new-email-error' className='text-xs text-red-500'>
                        {emailError}
                      </p>
                    )}
                  </div>
                  <div className='flex gap-2'>
                    <Button
                      onClick={addEmailAddress}
                      disabled={isLoading.addingEmail}
                    >
                      {isLoading.addingEmail ? (
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      ) : null}
                      Add Email
                    </Button>
                    <Button
                      variant='outline'
                      onClick={() => {
                        setIsAddingEmail(false);
                        setNewEmail('');
                        setEmailError('');
                      }}
                      disabled={isLoading.addingEmail}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => setIsAddingEmail(true)}
                  // disabled={(user?.emailAddresses ?? []).length >= 5}
                  disabled
                >
                  Add Email Address
                </Button>
              )}
              {(user?.emailAddresses ?? []).length >= 5 && (
                <p className='text-xs text-muted-foreground'>
                  You have reached the maximum number of email addresses (5).
                </p>
              )}
            </div>

            <Separator />

            {/* Password Section */}
            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Password</h3>
              <div className='space-y-2'>
                <Label htmlFor='current-password'>Current password</Label>
                <Input
                  id='current-password'
                  type='password'
                  value={passwordFields.current}
                  onChange={(e) =>
                    handlePasswordChange('current', e.target.value)
                  }
                  className={passwordErrors.current ? 'border-red-500' : ''}
                  aria-invalid={!!passwordErrors.current}
                  aria-describedby={
                    passwordErrors.current
                      ? 'current-password-error'
                      : undefined
                  }
                />
                {passwordErrors.current && (
                  <p
                    id='current-password-error'
                    className='text-xs text-red-500'
                  >
                    {passwordErrors.current}
                  </p>
                )}
              </div>
              <div className='space-y-2'>
                <Label htmlFor='new-password'>New password</Label>
                <Input
                  id='new-password'
                  type='password'
                  value={passwordFields.new}
                  onChange={(e) => handlePasswordChange('new', e.target.value)}
                  className={passwordErrors.new ? 'border-red-500' : ''}
                  aria-invalid={!!passwordErrors.new}
                  aria-describedby={
                    passwordErrors.new ? 'new-password-error' : undefined
                  }
                />
                {passwordErrors.new && (
                  <p id='new-password-error' className='text-xs text-red-500'>
                    {passwordErrors.new}
                  </p>
                )}
                <div className='mt-1 space-y-1 text-xs text-muted-foreground'>
                  <p>Password must:</p>
                  <ul className='list-disc space-y-1 pl-5'>
                    <li
                      className={
                        passwordFields.new.length >= 8 ? 'text-green-600' : ''
                      }
                    >
                      Be at least 8 characters
                    </li>
                    <li
                      className={
                        /[A-Z]/.test(passwordFields.new) ? 'text-green-600' : ''
                      }
                    >
                      Contain at least one uppercase letter
                    </li>
                    <li
                      className={
                        /[a-z]/.test(passwordFields.new) ? 'text-green-600' : ''
                      }
                    >
                      Contain at least one lowercase letter
                    </li>
                    <li
                      className={
                        /[0-9]/.test(passwordFields.new) ? 'text-green-600' : ''
                      }
                    >
                      Contain at least one number
                    </li>
                    <li
                      className={
                        /[^A-Za-z0-9]/.test(passwordFields.new)
                          ? 'text-green-600'
                          : ''
                      }
                    >
                      Contain at least one special character
                    </li>
                  </ul>
                </div>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='confirm-password'>Confirm password</Label>
                <Input
                  id='confirm-password'
                  type='password'
                  value={passwordFields.confirm}
                  onChange={(e) =>
                    handlePasswordChange('confirm', e.target.value)
                  }
                  className={passwordErrors.confirm ? 'border-red-500' : ''}
                  aria-invalid={!!passwordErrors.confirm}
                  aria-describedby={
                    passwordErrors.confirm
                      ? 'confirm-password-error'
                      : undefined
                  }
                />
                {passwordErrors.confirm && (
                  <p
                    id='confirm-password-error'
                    className='text-xs text-red-500'
                  >
                    {passwordErrors.confirm}
                  </p>
                )}
              </div>
              <Button
                onClick={updatePassword}
                disabled={isLoading.changingPassword}
              >
                {isLoading.changingPassword ? (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                ) : null}
                Update password
              </Button>
            </div>

            <Separator />

            {/* 2FA Section */}
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-medium'>
                  Two-factor Authentication
                </h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant='ghost' size='icon' className='h-8 w-8'>
                        <Info className='h-4 w-4' />
                        <span className='sr-only'>2FA Information</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className='max-w-xs'>
                      <p>
                        Two-factor authentication adds an extra layer of
                        security to your account by requiring a second
                        verification method in addition to your password.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className='flex items-center space-x-2'>
                <Switch
                  id='2fa'
                  checked={twoFactorEnabled}
                  onCheckedChange={toggle2FA}
                  disabled={isLoading.toggling2FA}
                />
                <Label htmlFor='2fa'>
                  {isLoading.toggling2FA ? (
                    <div className='flex items-center'>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      {twoFactorEnabled ? 'Disabling' : 'Enabling'} two-factor
                      authentication...
                    </div>
                  ) : (
                    <>Enable two-factor authentication</>
                  )}
                </Label>
              </div>
              <p className='text-sm text-muted-foreground'>
                Protect your account with an extra layer of security. When
                enabled, you&apos;ll need to provide a code in addition to your
                password when signing in.
              </p>
            </div>

            <Separator />

            {/* Data Backup & Restore Section */}
            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Data Backup & Restore</h3>
              <p className='text-sm text-muted-foreground'>
                Download a backup of all your data or restore from a previous
                backup
              </p>

              <div className='space-y-3'>
                {/* Download Backup */}
                <div className='rounded border p-4'>
                  <h4 className='mb-2 font-medium'>Download Backup</h4>
                  <p className='mb-4 text-sm text-muted-foreground'>
                    Export all your data as a JSON file. You can use this to
                    restore your data later or migrate to another account.
                  </p>
                  <Button
                    onClick={downloadBackup}
                    disabled={isLoading.backingUp}
                    variant='outline'
                  >
                    {isLoading.backingUp ? (
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    ) : (
                      <Download className='mr-2 h-4 w-4' />
                    )}
                    Download Backup
                  </Button>
                </div>

                {/* Restore from Backup */}
                <div className='rounded border p-4'>
                  <h4 className='mb-2 font-medium'>Restore from Backup</h4>
                  <p className='mb-4 text-sm text-muted-foreground'>
                    Upload a previously downloaded backup file to restore your
                    data.
                  </p>
                  <div className='flex gap-2'>
                    <input
                      ref={fileInputRef}
                      type='file'
                      accept='.json'
                      onChange={handleRestoreFile}
                      className='hidden'
                      aria-label='Select backup file to restore'
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading.restoring}
                      variant='outline'
                    >
                      {isLoading.restoring ? (
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      ) : (
                        <Upload className='mr-2 h-4 w-4' />
                      )}
                      Restore from Backup
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Delete Account Section */}
            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Delete Account</h3>
              <p className='text-sm text-muted-foreground'>
                Permanently delete your account and all of your content. This
                action cannot be undone.
              </p>
              <Button
                variant='destructive'
                onClick={() => {
                  setShouldBackupBeforeDelete(false);
                  setOpenDialog((prev) => ({ ...prev, deleteAccount: true }));
                }}
              >
                Delete account
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog
        open={openDialog.deleteAccount}
        onOpenChange={(open) => {
          setOpenDialog((prev) => ({ ...prev, deleteAccount: open }));
          if (!open) {
            setShouldBackupBeforeDelete(false);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove all your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className='space-y-3 py-4'>
            <div className='flex items-center space-x-2'>
              <input
                type='checkbox'
                id='backup-before-delete'
                checked={shouldBackupBeforeDelete}
                onChange={(e) => setShouldBackupBeforeDelete(e.target.checked)}
                className='h-4 w-4'
                disabled={isLoading.deletingAccount}
              />
              <Label htmlFor='backup-before-delete' className='cursor-pointer'>
                Create a backup of my data before deletion
              </Label>
            </div>
            <p className='pl-6 text-xs text-muted-foreground'>
              A backup file will be downloaded to your device before your
              account is deleted.
            </p>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading.deletingAccount}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteAccount}
              disabled={isLoading.deletingAccount}
              className='bg-red-600 hover:bg-red-700'
            >
              {isLoading.deletingAccount ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : null}
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Email Confirmation Dialog */}
      <AlertDialog
        open={openDialog.removeEmail}
        onOpenChange={(open) =>
          setOpenDialog((prev) => ({ ...prev, removeEmail: open }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Email Address</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this email address from your
              account?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading.removingEmail}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={removeEmailAddress}
              disabled={isLoading.removingEmail}
              className='bg-red-600 hover:bg-red-700'
            >
              {isLoading.removingEmail ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : null}
              Remove Email
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ScrollArea>
  );
}
