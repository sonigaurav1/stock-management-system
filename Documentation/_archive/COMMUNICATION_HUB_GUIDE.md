# Communication Hub - Feature Documentation

## Overview

The Communication Hub (v4.3) is a comprehensive messaging, task assignment, and notification management system designed for team collaboration and inventory business operations.

## Components

### 1. **In-App Messaging** 📬

Secure, real-time communication between team members.

**Features:**

- Send and receive messages
- Message threading and replies
- Priority levels (normal, high)
- Message search and filtering
- Message archiving and deletion
- Unread message indicators
- Read receipts

**API Functions:**

```typescript
// Send message
await sendMessage({
  recipientId: 'user_123',
  content: 'Message content',
  subject: 'Subject line',
  priority: 'normal',
  tags: ['important']
});

// Get inbox
const messages = await getInbox({
  filter: 'unread', // "all" | "unread" | "archived"
  searchQuery: 'search text',
  limit: 50
});

// Mark as read
await markAsRead({ messageId });

// Archive message
await archiveMessage({ messageId });

// Get message thread
const thread = await getMessageThread({ messageId });
```

**Database Schema:**

```
messages {
  senderId: string
  recipientId: string
  content: string
  subject?: string
  isRead: boolean
  priority: "low" | "normal" | "high"
  replyToId?: Id<messages>
  tags: string[]
  isArchived: boolean
  isDeleted: boolean
  createdAt: number
}
```

### 2. **Task Assignment** ✅

Assign, track, and manage team tasks with full lifecycle management.

**Features:**

- Create and assign tasks
- Multiple priority levels
- Due date tracking
- Status tracking (assigned → in_progress → completed)
- Task comments and discussions
- Task statistics dashboard
- Overdue task alerts
- Related entity linking (links to sales, purchases, etc.)

**API Functions:**

```typescript
// Create task
const taskId = await createTask({
  title: 'Task name',
  description: 'Task details',
  assigneeId: 'user_123',
  priority: 'high', // "low" | "medium" | "high" | "urgent"
  dueDate: Date.now() + 86400000, // 24 hours from now
  tags: ['inventory', 'urgent'],
  notifyAssignee: true // Send notification message
});

// Get assigned tasks
const tasks = await getAssignedTasks({
  status: 'assigned', // "assigned" | "in_progress" | "completed"
  sortBy: 'dueDate' // "dueDate" | "priority" | "createdAt"
});

// Update task status
await updateTaskStatus({
  taskId,
  status: 'in_progress'
});

// Add comment
const commentId = await addTaskComment({
  taskId,
  content: 'Progress update...'
});

// Get task stats
const stats = await getTaskStats(); // Returns: total, assigned, inProgress, completed, overdue, high_priority
```

**Database Schema:**

```
tasks {
  title: string
  description?: string
  assigneeId: string
  assignorId: string
  status: "assigned" | "in_progress" | "completed" | "cancelled"
  priority: "low" | "medium" | "high" | "urgent"
  dueDate?: number
  completedAt?: number
  relatedEntityType?: string // "sale", "purchase", "inventory"
  relatedEntityId?: string
  tags: string[]
  isDeleted: boolean
  createdAt: number
}

taskComments {
  taskId: Id<tasks>
  authorId: string
  content: string
  isEdited: boolean
  editedAt?: number
  isDeleted: boolean
  createdAt: number
}
```

### 3. **Notification Management** 🔔

Centralized notification preferences and multi-channel delivery.

**Features:**

- **Channels:**

  - In-app notifications (inbox)
  - Email notifications
  - SMS alerts
  - Slack integration

- **Notification Types:**

  - Task assigned
  - Task completed
  - Message received
  - Low stock alerts
  - Payment due reminders
  - Report ready
  - System alerts

- **User Controls:**
  - Enable/disable channels
  - Enable/disable notification types
  - Quiet hours (pause notifications during specified times)
  - Phone number for SMS
  - Slack workspace integration

**API Functions:**

```typescript
// Get preferences
const prefs = await getNotificationPreferences();

// Update channel preferences
await updateChannelPreferences({
  emailEnabled: true,
  smsEnabled: false,
  slackEnabled: true,
  inAppEnabled: true
});

// Update notification types
await updateNotificationTypes({
  taskAssigned: true,
  messageReceived: true,
  lowStock: false
});

// Set quiet hours
await setQuietHours({
  enabled: true,
  startTime: '18:00', // HH:mm format
  endTime: '09:00',
  timezone: 'America/New_York'
});

// Add phone for SMS
await addPhoneNumber({ phoneNumber: '+1234567890' });

// Connect Slack
await connectSlackWorkspace({
  workspaceId: 'workspace_123',
  userId: 'slack_user_123'
});

// Check if should notify
const { shouldNotify, reason } = await shouldNotify({
  notificationType: 'taskAssigned'
});

// Test notification channel
await testNotificationChannel({ channel: 'email' });
```

**Database Schema:**

```
notificationPreferences {
  userId: string
  emailEnabled: boolean
  smsEnabled: boolean
  slackEnabled: boolean
  inAppEnabled: boolean
  notificationTypes: {
    taskAssigned: boolean
    taskCompleted: boolean
    messageReceived: boolean
    lowStock: boolean
    paymentDue: boolean
    reportReady: boolean
    systemAlert: boolean
  }
  quietHours?: {
    enabled: boolean
    startTime: string
    endTime: string
    timezone?: string
  }
  slackWorkspaceId?: string
  slackUserId?: string
  phoneNumber?: string
  createdAt: number
  updatedAt: number
}
```

