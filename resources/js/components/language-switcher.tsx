import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, Check } from 'lucide-react';
import { router } from '@inertiajs/react';

interface LanguageSwitcherProps {
    currentLanguage: string;
    className?: string;
}

const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'sw', name: 'Kiswahili', flag: '🇹🇿' },
];

export default function LanguageSwitcher({ currentLanguage, className }: LanguageSwitcherProps) {
    const [isLoading, setIsLoading] = useState(false);

    const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

    const handleLanguageChange = (languageCode: string) => {
        if (languageCode === currentLanguage || isLoading) return;

        setIsLoading(true);
        
        router.post('/language', { language: languageCode }, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setIsLoading(false),
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className={className} disabled={isLoading}>
                    <Globe className="mr-2 h-4 w-4" />
                    <span className="mr-2">{currentLang.flag}</span>
                    {currentLang.name}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {languages.map((language) => (
                    <DropdownMenuItem
                        key={language.code}
                        onClick={() => handleLanguageChange(language.code)}
                        className="cursor-pointer"
                    >
                        <span className="mr-2">{language.flag}</span>
                        <span className="flex-1">{language.name}</span>
                        {language.code === currentLanguage && (
                            <Check className="h-4 w-4 text-green-600" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
