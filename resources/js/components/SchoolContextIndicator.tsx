import { Badge } from '@/components/ui/badge';
import { School, Globe } from 'lucide-react';

interface SchoolContextIndicatorProps {
    school?: {
        id: number;
        name: string;
        code: string;
    };
}

export default function SchoolContextIndicator({ school }: SchoolContextIndicatorProps) {
    if (!school) {
        return (
            <Badge variant="outline" className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                Platform Level
            </Badge>
        );
    }

    return (
        <Badge variant="default" className="flex items-center gap-1">
            <School className="h-3 w-3" />
            {school.name} ({school.code})
        </Badge>
    );
}



