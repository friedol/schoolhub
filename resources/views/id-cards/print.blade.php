<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Print ID Cards</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        sky: {
                            600: '#0284c7',
                            700: '#0369a1',
                        },
                        emerald: {
                            600: '#059669',
                            700: '#047857',
                        },
                        violet: {
                            600: '#7c3aed',
                            700: '#6d28d9',
                        }
                    }
                }
            }
        }
    </script>
    <style>
        html, body {
            margin: 0;
            padding: 0;
            background: #f1f5f9;
        }
        
        @page {
            size: A4 portrait;
            margin: 0;
        }

        .print-page {
            width: 210mm;
            height: 297mm;
            padding: 28mm 14mm;
            box-sizing: border-box;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            grid-template-rows: repeat(4, 1fr);
            gap: 8mm 10mm;
            justify-items: center;
            align-items: center;
            background: white;
            page-break-after: always;
            break-after: page;
            position: relative;
            overflow: hidden;
        }

        /* Prevent extra blank page after last print-page */
        .print-page:last-child {
            page-break-after: avoid;
            break-after: avoid;
        }

        .card-container {
            width: 85.6mm;
            height: 53.98mm;
            position: relative;
            overflow: visible;
        }

        .card-scale {
            position: absolute;
            top: 0;
            left: 0;
            width: 540px;
            height: 340px;
            transform: scale(0.599); /* scale 540x340 down to exact 85.6x53.98mm */
            transform-origin: top left;
        }

        @media print {
            body {
                background: white !important;
            }
            .print-page {
                box-shadow: none !important;
                border: none !important;
            }
            .print-card {
                box-shadow: none !important;
                border: 1px solid #e2e8f0 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
        }

        @media screen {
            body {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 2rem;
                gap: 2rem;
            }
            .print-page {
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
                border: 1px solid #e2e8f0;
                border-radius: 8px;
            }
        }
    </style>
</head>
<body class="font-sans antialiased">

    @php
        if (!function_exists('getTheme')) {
            function getTheme($type) {
                switch ($type) {
                    case 'student':
                        return [
                            'bg_class' => 'bg-sky-600',
                            'border_class' => 'border-sky-500',
                            'text_class' => 'text-sky-600',
                        ];
                    case 'teacher':
                        return [
                            'bg_class' => 'bg-emerald-600',
                            'border_class' => 'border-emerald-500',
                            'text_class' => 'text-emerald-600',
                        ];
                    case 'staff':
                    default:
                        return [
                            'bg_class' => 'bg-violet-600',
                            'border_class' => 'border-violet-500',
                            'text_class' => 'text-violet-600',
                        ];
                }
            }
        }

        if (!function_exists('getInitials')) {
            function getInitials($name) {
                $words = explode(' ', $name);
                $initials = '';
                $count = 0;
                foreach ($words as $w) {
                    if ($count < 2) {
                        $initials .= strtoupper(substr($w, 0, 1));
                        $count++;
                    }
                }
                return $initials;
            }
        }
    @endphp

    @foreach(array_chunk($users, 8) as $chunk)
        <div class="print-page">
            @foreach($chunk as $user)
                @php
                    $theme = getTheme($user['type']);
                @endphp
                <div class="card-container">
                    <!-- CR-80 Card: 540px x 340px inside scaled container -->
                    <div class="card-scale print-card rounded-2xl overflow-hidden border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 flex flex-row relative select-none">
                        <!-- LEFT SECTION (65% width) -->
                        <div class="w-[65%] h-full relative z-10">
                            <!-- Card Type Header -->
                            <div class="absolute top-6 left-6">
                                <span class="text-2xl font-black tracking-wider uppercase {{ $theme['text_class'] }}">
                                    {{ $user['type'] === 'student' ? 'Student' : ($user['type'] === 'teacher' ? 'Teacher' : 'Staff') }} ID Card
                                </span>
                            </div>

                            <!-- Circular Photo -->
                            <div class="absolute top-[92px] left-6 w-[124px] h-[124px] rounded-full border-[5px] {{ $theme['border_class'] }} shadow-md overflow-hidden bg-white z-10">
                                @if(!empty($user['photo']))
                                    <img src="{{ $user['photo'] }}" alt="{{ $user['name'] }}" class="w-full h-full object-cover">
                                @else
                                    <div class="w-full h-full flex items-center justify-center text-white text-3xl font-black {{ $theme['bg_class'] }}">
                                        {{ getInitials($user['name']) }}
                                    </div>
                                @endif
                            </div>

                            <!-- Fields -->
                            <div class="absolute top-[88px] left-[172px] right-3 flex flex-col gap-[6px]">
                                <!-- Name Field -->
                                <div class="border-b border-slate-200 pb-0.5">
                                    <span class="block text-[8px] font-black tracking-wider uppercase text-slate-500 leading-none">
                                        NAME:
                                    </span>
                                    <span class="block text-sm font-black text-slate-800 tracking-wide truncate mt-0.5 leading-tight">
                                        {{ strtoupper($user['name']) }}
                                    </span>
                                </div>

                                <!-- ID Field -->
                                <div class="border-b border-slate-200 pb-0.5">
                                    <span class="block text-[8px] font-black tracking-wider uppercase text-slate-500 leading-none">
                                        {{ $user['type'] === 'student' ? 'STUDENT ID:' : 'STAFF ID:' }}
                                    </span>
                                    <span class="block text-xs font-black text-slate-800 font-mono tracking-wider truncate mt-0.5 leading-tight">
                                        {{ $user['user_id'] }}
                                    </span>
                                </div>

                                <!-- Program/Class/Designation Field -->
                                @if($user['type'] === 'student' && !empty($user['class_name']))
                                    <div class="border-b border-slate-200 pb-0.5">
                                        <span class="block text-[8px] font-black tracking-wider uppercase text-slate-500 leading-none">
                                            CLASS / PROGRAM:
                                        </span>
                                        <span class="block text-xs font-bold text-slate-800 truncate mt-0.5 leading-tight">
                                            {{ strtoupper($user['class_name']) }}
                                        </span>
                                    </div>
                                @elseif(!empty($user['designation']))
                                    <div class="border-b border-slate-200 pb-0.5">
                                        <span class="block text-[8px] font-black tracking-wider uppercase text-slate-500 leading-none">
                                            DESIGNATION:
                                        </span>
                                        <span class="block text-xs font-bold text-slate-800 truncate mt-0.5 leading-tight">
                                            {{ strtoupper($user['designation']) }}
                                        </span>
                                    </div>
                                @endif

                                <!-- Date of Birth Field -->
                                <div class="border-b border-slate-200 pb-0.5 last:border-b-0">
                                    <span class="block text-[8px] font-black tracking-wider uppercase text-slate-500 leading-none">
                                        DATE OF BIRTH:
                                    </span>
                                    <span class="block text-[11px] font-bold text-slate-700 truncate mt-0.5 leading-tight">
                                        {{ !empty($user['date_of_birth']) && $user['date_of_birth'] !== 'N/A' ? strtoupper($user['date_of_birth']) : 'NOT SPECIFIED' }}
                                    </span>
                                </div>
                            </div>

                            <!-- Expiry Date (Valid Until) -->
                            <div class="absolute bottom-6 left-6 z-20">
                                <span class="block text-[7px] font-extrabold text-slate-500 uppercase tracking-widest leading-none">
                                    VALID UNTIL:
                                </span>
                                <span class="block text-[10px] font-black text-slate-800 leading-tight">
                                    DECEMBER 2028
                                </span>
                            </div>

                            <!-- Barcode representation -->
                    <div class="absolute bottom-6 right-6 flex flex-col items-center">
                        <div class="flex items-end h-6 space-x-[1px]">
                            @foreach([1, 2, 1, 3, 1, 1, 2, 2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 2, 2, 1, 1, 3, 1, 1, 2, 1, 1, 2] as $w)
                                <div class="bg-slate-900 h-full" style="width: {{ $w }}px;"></div>
                            @endforeach
                        </div>
                        <span class="text-[7px] font-mono tracking-widest mt-0.5 text-slate-600">
                            {{ $user['user_id'] }}
                        </span>
                    </div>

                            <!-- Curved background shape overlays -->
                            <div class="absolute bottom-[-50px] left-[-50px] w-40 h-40 bg-sky-800 opacity-20 rounded-full z-0"></div>
                            <div class="absolute bottom-0 left-0 w-36 h-24 bg-gradient-to-tr from-teal-250 via-teal-100 to-transparent z-0" style="clip-path: polygon(0 100%, 0 0, 45% 0, 100% 100%);"></div>
                            <div class="absolute bottom-0 left-0 w-28 h-28 {{ $theme['bg_class'] }} opacity-10 z-0" style="clip-path: circle(90px at bottom left);"></div>
                        </div>

                        <!-- RIGHT SECTION (Right Banner/Pennant - 35% width) -->
                        <div class="w-[35%] h-full relative z-10 bg-transparent flex flex-col items-center">
                            <!-- Ribbon (shorter, swallowtail) -->
                            <div class="w-full h-[215px] {{ $theme['bg_class'] }} flex flex-col items-center justify-start pt-7 px-4 text-white shadow-lg absolute top-0 right-0" style="clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 50% 86%, 0% 100%);">
                                <!-- Logo frame (white ring) -->
                                <div class="w-[72px] h-[72px] rounded-full border-2 border-white/40 flex items-center justify-center bg-transparent overflow-hidden relative shrink-0">
                                    @if(!empty($school['logo']))
                                        <img src="{{ $school['logo'] }}" alt="{{ $school['name'] }}" class="w-full h-full object-cover">
                                    @else
                                        <!-- University Crest Badge SVG -->
                                        <svg class="w-11 h-11 text-white fill-none stroke-current" stroke-width="1.5" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18c-2-2-2-5 0-7M4 14c-1-1.5-1-3.5 0-5" />
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M18 18c2-2 2-5 0-7M20 14c1-1.5 1-3.5 0-5" />
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v14M12 4s3.5 1 3.5 4.5S12 18 12 18s-3.5-4.5-3.5-9.5S12 4 12 4z" />
                                            <circle cx="12" cy="11" r="2" class="fill-current" />
                                            <path d="M9.5 2.5l.5 1 .5-1M12 1.5l.5 1 .5-1M14.5 2.5l.5 1 .5-1" stroke-width="1" />
                                        </svg>
                                    @endif
                                </div>

                                <!-- School Name -->
                                <div class="text-[10px] font-black uppercase tracking-widest text-center mt-4 leading-snug px-1 drop-shadow-sm line-clamp-3">
                                    {{ $school['name'] }}
                                </div>
                            </div>

                            <!-- Overlapping Rings Deco at the bottom right -->
                            <div class="absolute bottom-6 right-6 w-24 h-16 pointer-events-none opacity-25">
                                <div class="absolute right-4 bottom-0 w-14 h-14 rounded-full border-2 border-sky-600"></div>
                                <div class="absolute right-0 bottom-1 w-14 h-14 rounded-full border-2 border-teal-500"></div>
                            </div>
                        </div>
                    </div>
                </div>
            @endforeach
        </div>
    @endforeach

    <script>
        window.onload = function() {
            window.print();
            window.onafterprint = function() {
                window.close();
            };
        };
    </script>
</body>
</html>
