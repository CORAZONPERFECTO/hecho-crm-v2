
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface UsersSearchProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
}

const UsersSearch: React.FC<UsersSearchProps> = ({ searchTerm, onSearchTermChange }) => {
  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input
            placeholder="Buscar usuarios por nombre o email..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="pl-10 border-gray-200 focus:border-blue-300"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default UsersSearch;
