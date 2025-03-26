import ProfilePage from '@/features/settings/profile/components/ProfilePage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile',
  description: 'Update your profile information.'
};

export default function Page() {
  return <ProfilePage />;
}
