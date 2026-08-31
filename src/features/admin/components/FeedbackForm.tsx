'use client';

import { useState, useRef } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
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
import { MessageSquare, Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useEdgeStore } from '@/lib/edgestore';

interface FeedbackFormProps {
  onSubmitSuccess?: () => void;
}

export function FeedbackForm({ onSubmitSuccess }: FeedbackFormProps) {
  const { user } = useUser();
  const { edgestore } = useEdgeStore();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [whatIsGood, setWhatIsGood] = useState('');
  const [whatNeedsImprovement, setWhatNeedsImprovement] = useState('');
  const [category, setCategory] = useState('feedback');
  const [rating, setRating] = useState(5);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createFeedback = useMutation(api.feedback.createFeedback);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    // Validate file type
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

    if (!user?.id) {
      toast.error('You must be logged in to submit feedback');
      return;
    }

    if (!title.trim() || (!whatIsGood.trim() && !whatNeedsImprovement.trim())) {
      toast.error('Please fill in the title and at least one feedback section');
      return;
    }

    setLoading(true);

    try {
      let imageUrl: string | undefined;

      // Upload image if selected
      if (imageFile) {
        setUploadingImage(true);
        try {
          const response = await edgestore.publicFiles.upload({
            file: imageFile
          });
          imageUrl = response.url;
        } catch (error) {
          console.error('Error uploading image:', error);
          toast.error('Failed to upload image');
          setLoading(false);
          setUploadingImage(false);
          return;
        }
        setUploadingImage(false);
      }

      // Combine feedback messages
      const message = [
        whatIsGood ? `✅ What's Good:\n${whatIsGood}` : '',
        whatNeedsImprovement
          ? `📝 What Needs Improvement:\n${whatNeedsImprovement}`
          : ''
      ]
        .filter(Boolean)
        .join('\n\n');

      await createFeedback({
        title: title.trim(),
        message: message,
        category,
        rating,
        email: user.emailAddresses[0]?.emailAddress,
        attachmentUrl: imageUrl
      });

      toast.success('Thank you! Your feedback has been submitted.');
      setOpen(false);
      setTitle('');
      setWhatIsGood('');
      setWhatNeedsImprovement('');
      setCategory('feedback');
      setRating(5);
      removeImage();
      onSubmitSuccess?.();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' className='gap-2'>
          <MessageSquare className='h-4 w-4' />
          Send Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className='max-h-[90vh] max-w-3xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Share Your Feedback</DialogTitle>
          <DialogDescription>
            Help us improve! Tell us what's working well and what needs
            improvement in the system.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Title */}
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Feedback Title *</label>
            <Input
              placeholder='e.g., "Dashboard loading is too slow" or "Love the new export feature!"'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading || uploadingImage}
            />
          </div>

          {/* Category and Rating Row */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Category</label>
              <Select
                value={category}
                onValueChange={setCategory}
                disabled={loading || uploadingImage}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='feature'>✨ Feature Request</SelectItem>
                  <SelectItem value='bug'>🐛 Bug Report</SelectItem>
                  <SelectItem value='improvement'>📈 Improvement</SelectItem>
                  <SelectItem value='feedback'>💬 General Feedback</SelectItem>
                  <SelectItem value='other'>❓ Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium'>Overall Experience</label>
              <Select
                value={rating.toString()}
                onValueChange={(v) => setRating(parseInt(v))}
                disabled={loading || uploadingImage}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='1'>⭐ Poor</SelectItem>
                  <SelectItem value='2'>⭐⭐ Fair</SelectItem>
                  <SelectItem value='3'>⭐⭐⭐ Good</SelectItem>
                  <SelectItem value='4'>⭐⭐⭐⭐ Very Good</SelectItem>
                  <SelectItem value='5'>⭐⭐⭐⭐⭐ Excellent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* What's Good Section */}
          <Card className='border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/30'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base text-green-700 dark:text-green-300'>
                ✅ What's Going Well?
              </CardTitle>
              <CardDescription className='text-xs'>
                Tell us about features or aspects you love
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder='e.g., "The inventory management is very intuitive..." or "The search functionality is super fast..."'
                value={whatIsGood}
                onChange={(e) => setWhatIsGood(e.target.value)}
                disabled={loading || uploadingImage}
                rows={3}
                className='resize-none'
              />
            </CardContent>
          </Card>

          {/* What Needs Improvement Section */}
          <Card className='border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/30'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base text-amber-700 dark:text-amber-300'>
                📝 What Needs Improvement?
              </CardTitle>
              <CardDescription className='text-xs'>
                Share any pain points or features you'd like to see
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder='e.g., "The report export takes too long..." or "It would be nice to have bulk import..."'
                value={whatNeedsImprovement}
                onChange={(e) => setWhatNeedsImprovement(e.target.value)}
                disabled={loading || uploadingImage}
                rows={3}
                className='resize-none'
              />
            </CardContent>
          </Card>

          {/* Image Upload Section */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base'>
                📎 Attach Screenshot or Image
              </CardTitle>
              <CardDescription className='text-xs'>
                Optional: Add a screenshot to help explain your feedback (max
                5MB)
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {imagePreview ? (
                <div className='relative space-y-2'>
                  <img
                    src={imagePreview}
                    alt='Preview'
                    className='max-h-48 w-full rounded-lg border object-cover'
                  />
                  <Button
                    type='button'
                    variant='destructive'
                    size='sm'
                    onClick={removeImage}
                    disabled={loading || uploadingImage}
                    className='w-full'
                  >
                    <X className='mr-2 h-4 w-4' />
                    Remove Image
                  </Button>
                </div>
              ) : (
                <div
                  className='cursor-pointer rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 text-center transition hover:border-primary'
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className='mx-auto h-8 w-8 text-muted-foreground/50' />
                  <p className='mt-2 text-sm font-medium'>
                    Click to upload or drag image
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    PNG, JPG, GIF up to 5MB
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
            </CardContent>
          </Card>

          {/* Info */}
          <div className='rounded-lg bg-blue-50 p-3 text-xs text-blue-800 dark:bg-blue-950 dark:text-blue-300'>
            💡 <strong>Tip:</strong> The more detail you provide, the better we
            can help improve the system!
          </div>

          {/* Buttons */}
          <div className='flex justify-end gap-2 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setOpen(false)}
              disabled={loading || uploadingImage}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={loading || uploadingImage}
              className='gap-2'
            >
              {uploadingImage ? (
                <>
                  <Upload className='h-4 w-4 animate-spin' />
                  Uploading Image...
                </>
              ) : loading ? (
                <>Submitting...</>
              ) : (
                <>
                  <MessageSquare className='h-4 w-4' />
                  Submit Feedback
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
