# Communication Hub - Quick Implementation Guide

## Quick Start

### 1. Send a Message

```typescript
import { api } from '@/convex/_generated/api';
import { useMutation } from 'convex/react';

function MessageButton() {
  const sendMessage = useMutation(api.messaging.sendMessage);

  const handleSend = async () => {
    await sendMessage({
      recipientId: 'user_id_here',
      content: 'Hello! This is a message',
      subject: 'Important Update',
      priority: 'high'
    });
  };

  return <button onClick={handleSend}>Send</button>;
}
```

### 2. Get Inbox Messages

```typescript
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';

function Inbox() {
  const messages = useQuery(api.messaging.getInbox, {
    filter: 'unread',
    limit: 20
  });

  return (
    <div>
      {messages?.map(msg => (
        <div key={msg._id}>{msg.content}</div>
      ))}
    </div>
  );
}
```

### 3. Create a Task

```typescript
import { api } from '@/convex/_generated/api';
import { useMutation } from 'convex/react';

function CreateTaskForm() {
  const createTask = useMutation(api.tasks.createTask);

  const handleCreate = async (formData: any) => {
    const taskId = await createTask({
      title: formData.title,
      description: formData.description,
      assigneeId: formData.assigneeId,
      priority: 'high',
      dueDate: new Date(formData.dueDate).getTime(),
      notifyAssignee: true // Send notification
    });

    console.debug('Task created:', taskId);
  };

  return (
    // Form JSX
  );
}
```

### 4. Get User's Tasks

```typescript
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';

function MyTasks() {
  const tasks = useQuery(api.tasks.getAssignedTasks, {
    status: 'in_progress',
    sortBy: 'dueDate'
  });

  return (
    <div>
      {tasks?.map(task => (
        <div key={task._id}>
          <h3>{task.title}</h3>
          <p>{task.description}</p>
          <span>{task.priority}</span>
        </div>
      ))}
    </div>
  );
}
```

### 5. Update Task Status

```typescript
import { api } from '@/convex/_generated/api';
import { useMutation } from 'convex/react';

function TaskCard({ taskId }) {
  const updateStatus = useMutation(api.tasks.updateTaskStatus);

  const handleMarkDone = async () => {
    await updateStatus({
      taskId,
      status: 'completed'
    });
  };

  return <button onClick={handleMarkDone}>Mark Done</button>;
}
```

### 6. Configure Notifications

```typescript
import { api } from '@/convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';

function NotificationPrefs() {
  const prefs = useQuery(api.notificationPreferences.getNotificationPreferences);
  const updateChannels = useMutation(api.notificationPreferences.updateChannelPreferences);

  const toggleEmail = async () => {
    await updateChannels({
      emailEnabled: !prefs?.emailEnabled
    });
  };

  return (
    <div>
      <button onClick={toggleEmail}>
        {prefs?.emailEnabled ? 'Disable' : 'Enable'} Emails
      </button>
    </div>
  );
}
```

### 7. Use Communication Hub Components

```typescript
import {
  MessageInbox,
  TaskList,
  TaskAssigner,
  NotificationSettings
} from '@/features/communication';

function CommunicationHub() {
  return (
    <div>
      <MessageInbox />
      <TaskList />
      <NotificationSettings />
    </div>
  );
}
```

## Common Patterns

### Pattern 1: Auto-Create Task on Business Event

```typescript
export const onLowStock = mutation({
  async handler(ctx) {
    const products = await ctx.db
      .query('products')
      .filter((q) => q.lt(q.field('stockLevel'), q.field('reorderLevel')))
      .collect();

    for (const product of products) {
      // Create task for restocking
      await ctx.db.insert('tasks', {
        title: `Restock: ${product.name}`,
        assigneeId: 'team_lead_id',
        assignorId: 'system',
        priority: 'high',
        status: 'assigned',
        relatedEntityType: 'product',
        relatedEntityId: product._id,
        createdAt: Date.now(),
        isDeleted: false,
        tags: ['restock']
      });

      // Notify via message
      await ctx.db.insert('messages', {
        senderId: 'system',
        recipientId: 'team_lead_id',
        content: `Product ${product.name} is below reorder level`,
        subject: 'Low Stock Alert',
        priority: 'high',
        isRead: false,
        attachmentIds: [],
        isArchived: false,
        isDeleted: false,
        tags: ['alert'],
        createdAt: Date.now()
      });
    }
  }
});
```

