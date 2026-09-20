'use client';

import { useState, useRef } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  MessageSquare,
  Upload,
  X,
  Image as ImageIcon,
  Star,
  Send,
  Sparkles,
  Bug,
  TrendingUp,
  CheckCircle2,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useEdgeStore } from '@/lib/edgestore';

interface CategoryConfig {
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  titlePlaceholder: string;
  mainLabel: string;
  mainDescription: string;
  mainPlaceholder: string;
  subLabel: string;
  subDescription: string;
  subPlaceholder: string;
  mainPrefix: string;
  subPrefix: string;
}

const CATEGORY_CONFIGS: Record<string, CategoryConfig> = {
  bug: {
    icon: Bug,
    color: 'text-red-500 dark:text-red-400',
    bgColor: 'bg-red-500/5 dark:bg-red-950/20',
    borderColor: 'border-red-500/20',
    titlePlaceholder: 'e.g., CSV export button throws error on Safari',
    mainLabel: 'Bug Description & Steps to Reproduce *',
    mainDescription:
      'Describe what went wrong and step-by-step instructions to reproduce the issue.',
    mainPlaceholder:
      '1. Navigate to billing page\n2. Click Export CSV\n3. Error "Uncaught TypeError" appears in console...',
    subLabel: 'Expected Behavior (Optional)',
    subDescription: 'What did you expect to happen instead?',
    subPlaceholder: 'The CSV file should download immediately without errors.',
    mainPrefix: '🐛 Bug Details & Reproduction:',
    subPrefix: '📝 Expected Behavior:'
  },
  feature: {
    icon: Sparkles,
    color: 'text-indigo-500 dark:text-indigo-400',
    bgColor: 'bg-indigo-500/5 dark:bg-indigo-950/20',
    borderColor: 'border-indigo-500/20',
    titlePlaceholder: 'e.g., Add automated low-stock SMS alert to suppliers',
    mainLabel: 'Feature Request Details *',
    mainDescription:
      'Describe the feature you would like to see in Invento and how it should work.',
    mainPlaceholder:
      'We would love to have automated SMS notifications sent to suppliers when stock falls below reorder level...',
    subLabel: 'Business Impact (Optional)',
    subDescription:
      'How would this feature help your daily business operations?',
    subPlaceholder:
      'It would prevent stock-outs and save 3 hours of manual email orders every week.',
    mainPrefix: '✨ Feature Description:',
    subPrefix: '💡 Business Impact:'
  },
  improvement: {
    icon: TrendingUp,
    color: 'text-emerald-500 dark:text-emerald-400',
    bgColor: 'bg-emerald-500/5 dark:bg-emerald-950/20',
    borderColor: 'border-emerald-500/20',
    titlePlaceholder:
      'e.g., Speed up barcode scanning and search auto-complete',
    mainLabel: 'Improvement Suggestion *',
    mainDescription:
      'Share your idea for improving performance, UI layout, or system responsiveness.',
    mainPlaceholder:
      "The barcode scanner modal could auto-focus the input field so users don't need to click it first...",
    subLabel: 'Current Limitations (Optional)',
    subDescription: 'What part of the current system feels slow or clunky?',
    subPlaceholder:
      'Having to manually click into the barcode text box slows down warehouse scanning.',
    mainPrefix: '📈 Improvement Idea:',
    subPrefix: '⚠️ Current Limitation:'
  },
  feedback: {
    icon: CheckCircle2,
    color: 'text-green-500 dark:text-green-400',
    bgColor: 'bg-green-500/5 dark:bg-green-950/20',
    borderColor: 'border-green-500/20',
    titlePlaceholder: 'e.g., Love the new analytics overview dashboard',
    mainLabel: 'What is working well? *',
    mainDescription:
      'Tell us about features or workflows that you enjoy using in Invento.',
    mainPlaceholder:
      'The new dashboard overview charts are super clean and help us track monthly revenue effortlessly...',
    subLabel: 'Additional Thoughts or Suggestions (Optional)',
    subDescription: 'Any other comments or feedback for our team?',
    subPlaceholder:
      'Keep up the great work! Looking forward to future updates.',
    mainPrefix: "✅ What's Working Well:",
    subPrefix: '💬 Additional Thoughts:'
  },
  other: {
    icon: HelpCircle,
    color: 'text-amber-500 dark:text-amber-400',
    bgColor: 'bg-amber-500/5 dark:bg-amber-950/20',
    borderColor: 'border-amber-500/20',
    titlePlaceholder:
      'e.g., Question about API limits or custom role permissions',
    mainLabel: 'Question or Inquiry Details *',
    mainDescription:
      'Ask your question or describe what you need assistance with.',
    mainPlaceholder:
      'We have a question regarding custom roles and whether staff members can view reports...',
    subLabel: 'Additional Context (Optional)',
    subDescription: 'Provide any account, organization, or technical context.',
    subPlaceholder:
      'We are currently on the Professional plan with 5 team members.',
    mainPrefix: '❓ Inquiry Details:',
    subPrefix: '📝 Additional Context:'
  }
};

