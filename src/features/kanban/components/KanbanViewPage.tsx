import PageContainer from '@/components/layout/PageContainer';
import { Heading } from '@/components/ui/heading';
import { KanbanBoard } from './KanbanBoard';
import NewTaskDialog from './NewTaskDialog';

export default function KanbanViewPage() {
  return (
    <PageContainer>
      <div className='space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading title={`Kanban`} description='Manage tasks by dnd' />
          <NewTaskDialog />
        </div>
        <KanbanBoard />
      </div>
    </PageContainer>
  );
}