### Pattern 2: Process Task Completion

```typescript
export const completeTask = mutation({
  args: { taskId: v.id('tasks') },
  async handler(ctx, args) {
    const task = await ctx.db.get(args.taskId);

    // Mark as completed
    await ctx.db.patch(args.taskId, {
      status: 'completed',
      completedAt: Date.now()
    });

    // Notify task creator
    await ctx.db.insert('messages', {
      senderId: task.assigneeId,
      recipientId: task.assignorId,
      content: `Task "${task.title}" has been completed`,
      subject: `Task Completed: ${task.title}`,
      priority: 'normal',
      isRead: false,
      attachmentIds: [],
      isArchived: false,
      isDeleted: false,
      tags: ['task', 'completed'],
      createdAt: Date.now()
    });
  }
});
```

### Pattern 3: Batch Send Messages

```typescript
export const sendBulkMessage = mutation({
  args: {
    recipientIds: v.array(v.string()),
    content: v.string(),
    subject: v.string()
  },
  async handler(ctx, args) {
    const now = Date.now();

    for (const recipientId of args.recipientIds) {
      await ctx.db.insert('messages', {
        senderId: 'admin',
        recipientId,
        content: args.content,
        subject: args.subject,
        priority: 'normal',
        isRead: false,
        attachmentIds: [],
        isArchived: false,
        isDeleted: false,
        tags: ['broadcast'],
        createdAt: now
      });
    }
  }
});
```

## Error Handling

```typescript
import { toast } from 'sonner';

async function safeSendMessage(content: string, recipientId: string) {
  try {
    if (!content.trim()) {
      throw new Error('Message cannot be empty');
    }

    if (!recipientId) {
      throw new Error('Recipient not specified');
    }

    await sendMessage({
      recipientId,
      content,
      subject: 'Message'
    });

    toast.success('Message sent');
  } catch (error) {
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error('Failed to send message');
    }
  }
}
```

## Performance Tips

1. **Use limit parameter** for large queries

```typescript
const messages = await getInbox({ limit: 20 }); // Paginate
```

2. **Filter early** to reduce data

```typescript
const tasks = await getAssignedTasks({
  status: 'pending' // Filter by status server-side
});
```

3. **Sort server-side** when possible

```typescript
const tasks = await getAssignedTasks({
  sortBy: 'dueDate' // Sorted in Convex
});
```

4. **Search strategically**

```typescript
const results = await getInbox({
  searchQuery: 'important',
  limit: 50
});
```

## Debugging

### Check if messages are stored

```typescript
const allMessages = await ctx.db.query('messages').collect();
console.debug('Total messages:', allMessages.length);
```

### Verify task creation

```typescript
const tasks = await ctx.db.query('tasks').collect();
console.debug('Tasks:', tasks);
```

### Test notification preferences

```typescript
const prefs = await getNotificationPreferences();
console.debug('Email enabled:', prefs.emailEnabled);
console.debug('SMS enabled:', prefs.smsEnabled);
```

## Integration with Existing Systems

### Link to Sales

```typescript
const taskId = await createTask({
  title: `Process sale #${saleId}`,
  relatedEntityType: 'sale',
  relatedEntityId: saleId,
  assigneeId: processerId,
  priority: 'high'
});
```

### Link to Purchases

```typescript
const taskId = await createTask({
  title: `Verify purchase order #${poId}`,
  relatedEntityType: 'purchase',
  relatedEntityId: poId,
  assigneeId: verifierId
});
```

### Link to Inventory

```typescript
const taskId = await createTask({
  title: `Audit inventory for ${productId}`,
  relatedEntityType: 'product',
  relatedEntityId: productId,
  assigneeId: auditorId
});
```

## API Reference

See `COMMUNICATION_HUB_GUIDE.md` for detailed API documentation.
