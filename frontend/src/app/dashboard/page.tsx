'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, FileText, Calendar, Users, ArrowRight, Clock, Plus, Database, Trash2 } from 'lucide-react';
import { format, isAfter, startOfDay } from 'date-fns';
import AppLayout from '@/components/layout/AppLayout';
import EmptyAssignmentsIllustration from '@/components/illustrations/EmptyAssignmentsIllustration';
import { assignmentsApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Assignment } from '@/types';
import AssignmentCard from '@/components/assignments/AssignmentCard';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await assignmentsApi.list();
        setAssignments(res.data.data || []);
      } catch {
        // Silently fail, user sees 0
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  // Compute stats
  const totalAssignments = assignments.length;
  const uniqueClasses = new Set(assignments.map(a => a.className)).size;
  const upcomingDeadlines = assignments.filter(a => a.dueDate && isAfter(new Date(a.dueDate), startOfDay(new Date()))).length;

  const recentAssignments = [...assignments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);

  const getFirstName = () => user?.name?.split(' ')[0] || 'Teacher';

  const handleDelete = async (id: string) => {
    try {
      await assignmentsApi.delete(id);
      setAssignments((prev) => prev.filter((a) => a._id !== id));
    } catch {
      alert('Failed to delete assignment.');
    }
  };

  const handleView = (a: Assignment) => {
    if (a.status === 'completed' && a.jobId) {
      router.push(`/assignments/result/${a.jobId}`);
    } else if (a.status === 'processing' || a.status === 'pending') {
      alert('This assignment is still generating. Please wait a moment.');
    } else if (a.status === 'failed') {
      alert('Generation failed. Please delete this assignment and try again.');
    }
  };

  const handleDemoToggle = async () => {
    if (assignments.length > 0) {
      // Delete all assignments
      if (!confirm('Delete all demo data? This cannot be undone.')) return;
      try {
        await Promise.all(assignments.map(a => assignmentsApi.delete(a._id)));
        setAssignments([]);
      } catch {
        alert('Failed to delete demo data.');
      }
    } else {
      // Load demo data
      try {
        await assignmentsApi.seed();
        const res = await assignmentsApi.list();
        setAssignments(res.data.data || []);
      } catch {
        alert('Failed to load demo data.');
      }
    }
  };

  if (loading) {
    return (
      <AppLayout title="Dashboard">
        <div className="flex items-center justify-center min-h-[calc(100vh-56px)]">
          <div className="w-10 h-10 border-4 border-[var(--color-border)] border-t-[var(--color-dark)] rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Dashboard">
      <div className="pb-8">
        
        {/* Welcome Banner */}
        <div className="relative overflow-hidden bg-[#111111] rounded-[16px] p-8 sm:p-10 text-white mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-[0_4px_24px_rgba(0,0,0,0.12)]">
          {/* Subtle gradient blob for premium feel */}
          <div className="absolute top-[-30%] right-[-5%] w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(216, 67, 21, 0.2) 0%, rgba(17,17,17,0) 70%)' }} />
          
          <div className="relative z-10 mb-6 sm:mb-0">
            <h1 className="font-heading text-3xl font-extrabold mb-2 tracking-tight text-white">
              Welcome back, {getFirstName()}! 👋
            </h1>
            <p className="font-body text-[15px] text-[#A3A3A3] font-medium">
              Here is what is happening with your classes today.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto relative z-10 mt-4 sm:mt-0">
            <button 
              onClick={handleDemoToggle}
              className={`flex items-center justify-center gap-2 py-3 px-6 rounded-full font-heading font-bold text-sm border-none cursor-pointer transition-all duration-300 hover:-translate-y-0.5 ${
                assignments.length > 0
                  ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {assignments.length > 0 ? <><Trash2 size={16} /> Delete Demo Data</> : <><Database size={16} /> Load Demo Data</>}
            </button>
            <Link href="/assignments/create" className="flex items-center justify-center gap-2 bg-white text-[#111111] py-3 px-6 rounded-full font-heading font-bold text-sm no-underline transition-all duration-300 shadow-[0_4px_12px_rgba(255,255,255,0.1)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(255,255,255,0.25)] hover:bg-gray-50">
              <Sparkles size={16} strokeWidth={2.5} /> Create Assignment
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="group relative overflow-hidden bg-white rounded-[16px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 cursor-default transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#D84315] opacity-[0.03] blur-2xl rounded-full group-hover:opacity-[0.06] transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <p className="font-heading text-[13px] text-[#8C8C8C] font-bold uppercase tracking-wider">Total Assignments</p>
                <div className="w-10 h-10 rounded-xl bg-[#FFF4F1] flex items-center justify-center border border-[#FFE0D6] group-hover:scale-110 transition-transform duration-300">
                  <FileText size={18} color="#D84315" strokeWidth={2.5} />
                </div>
              </div>
              <h2 className="font-heading text-[42px] font-extrabold text-[#111111] leading-none tracking-tight">{totalAssignments}</h2>
            </div>
          </div>
          
          <div className="group relative overflow-hidden bg-white rounded-[16px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 cursor-default transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#0EA5E9] opacity-[0.03] blur-2xl rounded-full group-hover:opacity-[0.06] transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <p className="font-heading text-[13px] text-[#8C8C8C] font-bold uppercase tracking-wider">Classes Managed</p>
                <div className="w-10 h-10 rounded-xl bg-[#F0F9FF] flex items-center justify-center border border-[#E0F2FE] group-hover:scale-110 transition-transform duration-300">
                  <Users size={18} color="#0EA5E9" strokeWidth={2.5} />
                </div>
              </div>
              <h2 className="font-heading text-[42px] font-extrabold text-[#111111] leading-none tracking-tight">{uniqueClasses}</h2>
            </div>
          </div>
          
          <div className="group relative overflow-hidden bg-white rounded-[16px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 cursor-default transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#EF4444] opacity-[0.03] blur-2xl rounded-full group-hover:opacity-[0.06] transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <p className="font-heading text-[13px] text-[#8C8C8C] font-bold uppercase tracking-wider">Upcoming Deadlines</p>
                <div className="w-10 h-10 rounded-xl bg-[#FEF2F2] flex items-center justify-center border border-[#FEE2E2] group-hover:scale-110 transition-transform duration-300">
                  <Calendar size={18} color="#EF4444" strokeWidth={2.5} />
                </div>
              </div>
              <h2 className="font-heading text-[42px] font-extrabold text-[#111111] leading-none tracking-tight">{upcomingDeadlines}</h2>
            </div>
          </div>
        </div>

        {/* Recent Assignments */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-heading text-lg font-extrabold text-[#171717]">Recent Assignments</h2>
            <Link href="/assignments" className="flex items-center gap-1 font-body text-[13px] font-semibold text-[#D84315] no-underline hover:text-[#BF360C] transition-colors">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {recentAssignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-[60px] px-5 text-center">
              <div className="mb-6 flex justify-center">
                <EmptyAssignmentsIllustration />
              </div>
              <h3 className="font-heading text-[16px] font-bold text-[#111827] mb-2">No assignments yet</h3>
              <p className="font-body text-[13px] text-[#6B7280] max-w-[400px] leading-relaxed mb-6 font-normal">
                Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading.
              </p>
              <Link href="/assignments/create" className="flex items-center gap-2 bg-[#111111] text-white py-2.5 px-5 rounded-full font-heading text-[13px] font-semibold no-underline transition-transform duration-200 shadow-sm hover:-translate-y-0.5">
                <Plus size={16} strokeWidth={2.5} /> Create Your First Assignment
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recentAssignments.map(a => (
                <AssignmentCard
                  key={a._id}
                  assignment={a}
                  onView={handleView}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </AppLayout>
  );
}