interface FeedbackFormProps {
  onSubmitSuccess?: () => void;
  inline?: boolean;
}

export function FeedbackForm({
  onSubmitSuccess,
  inline = false
}: FeedbackFormProps) {
  const { user } = useUser();
  const { edgestore } = useEdgeStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('feedback');
  const [title, setTitle] = useState('');
  const [emailInput, setEmailInput] = useState(
    user?.emailAddresses[0]?.emailAddress || ''
  );
  const [mainContent, setMainContent] = useState('');
  const [subContent, setSubContent] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createFeedback = useMutation(api.feedback.createFeedback);

  const activeConfig = CATEGORY_CONFIGS[category] || CATEGORY_CONFIGS.feedback;
  const CategoryIcon = activeConfig.icon;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    setImageFile(file);
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a feedback title');
      return;
    }

    if (!mainContent.trim()) {
      toast.error(
        `Please fill in the ${activeConfig.mainLabel.replace('*', '').trim()}`
      );
      return;
    }

    setLoading(true);

    try {
      let imageUrl: string | undefined;

      if (imageFile && edgestore) {
        setUploadingImage(true);
        try {
          const response = await edgestore.publicFiles.upload({
            file: imageFile
          });
          imageUrl = response.url;
        } catch (error) {
          console.error('Error uploading image:', error);
          toast.error(
            'Failed to upload attachment, submitting feedback text...'
          );
        } finally {
          setUploadingImage(false);
        }
      }

      // Format message with dynamic category prefixes
      const messageParts = [
        `${activeConfig.mainPrefix}\n${mainContent.trim()}`
      ];
      if (subContent.trim()) {
        messageParts.push(`${activeConfig.subPrefix}\n${subContent.trim()}`);
      }

      const userEmail =
        emailInput.trim() ||
        user?.emailAddresses[0]?.emailAddress ||
        'user@example.com';

      await createFeedback({
        title: title.trim(),
        message: messageParts.join('\n\n'),
        category,
        rating,
        email: userEmail,
        attachmentUrl: imageUrl
      });

      toast.success('Thank you! Your feedback has been submitted to the team.');

      // Reset Form State
      setTitle('');
      setMainContent('');
      setSubContent('');
      setCategory('feedback');
      setRating(5);
      removeImage();

      setDialogOpen(false);
      onSubmitSuccess?.();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {/* Category and Rating Header Bar */}
      <div className='grid gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <label className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
            Feedback Category
          </label>
          <Select
            value={category}
            onValueChange={(val) => {
              setCategory(val);
            }}
            disabled={loading || uploadingImage}
          >
            <SelectTrigger className='w-full border-border bg-background text-foreground'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='bug'>🐛 Bug Report</SelectItem>
              <SelectItem value='feature'>✨ Feature Request</SelectItem>
              <SelectItem value='improvement'>📈 System Improvement</SelectItem>
              <SelectItem value='feedback'>💬 General Feedback</SelectItem>
              <SelectItem value='other'>❓ Other Question</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <label className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
            Your Rating
          </label>
          <div className='flex items-center gap-1.5 pt-1'>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type='button'
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className='p-1 transition-transform hover:scale-110 focus:outline-none'
              >
                <Star
                  className={`h-6 w-6 transition-colors ${
                    star <= (hoverRating || rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-muted-foreground/30'
                  }`}
                />
              </button>
            ))}
            <span className='ml-2 font-mono text-xs font-semibold text-muted-foreground'>
              {rating} / 5
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Title & Email */}
      <div className='grid gap-4 md:grid-cols-2'>
        <div className='space-y-2 md:col-span-1'>
          <label className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
            Title *
          </label>
          <Input
            placeholder={activeConfig.titlePlaceholder}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading || uploadingImage}
            className='border-border bg-background'
            required
          />
        </div>

        <div className='space-y-2 md:col-span-1'>
          <label className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
            Your Email Address
          </label>
          <Input
            type='email'
            placeholder='your.email@company.com'
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            disabled={loading || uploadingImage}
            className='border-border bg-background font-mono text-xs'
          />
        </div>
      </div>

      {/* DYNAMIC CARD 1: Main Category Field */}
      <Card
        className={`border ${activeConfig.borderColor} ${activeConfig.bgColor} shadow-none transition-all`}
      >
        <CardHeader className='px-4 pb-2 pt-4'>
          <CardTitle
            className={`flex items-center gap-2 text-sm font-semibold ${activeConfig.color}`}
          >
            <CategoryIcon className='h-4 w-4' />
            {activeConfig.mainLabel}
          </CardTitle>
          <CardDescription className='text-xs text-muted-foreground'>
            {activeConfig.mainDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className='px-4 pb-4'>
          <Textarea
            placeholder={activeConfig.mainPlaceholder}
            value={mainContent}
            onChange={(e) => setMainContent(e.target.value)}
            disabled={loading || uploadingImage}
            rows={3}
            className='resize-none border-border bg-background/90 text-sm'
            required
          />
        </CardContent>
      </Card>

      {/* DYNAMIC CARD 2: Secondary Category Field */}
      <Card className='border border-border/80 bg-muted/20 shadow-none transition-all'>
        <CardHeader className='px-4 pb-2 pt-4'>
          <CardTitle className='flex items-center gap-2 text-sm font-semibold text-foreground'>
            {activeConfig.subLabel}
          </CardTitle>
          <CardDescription className='text-xs text-muted-foreground'>
            {activeConfig.subDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className='px-4 pb-4'>
          <Textarea
            placeholder={activeConfig.subPlaceholder}
            value={subContent}
            onChange={(e) => setSubContent(e.target.value)}
            disabled={loading || uploadingImage}
            rows={3}
            className='resize-none border-border bg-background/90 text-sm'
          />
        </CardContent>
      </Card>

      {/* File Attachment Dropzone */}
      <div className='space-y-2'>
        <label className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
          Attach Screenshot (Optional)
        </label>
        {imagePreview ? (
          <div className='relative overflow-hidden rounded-lg border border-border bg-card p-2'>
            <img
              src={imagePreview}
              alt='Screenshot preview'
              className='max-h-48 w-full rounded-md object-contain'
            />
            <Button
              type='button'
              variant='destructive'
              size='sm'
              onClick={removeImage}
              disabled={loading || uploadingImage}
              className='mt-2 w-full text-xs'
            >
              <X className='mr-1.5 h-3.5 w-3.5' />
              Remove Image
            </Button>
          </div>
        ) : (
          <div
            className='flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center transition hover:bg-muted/40'
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className='h-8 w-8 text-muted-foreground/60' />
            <p className='mt-2 text-xs font-medium text-foreground'>
              Click to browse or drop screenshot
            </p>
            <p className='text-[11px] text-muted-foreground'>
              PNG, JPG up to 5MB
            </p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          onChange={handleImageSelect}
          disabled={loading || uploadingImage}
          className='hidden'
        />
      </div>

      {/* Submit Button */}
      <div className='flex justify-end gap-3 pt-2'>
        <Button
          type='submit'
          disabled={loading || uploadingImage}
          className='w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto'
        >
          {uploadingImage ? (
            <>
              <Upload className='h-4 w-4 animate-spin' />
              Uploading...
            </>
          ) : loading ? (
            <>Submitting Feedback...</>
          ) : (
            <>
              <Send className='h-4 w-4' />
              Submit Feedback
            </>
          )}
        </Button>
      </div>
    </form>
  );

  if (inline) {
    return formContent;
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className='gap-2 bg-primary text-primary-foreground shadow-glow hover:bg-primary/90'>
          <MessageSquare className='h-4 w-4' />
          Send Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto border-border bg-card text-card-foreground'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-lg font-bold'>
            <Sparkles className='h-5 w-5 text-primary' />
            Share Your Feedback
          </DialogTitle>
          <DialogDescription className='text-sm text-muted-foreground'>
            Select your feedback category below. Form fields will adapt
            dynamically to your selection.
          </DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
