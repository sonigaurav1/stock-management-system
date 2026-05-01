'use client';

import React, { useState } from 'react';
import { Play, Clock, BookOpen } from 'lucide-react';

interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  youtubeId?: string;
  thumbnailUrl?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const TUTORIALS: VideoTutorial[] = [
  {
    id: '1',
    title: '5-Minute Setup: Getting Started',
    description:
      'Follow along as we set up your inventory system from scratch. Add your first products, suppliers, and record your first sale.',
    duration: '5:00',
    category: 'Getting Started',
    difficulty: 'beginner',
    youtubeId: 'dQw4w9WgXcQ' // Placeholder: Replace with actual video
  },
  {
    id: '2',
    title: 'Understanding Profit & Loss',
    description:
      'Learn how to read your P&L report and understand where your profits come from. Know what products are most profitable.',
    duration: '8:30',
    category: 'Profit & Loss',
    difficulty: 'beginner',
    youtubeId: 'dQw4w9WgXcQ'
  },
  {
    id: '3',
    title: 'Cash Flow Mastery',
    description:
      'Discover why cash flow matters more than profit. Learn to manage receivables, payables, and stay liquid.',
    duration: '10:15',
    category: 'Cash Flow',
    difficulty: 'beginner',
    youtubeId: 'dQw4w9WgXcQ'
  },
  {
    id: '4',
    title: 'Pricing Strategy for Maximum Profit',
    description:
      'Find your optimal price point. Learn margin analysis and how small price increases drive big profit gains.',
    duration: '7:45',
    category: 'Profit & Loss',
    difficulty: 'intermediate',
    youtubeId: 'dQw4w9WgXcQ'
  },
  {
    id: '5',
    title: 'Inventory Optimization Tactics',
    description:
      'Master inventory levels, stock rotation, and the 80/20 rule. Keep only what sells and avoid dead stock.',
    duration: '9:20',
    category: 'Operations',
    difficulty: 'intermediate',
    youtubeId: 'dQw4w9WgXcQ'
  },
  {
    id: '6',
    title: 'Collecting Overdue Invoices',
    description:
      'Proven strategies to collect money from late-paying customers without damaging relationships. Follow-up templates included.',
    duration: '6:50',
    category: 'Cash Flow',
    difficulty: 'beginner',
    youtubeId: 'dQw4w9WgXcQ'
  }
];

interface VideoTutorialsProps {
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export const VideoTutorials: React.FC<VideoTutorialsProps> = ({
  category,
  difficulty
}) => {
  const [selectedVideo, setSelectedVideo] = useState<VideoTutorial | null>(
    null
  );

  const categories = Array.from(new Set(TUTORIALS.map((t) => t.category)));

  const filteredTutorials = TUTORIALS.filter((tutorial) => {
    const matchesCategory = !category || tutorial.category === category;
    const matchesDifficulty = !difficulty || tutorial.difficulty === difficulty;
    return matchesCategory && matchesDifficulty;
  });

  if (selectedVideo) {
    return (
      <div className='space-y-4'>
        <button
          onClick={() => setSelectedVideo(null)}
          className='text-sm font-semibold text-blue-600 hover:text-blue-800'
        >
          ← Back to Tutorials
        </button>

        <div className='rounded-lg border border-gray-200 bg-white p-6'>
          <div className='mb-6 aspect-video w-full overflow-hidden rounded-lg bg-gradient-to-br from-gray-200 to-gray-300'>
            {selectedVideo.youtubeId ? (
              <iframe
                width='100%'
                height='100%'
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}`}
                title={selectedVideo.title}
                frameBorder='0'
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                allowFullScreen
              ></iframe>
            ) : (
              <div className='flex h-full items-center justify-center text-gray-500'>
                <Play className='h-12 w-12' />
              </div>
            )}
          </div>

          <div className='space-y-3'>
            <h2 className='text-2xl font-bold text-gray-900'>
              {selectedVideo.title}
            </h2>

            <div className='flex flex-wrap gap-2'>
              <span className='inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700'>
                <BookOpen className='h-3 w-3' />
                {selectedVideo.category}
              </span>
              <span className='inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700'>
                <Clock className='h-3 w-3' />
                {selectedVideo.duration}
              </span>
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                  selectedVideo.difficulty === 'beginner'
                    ? 'bg-green-100 text-green-700'
                    : selectedVideo.difficulty === 'intermediate'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                }`}
              >
                {selectedVideo.difficulty.charAt(0).toUpperCase() +
                  selectedVideo.difficulty.slice(1)}
              </span>
            </div>

            <p className='leading-relaxed text-gray-700'>
              {selectedVideo.description}
            </p>

            {/* Video Resources */}
            <div className='mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4'>
              <p className='text-sm font-semibold text-blue-900'>
                💡 This video teaches:
              </p>
              <ul className='mt-2 list-inside list-disc space-y-1 text-sm text-blue-900'>
                <li>Clear, step-by-step instructions</li>
                <li>Real-world examples relevant to your business</li>
                <li>Actionable takeaways you can apply today</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Category Filter */}
      <div className='flex flex-wrap gap-2'>
        <button className='rounded-full border-2 border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-blue-500 hover:text-blue-600'>
          All Tutorials
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            className='rounded-full border-2 border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-blue-500 hover:text-blue-600'
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tutorials Grid */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {filteredTutorials.map((tutorial) => (
          <button
            key={tutorial.id}
            onClick={() => setSelectedVideo(tutorial)}
            className='overflow-hidden rounded-lg border border-gray-200 transition-all hover:border-blue-400 hover:shadow-lg'
          >
            {/* Thumbnail */}
            <div className='relative aspect-video overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300'>
              <div className='absolute inset-0 flex items-center justify-center bg-black/20 transition-all group-hover:bg-black/40'>
                <Play className='h-12 w-12 text-white' />
              </div>
              <span className='absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs font-semibold text-white'>
                {tutorial.duration}
              </span>
            </div>

            {/* Content */}
            <div className='p-4'>
              <h3 className='mb-2 line-clamp-2 font-semibold text-gray-900'>
                {tutorial.title}
              </h3>
              <p className='mb-3 line-clamp-2 text-sm text-gray-600'>
                {tutorial.description}
              </p>

              <div className='flex flex-wrap gap-2'>
                <span className='inline-block rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700'>
                  {tutorial.category}
                </span>
                <span
                  className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
                    tutorial.difficulty === 'beginner'
                      ? 'bg-green-50 text-green-700'
                      : tutorial.difficulty === 'intermediate'
                        ? 'bg-yellow-50 text-yellow-700'
                        : 'bg-red-50 text-red-700'
                  }`}
                >
                  {tutorial.difficulty.charAt(0).toUpperCase() +
                    tutorial.difficulty.slice(1)}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {filteredTutorials.length === 0 && (
        <div className='rounded-lg bg-gray-50 p-12 text-center'>
          <p className='text-gray-600'>No tutorials found in this category.</p>
        </div>
      )}
    </div>
  );
};
