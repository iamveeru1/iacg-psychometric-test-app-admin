import React, { useRef, useState, useEffect } from 'react';
import { Student, UserAnswers } from '../types';
import { calculateReport } from '../utils/scoring';
import { Printer, Download, Calendar, CheckCircle2, Loader2, School, GraduationCap, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import Button from './Button';
import logo from '../assets/images/logo.png';



interface ReportScreenProps {
    user: Student; // Using Student type from types.ts
    answers: UserAnswers;
    onBack: () => void;
    autoDownload?: boolean;
}

const ExpandableText = ({
    description,
    majors,
    title,
    titleColor = 'text-brand-navy',
    buttonColor = '#3b82f6'
}: {
    description: string;
    majors: string[];
    title?: string;
    titleColor?: string;
    buttonColor?: string;
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="flex flex-col items-start">
            <p className="text-gray-600 leading-relaxed mb-2">
                {title && <span className={`font-bold ${titleColor}`}>{title}</span>}
                {title ? '. ' : ''}
                {description}
            </p>

            {isExpanded && (
                <div className="w-full mt-2 mb-3 pl-4 border-l-2 border-gray-200 animate-in fade-in slide-in-from-top-1 duration-200">
                    <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Good College Majors</h5>
                    <div className="flex flex-wrap gap-2">
                        {majors.map((major, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-50 text-gray-700 text-xs rounded border border-gray-100">
                                {major}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider hover:underline focus:outline-none transition-colors"
                style={{ color: buttonColor }}
            >
                {isExpanded ? (
                    <>Read Less <ChevronUp size={12} /></>
                ) : (
                    <>Read More <ChevronDown size={12} /></>
                )}
            </button>
        </div>
    );
};

const ReportScreen: React.FC<ReportScreenProps> = ({ user, answers, onBack, autoDownload = false }) => {
    const report = calculateReport(answers);
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    // Function to get recommended streams based on RIASEC code
    const getRecommendedStreams = (interestCode: string[]) => {
        const primaryCode = interestCode[0];
        const secondaryCode = interestCode[1];

        // 1. Maths/Science/Medical - R, I, C aligned
        if (primaryCode === 'R' || primaryCode === 'I') {
            return ['Maths / Science / Medical', 'Commerce & Business'];
        }

        // 2. Commerce & Business - E, C, S aligned
        if (primaryCode === 'E' || primaryCode === 'C') {
            return ['Commerce & Business', 'Arts, Humanities & Creative'];
        }

        // 3. Arts, Humanities & Creative - A, S, E aligned
        if (primaryCode === 'A' || primaryCode === 'S') {
            return ['Arts, Humanities & Creative', 'Commerce & Business'];
        }

        // Default fallback
        return ['Maths / Science / Medical', 'Arts, Humanities & Creative'];
    };

    const recommendedStreams = getRecommendedStreams(report.interestCode);

    const reportRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    // Auto download effect
    useEffect(() => {
        if (autoDownload && reportRef.current) {
            const timer = setTimeout(() => {
                handleDownloadPDF();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [autoDownload]);

    // --- RADAR CHART LOGIC ---
    const size = 150;
    const center = size / 2;
    const radius = 50;
    const maxScore = 50;
    const axes = ['R', 'I', 'A', 'S', 'E', 'C'];

    const getCoordinates = (value: number, index: number, total: number) => {
        const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
        const r = (value / maxScore) * radius;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return { x, y };
    };

    const scorePoints = axes.map((axis, i) => {
        const score = report.scores[axis] || 0;
        const { x, y } = getCoordinates(score, i, axes.length);
        return `${x},${y}`;
    }).join(' ');

    const gridLevels = [0.2, 0.4, 0.6, 0.8, 1];

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = async () => {
        if (!reportRef.current) return;
        setIsDownloading(true);

        try {
            // Scroll to top to ensure proper capture
            window.scrollTo(0, 0);
            
            // Wait a moment for scroll
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const element = reportRef.current;
            
            // Capture the element with specific settings to prevent text shift
            const canvas = await html2canvas(element, {
                scale: 3, // Higher scale for better quality
                useCORS: true,
                allowTaint: false,
                logging: false,
                backgroundColor: '#ffffff',
                imageTimeout: 0,
                removeContainer: false,
                foreignObjectRendering: false, // Disable foreign object rendering
                onclone: (clonedDoc, clonedElement) => {
                    // Remove shadow
                    clonedElement.style.boxShadow = 'none';
                    
                    // Only shift text elements up, not containers
                    const textElements = clonedElement.querySelectorAll('h1, h2, h3, h4, h5, h6, p');
                    textElements.forEach((el) => {
                        const htmlEl = el as HTMLElement;
                        htmlEl.style.transform = 'translateY(-5px)';
                    });
                    
                    // Also shift span elements that contain text (not layout containers)
                    const spanElements = clonedElement.querySelectorAll('span');
                    spanElements.forEach((el) => {
                        const htmlEl = el as HTMLElement;
                        const computedStyle = window.getComputedStyle(el);
                        // Only shift if it's not a flex/grid container
                        if (computedStyle.display !== 'flex' && computedStyle.display !== 'grid' && computedStyle.display !== 'inline-flex') {
                            htmlEl.style.transform = 'translateY(-5px)';
                        }
                    });
                }
            });

            // Create PDF
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // Convert canvas to image
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            
            // Add image to PDF - fill entire page
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
            
            // Save PDF
            pdf.save(`${user.name.replace(/\s+/g, '_')}_Career_Report.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert("Could not generate PDF. Please try using the Print button and save as PDF from your browser.");
        } finally {
            setIsDownloading(false);
        }
    };

    const getColor = (code: string) => {
        switch (code) {
            case 'R': return '#10b981';
            case 'I': return '#3b82f6';
            case 'A': return '#f59e0b';
            case 'S': return '#ec4899';
            case 'E': return '#8b5cf6';
            case 'C': return '#64748b';
            default: return '#cbd5e1';
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen font-sans print:bg-white">
            {/* Floating Action Bar */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm px-4 py-3 flex justify-between items-center no-print">
                <Button variant="ghost" onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-brand-900">
                    <ArrowLeft size={18} />
                    Back to Dashboard
                </Button>
                <div className="flex items-center gap-2">
                    <Button
                        variant="primary"
                        onClick={handlePrint}
                        className="flex items-center gap-2"
                    >
                        <Download size={16} />
                        Download PDF
                    </Button>
                </div>
            </div>

            <style>{`
                @media print {
                    @page { 
                        margin: 0; 
                        size: A4 portrait;
                    }
                    body { 
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .no-print { 
                        display: none !important; 
                    }
                    
                    /* Force exact layout - prevent responsive breakpoints */
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    
                    /* Force md: breakpoint styles to apply */
                    .md\\:flex-row {
                        flex-direction: row !important;
                    }
                    
                    .md\\:w-1\\/3 {
                        width: 33.333333% !important;
                    }
                    
                    .md\\:w-2\\/3 {
                        width: 66.666667% !important;
                    }
                }
            `}</style>

            {/* Report Container - Strict A4 Size */}
            <div className="pt-20 pb-12 flex justify-center print:p-0">
                <div
                    ref={reportRef}
                    className="w-[210mm] h-[297mm] bg-white shadow-2xl print:shadow-none flex flex-col overflow-hidden relative mx-auto box-border"
                >

                    {/* HEADER */}
                    <div className="bg-[#E0F2FE] px-8 py-3 flex flex-col gap-3 print:px-8 print:py-3 shrink-0">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-black text-[#1e3a8a] tracking-tight mb-0.5">CAREER REPORT</h1>
                                <p className="text-[10px] text-[#1e3a8a] uppercase tracking-widest font-bold opacity-80">COMPREHENSIVE ASSESSMENT ANALYSIS</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <img src={logo} alt="IACG" className="h-12 w-auto object-contain" />
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#60a5fa] flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-[#1e3a8a] leading-none">{user.name}</h2>
                                    <p className="text-[10px] text-[#1e3a8a] mt-0.5 font-medium opacity-80">{user.grade} • {user.schoolName}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-center">
                                <p className="text-xs font-bold text-[#1e3a8a] opacity-70">{today}</p>
                            </div>
                        </div>
                    </div>

                    {/* CONTENT */}
                    <div className="px-8 py-4 flex flex-col gap-3 flex-1 overflow-hidden">

                        {/* 1. CAREER PERSONALITY */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2.5 shrink-0">
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-600 font-bold text-[9px]">01</span>
                                <h3 className="text-[10px] font-bold text-[#1e3a8a] uppercase tracking-wider">CAREER PERSONALITY</h3>
                            </div>

                            <div className="flex flex-col md:flex-row gap-3">
                                <div className="md:w-1/3 flex flex-col items-center justify-center border-r border-gray-100 pr-3">
                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">YOUR INTEREST CODE</p>
                                    <h2 className="text-3xl font-black text-[#1e3a8a] tracking-tighter mb-0.5">
                                        {report.interestCode.join('')}
                                    </h2>
                                    <div className="bg-[#1e3a8a] text-white px-3 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide">
                                        High Confidence
                                    </div>
                                </div>
                                <div className="md:w-2/3 flex flex-col justify-between">
                                    <div>
                                        <h4 className="text-xs font-bold text-[#1e3a8a] mb-0.5">What this means:</h4>
                                        <p className="text-[10px] text-gray-600 leading-relaxed mb-1.5 text-justify">
                                            <span className="font-bold text-[#1e3a8a]">Your primary interest is {report.details[report.interestCode[0]].name}.</span>{' '}
                                            {report.details[report.interestCode[0]].description}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 mt-auto">
                                        {report.interestCode.map(code => (
                                            <span key={code} className="px-3 py-0.5 bg-gray-100 text-gray-500 rounded text-[9px] font-bold uppercase tracking-wide">
                                                {report.details[code].name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. CAREER INTERESTS DISTRIBUTION */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 shrink-0">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-600 font-bold text-[9px]">02</span>
                                <h3 className="text-[10px] font-bold text-[#1e3a8a] uppercase tracking-wider">CAREER INTERESTS DISTRIBUTION</h3>
                            </div>

                            <div className="flex flex-col md:flex-row gap-6 items-center">
                                <div className="flex-1 w-full space-y-2">
                                    {report.sortedScores.map((item) => {
                                        const percentage = Math.round((item.score / maxScore) * 100);
                                        const color = getColor(item.code);
                                        return (
                                            <div key={item.code} className="flex items-center gap-2">
                                                <span className="text-[9px] font-bold text-gray-500 uppercase w-20">{report.details[item.code].name}</span>
                                                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden relative">
                                                    <div className="h-full rounded-full absolute top-0 left-0" style={{ width: `${percentage}%`, backgroundColor: color }} />
                                                    <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[7px] font-bold text-white drop-shadow-md">{percentage}%</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="w-48 flex flex-col items-center">
                                    <div className="relative">
                                        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
                                            {gridLevels.map((level, idx) => {
                                                const points = axes.map((_, i) => {
                                                    const { x, y } = getCoordinates(maxScore * level, i, axes.length);
                                                    return `${x},${y}`;
                                                }).join(' ');
                                                return <polygon key={idx} points={points} fill="none" stroke="#e2e8f0" strokeWidth="1" />;
                                            })}
                                            {axes.map((_, i) => {
                                                const start = getCoordinates(0, i, axes.length);
                                                const end = getCoordinates(maxScore, i, axes.length);
                                                return <line key={i} x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="#e2e8f0" strokeWidth="1" />;
                                            })}
                                            <polygon points={scorePoints} fill="rgba(30, 58, 138, 0.05)" stroke="#1e3a8a" strokeWidth="2" />
                                            {axes.map((axis, i) => {
                                                const { x, y } = getCoordinates(maxScore * 1.15, i, axes.length);
                                                const isHighlighted = report.interestCode.includes(axis);
                                                const fillColor = isHighlighted ? getColor(axis) : '#f1f5f9';
                                                const textColor = isHighlighted ? 'white' : '#94a3b8';

                                                return (
                                                    <g key={i} transform={`translate(${x}, ${y})`}>
                                                        <circle r="10" fill={fillColor} />
                                                        <text textAnchor="middle" dy="3.5" fill={textColor} fontSize="8" fontWeight="bold">{axis}</text>
                                                    </g>
                                                );
                                            })}
                                        </svg>
                                    </div>
                                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-2">HOLLAND CODE (RIASEC)</p>
                                </div>
                            </div>
                        </div>

                        {/* 3. TOP THEMES ANALYSIS */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 shrink-0">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-600 font-bold text-[9px]">03</span>
                                <h3 className="text-[10px] font-bold text-[#1e3a8a] uppercase tracking-wider">TOP THEMES ANALYSIS</h3>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                {report.interestCode.map((code, idx) => {
                                    const detail = report.details[code];
                                    const iconBg = getColor(code);

                                    return (
                                        <div key={code} className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-2.5 flex flex-col h-full">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <div className="w-6 h-6 rounded flex items-center justify-center text-white font-bold text-[10px] shadow-sm" style={{ backgroundColor: iconBg }}>
                                                    {code}
                                                </div>
                                                <div>
                                                    <h4 className="text-[10px] font-bold text-[#1e3a8a]">{detail.name}</h4>
                                                    <p className="text-[7px] text-gray-500 font-bold uppercase">{idx === 0 ? '(Primary)' : idx === 1 ? '(Secondary)' : ''}</p>
                                                </div>
                                            </div>

                                            <p className="text-[9px] text-gray-600 leading-relaxed mb-2 min-h-[36px]">
                                                {detail.description}
                                            </p>

                                            <div className="mt-auto space-y-2">
                                                <div className="bg-white rounded-md p-1.5 shadow-sm border border-gray-100/50">
                                                    <p className="text-[7px] font-bold text-gray-400 uppercase tracking-wider mb-1">• GOOD MAJORS</p>
                                                    <div className="grid grid-cols-2 gap-1">
                                                        {detail.majors.slice(0, 4).map((m, i) => (
                                                            <div key={i} className="bg-gray-50 px-1.5 py-0.5 rounded text-[8px] text-gray-600 font-medium text-center border border-gray-200 truncate max-w-full">
                                                                {m}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="bg-white rounded-md p-1.5 shadow-sm border border-gray-100/50">
                                                    <p className="text-[7px] font-bold text-gray-400 uppercase tracking-wider mb-1">• INTERESTS</p>
                                                    <p className="text-[8px] text-gray-600 leading-tight">
                                                        {detail.interests}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 4. CAREER RECOMMENDATIONS */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 border-b-2 p-3 shrink-0">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-600 font-bold text-[9px]">04</span>
                                <h3 className="text-[10px] font-bold text-[#1e3a8a] uppercase tracking-wider">CAREER RECOMMENDATIONS</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <h4 className="text-[9px] font-bold text-[#1e3a8a] uppercase tracking-wider">RECOMMENDED STREAMS</h4>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {recommendedStreams.map((stream, idx) => (
                                            <div key={idx} className="bg-[#8b5cf6] text-white rounded-full py-2 px-4 text-center text-[10px] font-bold shadow-sm h-[38px] flex items-center justify-center">
                                                {stream}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <h4 className="text-[9px] font-bold text-[#1e3a8a] uppercase tracking-wider">BEST FIT CAREER CLUSTERS</h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 h-full content-start">
                                        {report.details[report.interestCode[0]].pathways.slice(0, 4).map((path, idx) => (
                                            <div key={idx} className="bg-[#8b5cf6] text-white rounded-full py-2 px-2 text-center text-[8px] font-bold shadow-sm flex items-center justify-center leading-tight h-[38px]">
                                                {path}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* FOOTER - Outside content div to appear at bottom */}
                    <div className="px-8 pt-1.5 pb-1 text-center bg-white flex items-start justify-center">
                        <p className="text-[9px] text-gray-500 font-medium">Disclaimer: This report is based on a brief 15-minute assessment and is intended for guidance purposes only. For a comprehensive and in-depth analysis, please refer to our full Career Counseling Process.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportScreen;