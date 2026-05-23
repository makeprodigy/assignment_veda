'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, Trash2, Plus, Sparkles, ChevronDown, Check, CalendarIcon, ArrowLeft, ArrowRight, CloudUpload, Mic } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import QuestionTypeRow from '@/components/create/QuestionTypeRow';
import LoadingJob from '@/components/shared/LoadingJob';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useJobStore } from '@/store/jobStore';
import { assignmentsApi } from '@/lib/api';
import { wsClient } from '@/lib/websocket';

export default function CreateAssignmentPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showLoading, setShowLoading] = useState(false);

  const [isOtherClass, setIsOtherClass] = useState(false);
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');

  const handleTimeChange = (h: string, m: string) => {
    setHours(h);
    setMinutes(m);
    const parts = [];
    if (h && h !== '0') parts.push(`${h} hour${h === '1' ? '' : 's'}`);
    if (m && m !== '0') parts.push(`${m} minute${m === '1' ? '' : 's'}`);
    store.setField('timeAllowed', parts.join(' '));
  };

  const store = useAssignmentStore();
  const jobStore = useJobStore();

  const totalQuestions = store.questionTypes.reduce((s, q) => s + q.count, 0);
  const totalMarks = store.questionTypes.reduce((s, q) => s + q.count * q.marks, 0);

  const handleFileSelect = (file: File) => {
    store.setFile(file);
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!store.dueDate) e.dueDate = 'Due date is required';
    if (store.questionTypes.length === 0) e.questionTypes = 'Add at least one question type';
    store.questionTypes.forEach((q, i) => {
      if (q.count < 1) e[`count_${i}`] = 'Count must be at least 1';
      if (q.marks < 1) e[`marks_${i}`] = 'Marks must be at least 1';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!store.subject.trim()) e.subject = 'Subject is required';
    if (!store.topic.trim()) e.topic = 'Topic is required';
    if (!store.className.trim()) e.className = 'Class is required';
    if (!store.schoolName.trim()) e.schoolName = 'School name is required';
    if (!store.timeAllowed.trim()) e.timeAllowed = 'Time allowed is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) store.nextStep();
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('subject', store.subject);
      formData.append('topic', store.topic);
      formData.append('className', store.className);
      formData.append('schoolName', store.schoolName);
      formData.append('timeAllowed', store.timeAllowed);
      formData.append('dueDate', store.dueDate);
      formData.append('additionalInfo', store.additionalInfo);
      
      formData.append('questionTypes', JSON.stringify(store.questionTypes));

      if (store.uploadedFile) {
        formData.append('file', store.uploadedFile);
      }

      store.diagramFiles.forEach((df, i) => {
        formData.append(`diagram_${i}`, df.file);
      });

      const res = await assignmentsApi.create(formData);
      const { jobId } = res.data.data;

      jobStore.setJob(jobId);
      setShowLoading(true);

      wsClient.connect(
        jobId,
        (progress, message) => jobStore.setProgress(progress, message),
        (resultId) => {
          wsClient.disconnect();
          jobStore.setComplete(resultId);
          setShowLoading(false);
          store.reset();
          setHours('');
          setMinutes('');
          setIsOtherClass(false);
          router.push(`/assignments/result/${jobId}`);
        },
        (error) => {
          wsClient.disconnect();
          jobStore.setFailed(error);
          setShowLoading(false);
          alert(`Generation failed: ${error}`);
        }
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create assignment';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const step = store.currentStep;

  return (
    <AppLayout title="Create Assignment" backHref="/dashboard">
      {showLoading && <LoadingJob />}

      {/* Mobile Page Header */}
      <div className="flex md:hidden items-center justify-between mb-2 mt-2 px-4 relative">
        <button onClick={() => router.back()} className="absolute left-4 w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-100 shadow-sm cursor-pointer z-10">
          <ArrowLeft size={16} className="text-[#171717]" />
        </button>
        <h1 className="w-full text-center font-heading text-lg font-bold text-[#171717]">Create Assignment</h1>
      </div>

      <div className="max-w-[720px] mx-auto my-4 md:my-6 px-4 sm:px-5 pb-24">
        {/* Step Indicator */}
        <div className="flex items-center gap-4 mb-4 md:mb-6">
          <div className="flex-1 h-1.5 bg-[#171717] rounded-full" />
          <div className={`flex-1 h-1.5 rounded-full transition-colors duration-300 ${step === 2 ? 'bg-[#171717]' : 'bg-[#E5E5E5]'}`} />
        </div>

        <div className="bg-[#F3F4F6] rounded-[32px] p-5 sm:p-8 shadow-sm">

        {/* ─── STEP 1 ─── */}
        {step === 1 && (
          <div className="fade-in">
            <div className="mb-6">
              <h2 className="font-heading text-xl font-bold mb-1 tracking-tight text-[#171717]">
                Assignment Details
              </h2>
              <p className="text-[#A3A3A3] text-[12px] font-medium mt-1">
                Set up a new assignment for your students
              </p>
            </div>

            {/* File Upload */}
            <div
              className={`upload-zone mb-3 py-8 px-5 rounded-2xl border-2 border-dashed border-[#E5E5E5] bg-white text-center cursor-pointer ${dragOver ? 'drag-over' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f); }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.png,.jpg,.jpeg"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
              />
              <CloudUpload size={28} className="text-[#171717] mx-auto mb-3" />
              {store.uploadedFileName ? (
                <p className="font-inter font-semibold text-sm text-[#171717]">{store.uploadedFileName}</p>
              ) : (
                <>
                  <p className="font-inter font-semibold text-sm mb-1.5 text-[#171717]">
                    Choose a file or drag & drop it here
                  </p>
                  <p className="text-[#A9A9A9] text-xs mb-4">JPEG, PNG, upto 10MB</p>
                  <button type="button" className="bg-[#F4F4F4] border border-[#EFEFEF] rounded-full py-1.5 px-4 text-[13px] font-semibold text-[#171717] pointer-events-none">Browse Files</button>
                </>
              )}
            </div>
            <p className="text-center text-[13px] text-[#A9A9A9] mb-6">Upload images of your preferred document/image</p>

            {/* Due Date */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-[#171717] mb-2 uppercase tracking-wider">Due Date</label>
              <div className="relative">
                  <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={store.dueDate}
                  onChange={(e) => store.setField('dueDate', e.target.value)}
                  className={`form-input rounded-full w-full ${errors.dueDate ? 'error' : ''}`}
                />
              </div>
              {errors.dueDate && <p className="form-error">{errors.dueDate}</p>}
            </div>

            {/* Question Structure */}
            <div className="mb-4">
              {/* Column headers */}
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 pb-2">
                <span className="font-heading text-sm font-bold text-[#171717]">Question Type</span>
                <span />
                <span className="font-inter text-[13px] font-semibold text-[#171717] text-center min-w-[130px]">No. of Questions</span>
                <span className="font-inter text-[13px] font-semibold text-[#171717] text-center min-w-[110px]">Marks</span>
              </div>

              {store.questionTypes.map((qt, i) => (
                <QuestionTypeRow
                  key={i}
                  config={qt}
                  index={i}
                  diagramFile={store.diagramFiles.find(d => d.index === i)?.file}
                  onUpdate={store.updateQuestionType}
                  onRemove={store.removeQuestionType}
                  onDiagramUpload={store.setDiagramFile}
                  onDiagramRemove={store.removeDiagramFile}
                />
              ))}
              {errors.questionTypes && <p className="form-error">{errors.questionTypes}</p>}

              {/* Add button */}
              <button
                onClick={store.addQuestionType}
                className="flex items-center gap-3 mt-4 bg-transparent border-none cursor-pointer font-heading text-[14px] font-bold text-[#171717]"
              >
                <div className="w-8 h-8 rounded-full bg-[#171717] flex items-center justify-center">
                  <Plus size={18} color="white" strokeWidth={2.5} />
                </div>
                Add Question Type
              </button>
            </div>

            {/* Totals */}
            <div className="flex justify-end mt-4 mb-6">
              <div className="flex flex-col items-end gap-2">
                <div className="font-inter text-[13px] text-[#171717] font-medium">
                  Total Questions : <strong className="text-sm font-bold">{totalQuestions}</strong>
                </div>
                <div className="font-inter text-[13px] text-[#171717] font-medium">
                  Total Marks : <strong className="text-sm font-bold">{totalMarks}</strong>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mb-8">
              <label className="block text-sm font-bold text-[#171717] mb-2 uppercase tracking-wider">Additional Information <span className="text-[#171717] font-bold">(For better output)</span></label>
              <div className="relative">
                <textarea
                  value={store.additionalInfo}
                  onChange={(e) => store.setField('additionalInfo', e.target.value)}
                  placeholder="e.g Generate a question paper for 3 hour exam duration..."
                  rows={4}
                  className="form-input rounded-[20px] border-2 border-dashed border-[#E5E5E5] resize-y pr-12 p-4 w-full"
                />
                <Mic size={20} className="absolute right-3.5 bottom-3.5 text-[#171717] cursor-pointer" />
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button className="sharp-btn-secondary" onClick={() => router.push('/dashboard')}>← Previous</button>
              <button className="sharp-btn-primary" onClick={handleNext}>Next →</button>
            </div>
          </div>
        )}

        {/* ─── STEP 2 ─── */}
        {step === 2 && (
          <div className="fade-in">
            <div className="mb-6">
              <h2 className="font-heading text-xl font-bold mb-1 tracking-tight text-[#171717]">
                Additional Details
              </h2>
              <p className="text-[#A3A3A3] text-[12px] font-medium mt-1">
                Provide extra context for the assignment
              </p>
            </div>

            {/* Subject + Topic */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-[11px] font-bold text-[#A3A3A3] uppercase tracking-wider mb-2 font-inter">Subject</label>
                <input value={store.subject} onChange={(e) => store.setField('subject', e.target.value)} className={`w-full bg-white rounded-full border-none shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-5 py-3.5 text-[14px] font-semibold text-[#171717] outline-none placeholder:text-[#A3A3A3] ${errors.subject ? 'border-red-500 border' : ''}`} placeholder="e.g. Science" />
                {errors.subject && <p className="form-error">{errors.subject}</p>}
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#A3A3A3] uppercase tracking-wider mb-2 font-inter">Topic</label>
                <input value={store.topic} onChange={(e) => store.setField('topic', e.target.value)} className={`w-full bg-white rounded-full border-none shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-5 py-3.5 text-[14px] font-semibold text-[#171717] outline-none placeholder:text-[#A3A3A3] ${errors.topic ? 'border-red-500 border' : ''}`} placeholder="e.g. Electricity" />
                {errors.topic && <p className="form-error">{errors.topic}</p>}
              </div>
            </div>

            {/* Class + School */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-[11px] font-bold text-[#A3A3A3] uppercase tracking-wider mb-2 font-inter">Class / Grade</label>
                {!isOtherClass ? (
                  <select
                    value={store.className}
                    onChange={(e) => {
                      if (e.target.value === 'Other') {
                        setIsOtherClass(true);
                        store.setField('className', '');
                      } else {
                        store.setField('className', e.target.value);
                      }
                    }}
                    className={`w-full bg-white rounded-full border-none shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-5 py-3.5 text-[14px] font-semibold text-[#171717] outline-none appearance-none ${errors.className ? 'border-red-500 border' : ''}`}
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23171717' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
                  >
                    <option value="" disabled>Select a class</option>
                    <option value="1st Grade">1st Grade</option>
                    <option value="2nd Grade">2nd Grade</option>
                    <option value="3rd Grade">3rd Grade</option>
                    <option value="4th Grade">4th Grade</option>
                    <option value="5th Grade">5th Grade</option>
                    <option value="6th Grade">6th Grade</option>
                    <option value="7th Grade">7th Grade</option>
                    <option value="8th Grade">8th Grade</option>
                    <option value="9th Grade">9th Grade</option>
                    <option value="10th Grade">10th Grade</option>
                    <option value="11th Grade">11th Grade</option>
                    <option value="12th Grade">12th Grade</option>
                    <option value="Other">Other...</option>
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={store.className}
                      onChange={(e) => store.setField('className', e.target.value)}
                      className={`w-full bg-white rounded-full border-none shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-5 py-3.5 text-[14px] font-semibold text-[#171717] outline-none ${errors.className ? 'border-red-500 border' : ''}`}
                      placeholder="Specify class"
                      autoFocus
                    />
                    <button
                      type="button"
                      className="bg-[#171717] text-white rounded-full px-4 font-bold text-[12px] border-none cursor-pointer"
                      onClick={() => {
                        setIsOtherClass(false);
                        store.setField('className', '');
                      }}
                    >
                      Back
                    </button>
                  </div>
                )}
                {errors.className && <p className="form-error">{errors.className}</p>}
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#A3A3A3] uppercase tracking-wider mb-2 font-inter">School Name</label>
                <input value={store.schoolName} onChange={(e) => store.setField('schoolName', e.target.value)} className={`w-full bg-white rounded-full border-none shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-5 py-3.5 text-[14px] font-semibold text-[#171717] outline-none placeholder:text-[#A3A3A3] ${errors.schoolName ? 'border-red-500 border' : ''}`} placeholder="e.g. Delhi Public School" />
                {errors.schoolName && <p className="form-error">{errors.schoolName}</p>}
              </div>
            </div>

            {/* Time Allowed */}
            <div className="mb-10">
              <label className="block text-[11px] font-bold text-[#A3A3A3] uppercase tracking-wider mb-2 font-inter">Time Allowed</label>
              <div className="flex gap-4">
                <div className={`flex items-center justify-between rounded-full flex-1 bg-white border-none shadow-[0_2px_8px_rgba(0,0,0,0.04)] h-[52px] px-5 ${errors.timeAllowed ? 'border-red-500 border' : ''}`}>
                  <button type="button" className="counter-btn w-6 h-6 text-xl flex items-center justify-center text-[#171717]" onClick={() => handleTimeChange((Math.max(0, parseInt(hours || '0') - 1)).toString(), minutes)}>−</button>
                  <label className="flex items-center justify-center flex-1 cursor-text h-full py-2">
                    <input
                      type="number"
                      className="hide-spin-button w-8 text-right border-none outline-none text-base bg-transparent text-[#171717] font-semibold p-0 focus:ring-0"
                      min="0"
                      placeholder="0"
                      value={hours}
                      onChange={(e) => {
                        if (e.target.value === '') handleTimeChange('', minutes);
                        else handleTimeChange(Math.max(0, parseInt(e.target.value)).toString(), minutes);
                      }}
                    />
                    <span className="text-base text-[#A3A3A3] ml-1 font-semibold select-none">hrs</span>
                  </label>
                  <button type="button" className="counter-btn w-6 h-6 text-xl flex items-center justify-center text-[#171717]" onClick={() => handleTimeChange((parseInt(hours || '0') + 1).toString(), minutes)}>+</button>
                </div>
                <div className={`flex items-center justify-between rounded-full flex-1 bg-white border-none shadow-[0_2px_8px_rgba(0,0,0,0.04)] h-[52px] px-5 ${errors.timeAllowed ? 'border-red-500 border' : ''}`}>
                  <button type="button" className="counter-btn w-6 h-6 text-xl flex items-center justify-center text-[#171717]" onClick={() => handleTimeChange(hours, (Math.max(0, parseInt(minutes || '0') - 1)).toString())}>−</button>
                  <label className="flex items-center justify-center flex-1 cursor-text h-full py-2">
                    <input
                      type="number"
                      className="hide-spin-button w-8 text-right border-none outline-none text-base bg-transparent text-[#171717] font-semibold p-0 focus:ring-0"
                      min="0"
                      max="59"
                      placeholder="0"
                      value={minutes}
                      onChange={(e) => {
                        if (e.target.value === '') handleTimeChange(hours, '');
                        else handleTimeChange(hours, Math.max(0, parseInt(e.target.value)).toString());
                      }}
                    />
                    <span className="text-base text-[#A3A3A3] ml-1 font-semibold select-none">mins</span>
                  </label>
                  <button type="button" className="counter-btn w-6 h-6 text-xl flex items-center justify-center text-[#171717]" onClick={() => handleTimeChange(hours, (Math.min(59, parseInt(minutes || '0') + 1)).toString())}>+</button>
                </div>
              </div>
              {errors.timeAllowed && <p className="form-error">{errors.timeAllowed}</p>}
            </div>

            {/* Navigation */}
            <div className="flex justify-center gap-3 sm:gap-4 mt-8 pb-4">
              <button 
                className="flex flex-col items-center justify-center bg-white text-[#171717] rounded-[32px] w-[120px] h-[72px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] border-none font-bold text-[14px] font-heading transition-all active:scale-95 cursor-pointer" 
                onClick={() => store.prevStep()}
              >
                <ArrowLeft size={18} strokeWidth={2.5} className="mb-0.5" /> Previous
              </button>
              <button 
                className="flex flex-col items-center justify-center bg-[#171717] text-white rounded-[32px] flex-1 max-w-[200px] h-[72px] shadow-[0_4px_16px_rgba(0,0,0,0.15)] border-none font-bold text-[15px] font-heading transition-all active:scale-95 cursor-pointer"
                onClick={handleSubmit} disabled={isSubmitting}
              >
                <span>{isSubmitting ? 'Creating...' : 'Create'}</span>
                <span className="flex items-center gap-1">{isSubmitting ? '' : 'Assignment'} {!isSubmitting && <ArrowRight size={16} strokeWidth={2.5} />}</span>
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </AppLayout>
  );
}
