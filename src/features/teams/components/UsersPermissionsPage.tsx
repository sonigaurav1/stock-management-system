'use client';

import { useUser } from '@clerk/nextjs';
import {
  InviteMemberDialog,
  TeamMembersList
} from '@/components/features/team/InviteMemberDialog';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/heading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomRolesManager } from './CustomRolesManager';

export default function UsersPermissionsPage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded || !user) return null;

  return (
    <div className='flex flex-col space-y-6 p-1'>
      <div className='flex items-center justify-between'>
        <Heading
          title='Team Members'
          description='Manage your organization members and their access levels.'
        />
        <InviteMemberDialog />
      </div>

      <Separator />

      <Tabs defaultValue='members' className='w-full'>
        <TabsList className='grid w-full max-w-[400px] grid-cols-2'>
          <TabsTrigger value='members'>Team Members</TabsTrigger>
          <TabsTrigger value='roles'>Roles & Permissions</TabsTrigger>
        </TabsList>
        <TabsContent value='members' className='pt-6'>
          <TeamMembersList />
        </TabsContent>
        <TabsContent value='roles' className='pt-6'>
          <CustomRolesManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
