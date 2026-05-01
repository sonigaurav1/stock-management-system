'use client';

import React, { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Settings, GripVertical, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { WIDGET_CONFIGS } from '@/types/dashboard';
import type { Widget } from '@/types/dashboard';
import { useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { useToast } from '@/hooks/use-toast';

interface SortableWidgetItemProps {
  widget: Widget;
  onVisibilityChange?: (visible: boolean) => void;
}

function SortableWidgetItem({
  widget,
  onVisibilityChange
}: SortableWidgetItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-lg border p-3 ${
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-muted hover:border-muted-foreground/50'
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className='cursor-grab active:cursor-grabbing'
      >
        <GripVertical className='h-4 w-4 text-muted-foreground' />
      </button>

      <div className='flex-1'>
        <h4 className='text-sm font-medium'>{widget.title}</h4>
        <p className='text-xs text-muted-foreground'>
          {widget.config?.description}
        </p>
      </div>

      <Switch
        checked={widget.isVisible}
        onCheckedChange={onVisibilityChange}
        aria-label={`Toggle ${widget.title}`}
      />
    </div>
  );
}

interface DashboardCustomizerProps {
  widgets: Widget[];
  onSave?: (newOrder: string[]) => void;
  onWidgetVisibilityChange?: (widgetId: string, isVisible: boolean) => void;
}

export function DashboardCustomizer({
  widgets,
  onSave,
  onWidgetVisibilityChange
}: DashboardCustomizerProps) {
  const [open, setOpen] = useState(false);
  const [localWidgets, setLocalWidgets] = useState<Widget[]>(widgets);
  const [isSaving, setIsSaving] = useState(false);

  const { toast } = useToast();
  const reorderWidgetsMutation = useMutation(
    api.dashboardConfig.reorderWidgets
  );
  const updateVisibilityMutation = useMutation(
    api.dashboardConfig.updateWidgetVisibility
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localWidgets.findIndex((w) => w.id === active.id);
      const newIndex = localWidgets.findIndex((w) => w.id === over.id);

      setLocalWidgets(arrayMove(localWidgets, oldIndex, newIndex));
    }
  };

  const handleVisibilityChange = (widgetId: string, isVisible: boolean) => {
    setLocalWidgets(
      localWidgets.map((w) => (w.id === widgetId ? { ...w, isVisible } : w))
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const widgetOrder = localWidgets.map((w) => w.id);
      await reorderWidgetsMutation({ widgetOrder });

      // Update visibility for changed widgets
      for (const widget of localWidgets) {
        const original = widgets.find((w) => w.id === widget.id);
        if (original && original.isVisible !== widget.isVisible) {
          await updateVisibilityMutation({
            widgetId: widget.id,
            isVisible: widget.isVisible
          });
        }
      }

      toast({
        title: 'Dashboard Updated',
        description: 'Your dashboard customization has been saved.'
      });

      onSave?.(widgetOrder);
      setOpen(false);
    } catch (error) {
      toast({
        title: 'Failed to Save',
        description:
          error instanceof Error ? error.message : 'Failed to save changes',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const visibleCount = localWidgets.filter((w) => w.isVisible).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm' className='gap-2'>
          <Settings className='h-4 w-4' />
          Customize
        </Button>
      </DialogTrigger>

      <DialogContent className='max-h-[80vh] max-w-lg overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Customize Dashboard</DialogTitle>
          <DialogDescription>
            Reorder widgets using drag and drop. Toggle visibility to show or
            hide widgets. ({visibleCount} visible)
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground'>
            <strong>Tip:</strong> Drag widgets to reorder them. Use the toggle
            to show/hide widgets.
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={localWidgets.map((w) => w.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className='space-y-2'>
                {localWidgets.map((widget) => (
                  <SortableWidgetItem
                    key={widget.id}
                    widget={widget}
                    onVisibilityChange={(visible) =>
                      handleVisibilityChange(widget.id, visible)
                    }
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <Card className='border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm'>Widget Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 text-xs text-blue-700 dark:text-blue-300'>
              <p>• Widgets are sized responsively for different screen sizes</p>
              <p>• Mobile devices will show widgets in a single column</p>
              <p>• Your preferences are saved automatically</p>
            </CardContent>
          </Card>

          <div className='flex justify-end gap-2'>
            <Button
              variant='outline'
              onClick={() => setOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
