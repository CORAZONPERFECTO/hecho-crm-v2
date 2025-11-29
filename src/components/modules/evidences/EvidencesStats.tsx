
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, FileImage, Video, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface EvidencesStatsProps {
  ticketFilter?: string;
}

const EvidencesStats: React.FC<EvidencesStatsProps> = ({ ticketFilter }) => {
  const [stats, setStats] = useState({
    total: 0,
    images: 0,
    videos: 0,
    recent: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [ticketFilter]);

  const fetchStats = async () => {
    try {
      let query = supabase
        .from('ticket_evidences')
        .select('*');

      if (ticketFilter && ticketFilter !== 'all') {
        query = query.eq('ticket_id', ticketFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      const evidences = data || [];
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      setStats({
        total: evidences.length,
        images: evidences.filter(e => e.file_type.startsWith('image/')).length,
        videos: evidences.filter(e => e.file_type.startsWith('video/')).length,
        recent: evidences.filter(e => new Date(e.created_at) >= weekAgo).length
      });
    } catch (error) {
      console.error('Error fetching evidence stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="h-16 bg-gray-200 animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Evidencias',
      value: stats.total,
      icon: Camera,
      color: 'text-blue-600'
    },
    {
      title: 'Imágenes',
      value: stats.images,
      icon: FileImage,
      color: 'text-green-600'
    },
    {
      title: 'Videos',
      value: stats.videos,
      icon: Video,
      color: 'text-purple-600'
    },
    {
      title: 'Esta Semana',
      value: stats.recent,
      icon: Calendar,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <stat.icon className={`${stat.color} h-8 w-8`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EvidencesStats;
