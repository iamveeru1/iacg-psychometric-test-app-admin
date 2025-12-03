import React, { useState, useEffect } from 'react';
import {
  LogOut,
  Search,
  FileText,
  Eye,
  Bell,
  GraduationCap,
  RefreshCw,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Student, UserAnswers } from '../types';
import Button from './Button';
import ReportScreen from './ReportScreen';
import ConfirmationModal from './ConfirmationModal';
import { ToastContainer, toast } from 'react-toastify';

import logo from '../assets/images/logo.png';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for Report View
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [autoDownload, setAutoDownload] = useState(false);

  // State for Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Fetch students from Firestore
  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const studentsCollection = collection(db, 'students');
      const studentSnapshot = await getDocs(studentsCollection);

      const studentsList = studentSnapshot.docs.map(doc => {
        const data = doc.data();

        // Handle Firestore Timestamp
        let dateStr = new Date().toISOString();
        if (data.createdAt && typeof data.createdAt.toDate === 'function') {
          dateStr = data.createdAt.toDate().toISOString();
        } else if (data.createdAt) {
          dateStr = new Date(data.createdAt).toISOString();
        }

        // Extract answers (assuming they are keys like 'q_1', 'q_2', etc.)
        const answers: UserAnswers = {};
        Object.keys(data).forEach(key => {
          if (key.startsWith('q_')) {
            answers[key] = data[key];
          }
        });

        // Also check if there's a nested 'answers' object
        if (data.answers && typeof data.answers === 'object') {
          Object.assign(answers, data.answers);
        }

        return {
          id: doc.id,
          name: data.name || 'Unknown',
          schoolName: data.school || 'Unknown School', // Mapped from 'school'
          email: data.email || '',
          grade: data.studentClass || 'N/A', // Mapped from 'studentClass'
          status: data.status ? data.status.toUpperCase() : 'REGISTERED', // Mapped from 'status'
          lastAssessmentDate: dateStr,
          answers: answers
        } as Student;
      });

      setStudents(studentsList);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("Failed to load student data. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toUpperCase();
    if (normalizedStatus === 'COMPLETED') {
      return 'bg-green-100 text-green-800 border-green-200';
    } else if (normalizedStatus === 'REGISTERED') {
      return 'bg-blue-50 text-blue-800 border-blue-200';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleViewReport = (student: Student) => {
    setSelectedStudent(student);
    setAutoDownload(false);
  };



  const handleBackFromReport = () => {
    setSelectedStudent(null);
    setAutoDownload(false);
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudentToDelete(studentId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;

    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'students', studentToDelete));
      setStudents(prevStudents => prevStudents.filter(student => student.id !== studentToDelete));
      toast.success('Student deleted successfully');
      setIsDeleteModalOpen(false);
      setStudentToDelete(null);
    } catch (err) {
      console.error("Error deleting student:", err);
      toast.error('Failed to delete student. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // If a student is selected, show the report screen instead of the dashboard
  if (selectedStudent) {
    return (
      <ReportScreen
        user={selectedStudent}
        answers={selectedStudent.answers || {}}
        onBack={handleBackFromReport}
        autoDownload={autoDownload}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="w-[80%] mx-auto">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 flex items-center gap-2">
                <img src={logo} alt="IACG Logo" className="h-10 w-auto" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                <Bell size={20} className="text-gray-500" />
                <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              </div>
              <div className="h-8 w-px bg-gray-200 mx-1 hidden sm:block"></div>
              <div className="flex items-center gap-3 pl-1">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">Admin User</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-brand-900 to-brand-800 text-white flex items-center justify-center font-semibold shadow-md border-2 border-white">
                  A
                </div>
                <button
                  onClick={onLogout}
                  className="ml-2 p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-[80%] mx-auto py-8">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Student Assessments
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage student records, track assessment status, and access reports.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="bg-white" onClick={fetchStudents} disabled={loading}>
              <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-lg">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-900 focus:border-transparent sm:text-sm transition-shadow shadow-sm"
              placeholder="Search students by name, school, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center text-red-700">
            <AlertCircle size={20} className="mr-3 flex-shrink-0" />
            <p>{error}</p>
            <button onClick={fetchStudents} className="ml-auto text-sm font-semibold hover:underline">Try Again</button>
          </div>
        )}

        {/* Table Container */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden flex flex-col min-h-[400px]">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20">
              <div className="h-12 w-12 border-4 border-brand-900 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 font-medium">Loading student data...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Student Name
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      School Name
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Grade
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">
                      View Report
                    </th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">
                      Delete
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.length > 0 ? (
                    currentItems.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50/80 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-brand-900 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white uppercase">
                              {student.name.charAt(0)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900 group-hover:text-brand-900 transition-colors">{student.name}</div>
                              <div className="text-xs text-gray-500">ID: {student.id.substring(0, 6)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                            <GraduationCap size={16} className="text-gray-400" />
                            {student.schoolName}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {student.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800">
                            {student.grade}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 inline-flex text-xs leading-4 font-medium rounded-full border ${getStatusColor(student.status)}`}>
                            {student.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => handleViewReport(student)}
                            className={`transition-all p-2 rounded-full ${student.status === 'COMPLETED'
                              ? 'text-gray-400 hover:text-brand-900 hover:scale-110 hover:bg-brand-900/5 cursor-pointer'
                              : 'text-gray-200 cursor-not-allowed'
                              }`}
                            title={student.status === 'COMPLETED' ? "View Report" : "Complete assessment first"}
                            disabled={student.status !== 'COMPLETED'}
                          >
                            <Eye size={20} />
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => handleDeleteStudent(student.id)}
                            className="transition-all p-2 rounded-full text-red-500 hover:bg-red-50 hover:scale-110 cursor-pointer"
                            title="Delete Student"
                          >
                            <Trash2 size={20} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center">
                          <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <FileText size={24} className="text-gray-400" />
                          </div>
                          <p className="text-lg font-medium text-gray-900">No students found</p>
                          <p className="text-sm mt-1">
                            {searchTerm ? `We couldn't find any students matching "${searchTerm}"` : "There are no students in the database yet."}
                          </p>
                          {searchTerm && (
                            <button
                              onClick={() => setSearchTerm('')}
                              className="mt-4 text-sm text-brand-900 font-medium hover:underline"
                            >
                              Clear search
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && students.length > 0 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6 mt-auto">
              <div className="flex items-center justify-between">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to <span className="font-medium">{Math.min(indexOfLastItem, filteredStudents.length)}</span> of <span className="font-medium">{filteredStudents.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                      >
                        Previous
                      </button>

                      {/* Page Dropdown */}
                      <div className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                        <span className="mr-2">Page</span>
                        <select
                          value={currentPage}
                          onChange={(e) => handlePageChange(Number(e.target.value))}
                          className="form-select block w-full pl-3 pr-8 py-1 text-base border-gray-300 focus:outline-none focus:ring-brand-900 focus:border-brand-900 sm:text-sm rounded-md"
                        >
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                            <option key={number} value={number}>
                              {number}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Student"
        message="Are you sure you want to delete this student? This action cannot be undone and all associated data will be permanently removed."
        confirmText="Delete Student"
        isLoading={isDeleting}
      />

      <ToastContainer position="bottom-right" theme="colored" aria-label="Toast Notifications" />
    </div>
  );
};

export default Dashboard;