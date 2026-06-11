import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import Swal from 'sweetalert2';

interface SweetAlertProps {
    type?: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    text?: string;
    showConfirmButton?: boolean;
    timer?: number;
}

export default function SweetAlert() {
    const { flash } = usePage().props as any;

    useEffect(() => {
        if (flash?.sweetalert) {
            const alert = flash.sweetalert as SweetAlertProps;
            
            Swal.fire({
                icon: alert.type || 'success',
                title: alert.title || 'Success!',
                text: alert.text || 'Operation completed successfully!',
                showConfirmButton: alert.showConfirmButton !== false,
                timer: alert.timer || 3000,
                timerProgressBar: true,
                toast: true,
                position: 'top-end',
                showCloseButton: true,
                customClass: {
                    popup: 'swal2-popup-custom',
                    title: 'swal2-title-custom',
                    content: 'swal2-content-custom',
                }
            });
        }
    }, [flash?.sweetalert]);

    return null;
}



