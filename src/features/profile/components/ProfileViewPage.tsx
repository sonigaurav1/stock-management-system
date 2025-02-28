import PageContainer from '@/components/layout/PageContainer';
import ProfileCreateForm from './ProfileCreateForm';

export default function ProfileViewPage() {
  return (
    <PageContainer>
      <div className='space-y-4'>
        <ProfileCreateForm categories={[]} initialData={null} />
      </div>
    </PageContainer>
  );
}
