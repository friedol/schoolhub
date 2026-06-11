import { ReactNode } from 'react';
import AppLayout from './app-layout';

interface AuthenticatedLayoutProps {
    children: ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
    return <AppLayout>{children}</AppLayout>;
}