## UI Components

### Message Inbox (`MessageInbox.tsx`)

- Display received messages
- Search and filter messages
- Mark as read/unread
- Reply to messages
- Archive messages

### Message Thread (`MessageThread.tsx`)

- View full message thread
- Reply to messages
- Display sender/recipient info
- Show message history

### Task List (`TaskList.tsx`)

- View all assigned tasks
- Filter by status and priority
- Sort by due date, priority, or creation date
- Update task status
- Delete tasks
- Display task statistics

### Task Assigner (`TaskAssigner.tsx`)

- Create new task modal
- Select assignee
- Set priority and due date
- Add tags
- Add description
- Automatic notification on assignment

### Notification Settings (`NotificationSettings.tsx`)

- Toggle notification channels
- Configure notification types
- Set quiet hours
- Add SMS phone number
- Connect Slack workspace
- Test notification channels

## UI Routes

```
/communication                    # Main hub (tabbed interface)
  /inbox                         # Message inbox
  /tasks                         # Task management
  /notifications                 # Notification settings
```

## Integration Points

### 1. Existing Services

- **Email:** Via `convex/lib/email.ts`
- **SMS:** Via `convex/lib/sms.ts`
- **Slack:** Via `convex/lib/slack.ts`

### 2. Team Management

- Links to `teamManagement.ts` for user/role context
- Permission checks for task assignment
- Team member discovery for assignee selection

### 3. Inventory & Business Features

- Task linking to sales, purchases, inventory items
- Low stock alerts integration
- Payment due notifications
- Report completion alerts

## Notification Flow

```
User Action (e.g., task assigned)
    ↓
Create Message in DB
    ↓
Check notificationPreferences
    ↓
Check shouldNotify (type enabled? quiet hours?)
    ↓
Dispatch via enabled channels:
  ├─ In-app: Create message notification
  ├─ Email: Send via /lib/email.ts
  ├─ SMS: Send via /lib/sms.ts
  └─ Slack: Send via /lib/slack.ts
```

## Best Practices

### 1. Task Assignment

```typescript
// Always notify assignee
const taskId = await createTask({
  title: 'Review stock levels',
  assigneeId: 'user_assigned',
  priority: 'high',
  dueDate: Date.now() + 86400000,
  notifyAssignee: true // Enable notification
});
```

### 2. Messaging

```typescript
// Use tags for organization
await sendMessage({
  recipientId: 'user_123',
  content: 'Stock update...',
  tags: ['inventory', 'urgent', 'stock']
});
```

### 3. Notification Preferences

```typescript
// Users should be able to configure:
// 1. Which channels to use
// 2. Which notification types matter
// 3. Quiet hours for their timezone
```

## Future Enhancements

1. **Message Attachments:** Add file upload to messages
2. **Group Messages:** Message multiple users at once
3. **Task Automation:** Auto-create tasks from business events
4. **Bulk Notifications:** Send notifications to multiple users
5. **Read Receipts:** Show when messages are read
6. **Message Reactions:** Emoji reactions to messages
7. **Task Templates:** Pre-defined task templates
8. **Notification History:** Archive of all notifications sent
9. **Smart Scheduling:** Intelligently schedule notifications
10. **Machine Learning:** Predict notification preferences

## Troubleshooting

### Messages Not Showing

- Check if recipient is correct
- Verify `isDeleted: false` in query
- Check read status filters

### Tasks Not Sending Notifications

- Verify `notifyAssignee: true` in createTask
- Check notification preferences
- Verify user ID format matches Clerk identity

### Quiet Hours Not Working

- Verify timezone configuration
- Check start/end time format (HH:mm)
- Ensure quiet hours are enabled

## Code Examples

### Implement in Business Logic

```typescript
// Example: Auto-create task for low stock alert
import { sendLowStockNotification } from './notifications';

export const checkStockLevels = mutation({
  async handler(ctx) {
    const products = await ctx.db.query('products').collect();

    for (const product of products) {
      if (product.stockLevel < product.reorderLevel) {
        // Create task for admin
        await ctx.db.insert('tasks', {
          title: `Restock: ${product.name}`,
          description: `Current stock: ${product.stockLevel}`,
          assigneeId: 'admin_user_id',
          assignorId: 'system',
          priority: 'high',
          status: 'assigned',
          relatedEntityType: 'product',
          relatedEntityId: product._id,
          createdAt: Date.now(),
          isDeleted: false,
          tags: ['restock', 'inventory']
        });
      }
    }
  }
});
```

## Security Considerations

1. **Authentication:** All mutations require authenticated user (Clerk)
2. **Authorization:** Users can only read their own messages/tasks
3. **Soft Deletes:** All deletes are soft (isDeleted flag)
4. **Data Privacy:** Phone numbers and Slack IDs stored securely
5. **Rate Limiting:** Consider adding rate limits for message spam

## Performance

- Messages indexed by `recipientId` and `senderId`
- Tasks indexed by `assigneeId`, `assignorId`, and `status`
- Query results paginated by default (use `limit` parameter)
- Sort operations done in-memory for flexibility

## Testing Checklist

- [ ] Create and send messages
- [ ] Reply to messages (threading)
- [ ] Mark messages as read/archived
- [ ] Create and assign tasks
- [ ] Update task status
- [ ] Add task comments
- [ ] Configure notification channels
- [ ] Test quiet hours
- [ ] Test SMS phone number
- [ ] Test Slack integration
- [ ] Test notification type filtering
