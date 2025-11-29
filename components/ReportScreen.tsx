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
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const reportRef = useRef<HTMLDivElement>(null);
    const page1Ref = useRef<HTMLDivElement>(null);
    const page2Ref = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    // Auto download effect
    useEffect(() => {
        if (autoDownload && reportRef.current) {
            // Small delay to ensure render is complete
            const timer = setTimeout(() => {
                handleDownloadPDF();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [autoDownload]);

    // --- RADAR CHART LOGIC ---
    const size = 260;
    const center = size / 2;
    const radius = 90;
    const maxScore = 50;

    // Order for the Hexagon (Clockwise from top)
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
        if (!page1Ref.current || !page2Ref.current) return;
        setIsDownloading(true);

        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // Process Page 1
            const canvas1 = await html2canvas(page1Ref.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#f9fafb', // bg-gray-50
                windowWidth: page1Ref.current.scrollWidth,
                windowHeight: page1Ref.current.scrollHeight,
            });
            const imgData1 = canvas1.toDataURL('image/png');
            pdf.addImage(imgData1, 'PNG', 0, 0, pdfWidth, pdfHeight);

            // Process Page 2
            pdf.addPage();
            const canvas2 = await html2canvas(page2Ref.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#f9fafb', // bg-gray-50
                windowWidth: page2Ref.current.scrollWidth,
                windowHeight: page2Ref.current.scrollHeight,
            });
            const imgData2 = canvas2.toDataURL('image/png');
            pdf.addImage(imgData2, 'PNG', 0, 0, pdfWidth, pdfHeight);

            pdf.save(`${user.name.replace(/\s+/g, '_')}_Career_Report.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert("Could not generate PDF. Please try the Print option instead.");
        } finally {
            setIsDownloading(false);
        }
    };

    const getColor = (code: string) => {
        switch (code) {
            case 'R': return '#10b981'; // Emerald
            case 'I': return '#3b82f6'; // Blue
            case 'A': return '#f59e0b'; // Amber
            case 'S': return '#ec4899'; // Pink
            case 'E': return '#8b5cf6'; // Violet
            case 'C': return '#64748b'; // Slate
            default: return '#cbd5e1';
        }
    };

    return (
        <div className="bg-gray-200 min-h-screen font-sans print:bg-white">
            {/* Floating Action Bar for Admin */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm px-4 py-3 flex justify-between items-center no-print">
                <Button variant="ghost" onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-brand-900">
                    <ArrowLeft size={18} />
                    Back to Dashboard
                </Button>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500 mr-2 uppercase tracking-wide">
                        Actions
                    </span>
                    <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2">
                        <Printer size={16} /> Print
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                        className="flex items-center gap-2"
                    >
                        {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                        {isDownloading ? 'Generating PDF...' : 'Download Report'}
                    </Button>
                </div>
            </div>

            <style>{`
        @media print {
          @page { margin: 0; size: auto; }
          body { -webkit-print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-break-inside { break-inside: avoid; }
          .print-container { box-shadow: none !important; margin: 0 !important; width: 100% !important; max-width: 100% !important; }
        }
      `}</style>

            {/* Report Container */}
            <div className="pt-24 pb-12 flex flex-col items-center gap-8 print:p-0">

                {/* PAGE 1 */}
                <div ref={page1Ref} className="w-full max-w-[210mm] bg-gray-50 shadow-2xl min-h-[297mm] print:shadow-none print:w-full print:max-w-none flex flex-col overflow-hidden relative">
                    {/* HEADER */}
                    <div className="bg-brand-navy text-white py-8 px-8 print:px-8 print:py-4">
                        <div className="w-full">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-6 mb-6">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">CAREER REPORT</h1>
                                    <p className="text-blue-200 text-xs md:text-sm tracking-widest uppercase font-semibold">Comprehensive Assessment Analysis</p>
                                </div>
                                <img src={logo} alt="IACG Multimedia College" className="h-16 object-contain" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-brand-gold flex items-center justify-center text-brand-navy font-bold text-xl">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-xs text-blue-300 uppercase tracking-wider mb-0.5">Report Prepared For</p>
                                        <h2 className="text-xl font-bold">{user.name}</h2>
                                        <div className="flex flex-col gap-1 text-blue-200 text-sm mt-1">
                                            <div className="flex items-center gap-2">
                                                <GraduationCap size={14} className="text-brand-gold" /> {user.grade}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <School size={14} className="text-brand-gold" /> {user.schoolName}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex md:justify-end">
                                    <div className="md:text-right">
                                        <p className="text-xs text-blue-300 uppercase tracking-wider mb-0.5">Assessment Date</p>
                                        <div className="flex items-center md:justify-end gap-2 text-white font-medium">
                                            <Calendar size={14} /> {today}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PAGE 1 CONTENT */}
                    <div className="w-full px-8 -mt-4 print:mt-0 print:px-0 flex-1">

                        {/* 1. SUMMARY */}
                        <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-8 print-container print-break-inside print:border-b print:rounded-none">
                            <div className="p-8 border-b border-gray-100">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-500 font-bold text-sm">01</span>
                                    <h3 className="text-base font-bold text-gray-900 uppercase tracking-wider">Career Personality</h3>
                                </div>

                                <div className="flex flex-col md:flex-row gap-8 items-center">
                                    <div className="text-center md:w-1/3 border-r border-gray-100 pr-0 md:pr-8">
                                        <p className="text-xs text-gray-500 font-medium uppercase mb-2">Your Interest Code</p>
                                        <h2 className="text-5xl font-black text-brand-navy tracking-tighter mb-4">
                                            {report.interestCode.join('')}
                                        </h2>
                                        <div className="inline-flex items-center gap-2 bg-blue-50 text-brand-navy px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                                            <CheckCircle2 size={10} /> High Confidence
                                        </div>
                                    </div>
                                    <div className="md:w-2/3">
                                        <h4 className="text-lg font-bold text-gray-900 mb-2">What this means</h4>
                                        <p className="text-sm text-gray-600 leading-relaxed mb-3 text-justify">
                                            <span className="font-bold text-brand-navy">Your primary interest is {report.details[report.interestCode[0]].name}.</span>{' '}
                                            {report.details[report.interestCode[0]].description}
                                        </p>

                                        <div className="flex gap-2 mt-3">
                                            {report.interestCode.map(code => (
                                                <span key={code} className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold border border-gray-200">
                                                    {report.details[code].name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. INTERESTS & RADAR */}
                        <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-8 print-container print-break-inside print:shadow-none print:border-b print:rounded-none">
                            <div className="p-8">
                                <div className="flex items-center gap-3 mb-8">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-500 font-bold text-sm">02</span>
                                    <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wider">Career Interests Distribution</h3>
                                </div>

                                <div className="flex flex-col lg:flex-row gap-12">
                                    <div className="flex-1 space-y-5">
                                        {report.sortedScores.map((item) => {
                                            const percentage = Math.round((item.score / maxScore) * 100);
                                            const color = getColor(item.code);
                                            const isTop = report.interestCode.includes(item.code);
                                            return (
                                                <div key={item.code}>
                                                    <div className="flex justify-between items-end mb-1">
                                                        <span className={`text-xs font-bold uppercase tracking-wider ${isTop ? 'text-gray-900' : 'text-gray-500'}`}>
                                                            {report.details[item.code].name}
                                                        </span>
                                                        <span className="text-xs font-bold text-gray-900">{percentage}%</span>
                                                    </div>
                                                    <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-1000"
                                                            style={{ width: `${percentage}%`, backgroundColor: color }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="flex-1 flex flex-col items-center justify-center border-l border-gray-100 pl-0 lg:pl-12 pt-8 lg:pt-0">
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
                                                <polygon points={scorePoints} fill="rgba(14, 31, 70, 0.1)" stroke="#0E1F46" strokeWidth="2.5" />
                                                {axes.map((axis, i) => {
                                                    const { x, y } = getCoordinates(maxScore * 1.12, i, axes.length);
                                                    const isTopInterest = report.interestCode.includes(axis);
                                                    return (
                                                        <g key={i} transform={`translate(${x}, ${y})`}>
                                                            <circle r="14" fill={isTopInterest ? '#0E1F46' : 'white'} stroke="#e2e8f0" strokeWidth="2" />
                                                            <text textAnchor="middle" dy="4" fill={isTopInterest ? 'white' : '#64748b'} fontSize="10" fontWeight="bold">{axis}</text>
                                                        </g>
                                                    );
                                                })}
                                            </svg>
                                        </div>
                                        <p className="text-center text-xs text-gray-400 mt-4 font-medium uppercase tracking-widest">Holland Code (RIASEC)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PAGE 2 */}
                <div ref={page2Ref} className="w-full max-w-[210mm] bg-gray-50 shadow-2xl min-h-[297mm] print:shadow-none print:w-full print:max-w-none flex flex-col overflow-hidden relative p-8">
                    {/* 3. TOP THEMES */}
                    <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-4 print-container print-break-inside print:shadow-none print:border-b print:rounded-none">
                        <div className="p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-500 font-bold text-sm">03</span>
                                <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wider">Top Themes Analysis</h3>
                            </div>

                            <div className="flex flex-col gap-3">
                                {report.interestCode.map((code, index) => {
                                    const detail = report.details[code];
                                    const color = getColor(code);

                                    return (
                                        <div key={code} className="bg-gray-50 rounded-xl p-5 border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                                            <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: color }}></div>

                                            <div className="flex flex-col md:flex-row gap-4">
                                                {/* Left Side: Header & Description */}
                                                <div className="md:w-5/12 flex flex-col justify-center">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold shadow-sm text-base" style={{ backgroundColor: color }}>
                                                            {code}
                                                        </div>
                                                        <div>
                                                            <h4 className="text-base font-bold text-gray-900">{detail.name}</h4>
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                                {index === 0 ? 'Primary' : index === 1 ? 'Secondary' : 'Tertiary'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-gray-600 leading-relaxed text-justify">
                                                        {detail.description}
                                                    </p>
                                                </div>

                                                {/* Right Side: Details */}
                                                <div className="md:w-7/12 grid grid-cols-2 gap-2">
                                                    <div className="bg-blue-50/50 p-2 rounded-lg border border-blue-100/50 col-span-2 flex flex-col justify-center">
                                                        <p className="text-[10px] text-brand-navy uppercase font-bold mb-1 flex items-center gap-1">
                                                            <span className="w-1 h-1 bg-brand-navy rounded-full"></span> Good Majors
                                                        </p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {detail.majors.map((major, i) => (
                                                                <span key={i} className="px-1.5 py-0.5 bg-white text-gray-700 text-[10px] font-medium rounded border border-blue-100 shadow-sm">
                                                                    {major}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="bg-amber-50/50 p-2 rounded-lg border border-amber-100/50 flex flex-col justify-center">
                                                        <p className="text-[10px] text-amber-700 uppercase font-bold mb-1 flex items-center gap-1">
                                                            <span className="w-1 h-1 bg-amber-700 rounded-full"></span> Interests
                                                        </p>
                                                        <p className="text-[10px] font-medium text-gray-700 leading-snug">{detail.interests}</p>
                                                    </div>

                                                    <div className="bg-emerald-50/50 p-2 rounded-lg border border-emerald-100/50 flex flex-col justify-center">
                                                        <p className="text-[10px] text-emerald-700 uppercase font-bold mb-1 flex items-center gap-1">
                                                            <span className="w-1 h-1 bg-emerald-700 rounded-full"></span> Key Skills
                                                        </p>
                                                        <p className="text-[10px] font-medium text-gray-700 leading-snug">{detail.skills}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* 4. RECOMMENDATIONS */}
                    <div className="bg-brand-navy rounded-xl shadow-xl overflow-hidden text-white print-container print-break-inside print:bg-brand-navy print:text-white print:rounded-none">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-brand-gold font-bold text-sm">04</span>
                                <h3 className="text-lg font-bold text-white uppercase tracking-wider">Career Recommendations</h3>
                            </div>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="font-bold text-blue-200 uppercase text-xs tracking-widest mb-4">Recommended Streams</h4>
                                    <div className="space-y-2">
                                        {['Science (PCB) - Medical/Bio', 'Arts & Humanities', 'Commerce & Business'].map((stream, idx) => (
                                            <div key={idx} className="bg-white/5 rounded-lg p-2.5 border border-white/5 flex justify-between items-center">
                                                <span className="font-medium text-xs">{stream}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col items-center">
                                    <h4 className="font-bold text-blue-200 uppercase text-xs tracking-widest mb-4 text-center">Best Fit Career Clusters</h4>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {report.details[report.interestCode[0]].pathways.map((path, idx) => (
                                            <div key={idx} className="bg-white/10 rounded-lg px-3 py-1.5 border border-white/10 shadow-sm">
                                                <span className="text-xs font-medium text-gray-100">{path}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default ReportScreen;