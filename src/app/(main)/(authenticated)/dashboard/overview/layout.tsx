import OverviewPage from '@/features/overview/components/OverviewPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard: Overview',
  description:
    'View your business analytics and performance metrics at a glance'
};

export default function OverViewLayout({
  sales,
  pie_stats,
  bar_stats,
  area_stats
}: {
  sales: React.ReactNode;
  pie_stats: React.ReactNode;
  bar_stats: React.ReactNode;
  area_stats: React.ReactNode;
}) {
  return (
    <OverviewPage
      sales={sales}
      pie_stats={pie_stats}
      bar_stats={bar_stats}
      area_stats={area_stats}
    />
  );
}
