
import React, { useState, useMemo, useCallback } from 'react';
import { Plus, GripVertical, Trash2, Search, Filter, Calendar as CalendarIcon, Hash, Type } from 'lucide-react';

const StudentAssignmentTracker = () => {
    const [assignments, setAssignments] = useState([
        { id: 1, title: 'Quantum Physics Problem Set', subject: 'Physics 301', dueDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(), priority: 'High', completed: false },
        { id: 2, title: 'Essay on Renaissance Art', subject: 'Art History 210', dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(), priority: 'Medium', completed: false },
        { id: 3, title: 'Complete Calculus Chapter 5', subject: 'Math 205', dueDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), priority: 'High', completed: true },
        { id: 4, title: 'Develop React Portfolio App', subject: 'CS 450', dueDate: new Date().toISOString(), priority: 'High', completed: false },
        { id: 5, title: 'Read "The Great Gatsby"', subject: 'Literature 101', dueDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(), priority: 'Low', completed: false },
    ]);

    const [newAssignment, setNewAssignment] = useState({ title: '', subject: '', dueDate: '', priority: 'Medium' });
    const [errors, setErrors] = useState({ title: '', dueDate: '' });
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [draggedItemIndex, setDraggedItemIndex] = useState(null);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setNewAssignment(prev => ({ ...prev, [name]: value }));
        if (value.trim() !== '') {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    }, []);

    const validateForm = () => {
        let formIsValid = true;
        const newErrors = { title: '', dueDate: '' };

        if (!newAssignment.title.trim()) {
            newErrors.title = 'Assignment title is required.';
            formIsValid = false;
        }
        if (!newAssignment.dueDate) {
            newErrors.dueDate = 'Due date is required.';
            formIsValid = false;
        } else if (new Date(newAssignment.dueDate) < new Date(new Date().setHours(0, 0, 0, 0))) {
            newErrors.dueDate = 'Due date cannot be in the past.';
            // This is a warning, not a hard stop, so we don't set formIsValid to false
        }
        
        setErrors(newErrors);
        return formIsValid && newErrors.dueDate === '';
    };

    const addAssignment = useCallback((e) => {
        e.preventDefault();
        if (validateForm()) {
            const newId = assignments.length > 0 ? Math.max(...assignments.map(a => a.id)) + 1 : 1;
            setAssignments(prev => [{ ...newAssignment, id: newId, completed: false }, ...prev]);
            setNewAssignment({ title: '', subject: '', dueDate: '', priority: 'Medium' });
        }
    }, [newAssignment, assignments]);

    const toggleComplete = useCallback((id) => {
        setAssignments(prev => prev.map(a => a.id === id ? { ...a, completed: !a.completed } : a));
    }, []);

    const deleteAssignment = useCallback((id) => {
        setAssignments(prev => prev.filter(a => a.id !== id));
    }, []);

    const formatDueDate = useCallback((dateString) => {
        if (!dateString) return { text: 'No date', color: 'text-slate-500' };
        const date = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(date.valueOf());
        dueDate.setHours(0, 0, 0, 0);

        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return { text: `Overdue by ${Math.abs(diffDays)} day(s)`, color: 'text-rose-500 font-semibold' };
        if (diffDays === 0) return { text: 'Due Today', color: 'text-amber-500 font-semibold' };
        if (diffDays === 1) return { text: 'Due Tomorrow', color: 'text-yellow-500' };
        return { text: `Due in ${diffDays} days`, color: 'text-emerald-500' };
    }, []);

    const priorityStyles = {
        High: 'bg-rose-100 text-rose-700 border-rose-200',
        Medium: 'bg-amber-100 text-amber-700 border-amber-200',
        Low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    };

    const filteredAssignments = useMemo(() => {
        return assignments
            .filter(a => {
                if (filter === 'completed') return a.completed;
                if (filter === 'active') return !a.completed;
                return true;
            })
            .filter(a =>
                a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.subject.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [assignments, filter, searchTerm]);

    const completionProgress = useMemo(() => {
        const total = assignments.length;
        if (total === 0) return 0;
        const completedCount = assignments.filter(a => a.completed).length;
        return Math.round((completedCount / total) * 100);
    }, [assignments]);
    
    const handleDragStart = useCallback((e, index) => {
        setDraggedItemIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    }, []);

    const handleDragOver = useCallback((e, index) => {
        e.preventDefault();
        if (draggedItemIndex === null || draggedItemIndex === index) return;
        
        const newAssignments = [...assignments];
        const [draggedItem] = newAssignments.splice(draggedItemIndex, 1);
        newAssignments.splice(index, 0, draggedItem);
        
        setAssignments(newAssignments);
        setDraggedItemIndex(index);
    }, [draggedItemIndex, assignments]);

    const handleDragEnd = useCallback(() => {
        setDraggedItemIndex(null);
    }, []);

    return (
        <div className="bg-slate-50 min-h-screen font-sans text-slate-800 p-4 sm:p-6 lg:p-8">
            <style>{`
                .animate-fade-in { animation: fadeIn 0.5s ease-in-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                .checkbox-custom:checked { background-color: #4f46e5; border-color: #4f46e5; }
                .checkbox-custom:checked::before { transform: scale(1); }
                .checkbox-custom::before { content: ''; display: block; width: 0.65rem; height: 0.65rem; transform: scale(0); transition: 120ms transform ease-in-out; box-shadow: inset 1em 1em white; transform-origin: bottom left; clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%); }
            `}</style>
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Assignment Tracker</h1>
                    <p className="text-lg text-slate-500 mt-1">Stay organized and conquer your deadlines.</p>
                </header>
                
                <div className="mb-8 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                         <span className="text-sm font-medium text-slate-600">Overall Progress</span>
                         <span className="text-sm font-bold text-indigo-600">{completionProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${completionProgress}%` }}></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <aside className="lg:col-span-1 space-y-8">
                        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                            <h2 className="text-2xl font-bold text-slate-800 mb-4">Add Assignment</h2>
                            <form onSubmit={addAssignment} className="space-y-4">
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-slate-600 mb-1">Title</label>
                                    <div className="relative">
                                        <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input type="text" id="title" name="title" value={newAssignment.title} onChange={handleInputChange} placeholder="e.g., Physics Lab Report" className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
                                    </div>
                                    {errors.title && <p className="text-rose-500 text-xs mt-1">{errors.title}</p>}
                                </div>
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-slate-600 mb-1">Subject (Optional)</label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input type="text" id="subject" name="subject" value={newAssignment.subject} onChange={handleInputChange} placeholder="e.g., Physics 101" className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="dueDate" className="block text-sm font-medium text-slate-600 mb-1">Due Date</label>
                                    <div className="relative">
                                         <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input type="date" id="dueDate" name="dueDate" value={newAssignment.dueDate} onChange={handleInputChange} className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
                                    </div>
                                    {errors.dueDate && <p className="text-rose-500 text-xs mt-1">{errors.dueDate}</p>}
                                </div>
                                <div>
                                    <label htmlFor="priority" className="block text-sm font-medium text-slate-600 mb-1">Priority</label>
                                    <select id="priority" name="priority" value={newAssignment.priority} onChange={handleInputChange} className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white">
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>
                                </div>
                                <button type="submit" className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200">
                                    <Plus size={18} />
                                    Add Assignment
                                </button>
                            </form>
                        </div>
                        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                             <h3 className="text-xl font-bold text-slate-800 mb-4">Controls</h3>
                             <div className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input type="text" placeholder="Search assignments..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Filter size={20} className="text-slate-500"/>
                                    <div className="flex space-x-2">
                                        {['all', 'active', 'completed'].map(f => (
                                            <button key={f} onClick={() => setFilter(f)} className={`capitalize px-3 py-1 text-sm font-medium rounded-full transition ${filter === f ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                             </div>
                        </div>
                    </aside>
                    <main className="lg:col-span-2">
                        <div className="space-y-4">
                            {filteredAssignments.length > 0 ? (
                                filteredAssignments.map((assignment, index) => {
                                    const { text: dueDateText, color: dueDateColor } = formatDueDate(assignment.dueDate);
                                    return (
                                        <div
                                            key={assignment.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, index)}
                                            onDragOver={(e) => handleDragOver(e, index)}
                                            onDragEnd={handleDragEnd}
                                            className={`animate-fade-in group flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1 cursor-grab ${draggedItemIndex === index ? 'opacity-50' : ''} ${assignment.completed ? 'opacity-60' : ''}`}
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <div className="flex-shrink-0 pt-1">
                                                <GripVertical className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                                            </div>
                                            <input
                                                type="checkbox"
                                                id={`task-${assignment.id}`}
                                                checked={assignment.completed}
                                                onChange={() => toggleComplete(assignment.id)}
                                                aria-label={`Mark ${assignment.title} as complete`}
                                                className="checkbox-custom appearance-none h-6 w-6 mt-0.5 border-2 border-slate-300 rounded-md shrink-0 cursor-pointer transition-colors"
                                            />
                                            <div className="flex-grow">
                                                <p className={`font-semibold text-slate-800 ${assignment.completed ? 'line-through text-slate-500' : ''}`}>
                                                    {assignment.title}
                                                </p>
                                                {assignment.subject && <p className={`text-sm text-slate-500 ${assignment.completed ? 'line-through' : ''}`}>{assignment.subject}</p>}
                                                <div className="flex items-center gap-4 mt-2 text-sm">
                                                    <span className={`flex items-center gap-1.5 ${dueDateColor}`}>
                                                        <CalendarIcon size={14} /> {dueDateText}
                                                    </span>
                                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${priorityStyles[assignment.priority]}`}>
                                                        {assignment.priority} Priority
                                                    </span>
                                                </div>
                                            </div>
                                            <button onClick={() => deleteAssignment(assignment.id)} aria-label={`Delete ${assignment.title}`} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-rose-500 p-1 rounded-full">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-16 px-6 bg-white rounded-xl border border-dashed border-slate-300">
                                    <h3 className="text-xl font-semibold text-slate-700">No Assignments Found</h3>
                                    <p className="text-slate-500 mt-2">
                                        {searchTerm ? 'Try a different search term.' : (filter === 'completed' ? 'No completed assignments yet.' : 'Add a new assignment to get started!')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default StudentAssignmentTracker;
