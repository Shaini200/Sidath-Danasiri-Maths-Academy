import { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Search, Edit, Trash2, GraduationCap, Users, ChevronRight, X, Save, FileDown } from 'lucide-react';
import StudentDetailDrawer from '../components/StudentDetailDrawer';
import { jsPDF } from 'jspdf';
import { apiUrl } from '../lib/api';

const GRADES = ['All', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'];
const GRADE_COLORS = {
    'All': { tab: '#6366f1', light: '#eef2ff' },
    'Grade 1': { tab: '#0ea5e9', light: '#e0f2fe' },
    'Grade 2': { tab: '#10b981', light: '#d1fae5' },
    'Grade 3': { tab: '#f59e0b', light: '#fef3c7' },
    'Grade 4': { tab: '#ef4444', light: '#fee2e2' },
    'Grade 5': { tab: '#8b5cf6', light: '#ede9fe' },
};

const iStyle = {
    padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px',
    fontSize: '14px', color: '#1e293b', outline: 'none', width: '100%',
    boxSizing: 'border-box', background: '#fff', fontFamily: 'inherit', resize: 'vertical',
};

/* ── PDF Export ── */
const exportAddressesPDF = (students, grade, month) => {
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    const title = month && month !== 'All'
        ? `Paid Students - ${month}`
        : 'Student Address Book';
    doc.text(title, pageW / 2, 18, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    const subTitle = `Grade: ${grade === 'All' ? 'All Grades' : grade}${month && month !== 'All' ? `  |  Month: ${month}` : ''}  |  Generated: ${new Date().toLocaleDateString()}`;
    doc.text(subTitle, pageW / 2, 25, { align: 'center' });

    // Divider
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 29, pageW - 14, 29);

    let y = 38;
    const lineH = 7;
    const margin = 14;

    students.forEach((s, i) => {
        // Check page overflow
        if (y > 270) { doc.addPage(); y = 20; }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);
        doc.text(`${i + 1}. ${s.name}`, margin, y);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(`ID: ${s.student_id}  |  ${s.grade}`, margin + 4, y + lineH - 1);

        // Address lines
        const addressLines = (s.address || 'No address provided')
            .split(',')
            .map(l => l.trim())
            .filter(Boolean);

        doc.setFontSize(10);
        doc.setTextColor(51, 65, 85);
        let ay = y + lineH * 2 - 1;
        addressLines.forEach(line => {
            if (ay > 275) { doc.addPage(); ay = 20; }
            doc.text(line, margin + 4, ay);
            ay += lineH - 1;
        });

        // separator
        const blockEnd = ay + 3;
        if (blockEnd < 275) {
            doc.setDrawColor(241, 245, 249);
            doc.line(margin, blockEnd, pageW - margin, blockEnd);
        }
        y = blockEnd + 6;
    });

    doc.save(`student-list-${grade.replace(/\s/g, '-').toLowerCase()}${month !== 'All' ? `-${month.toLowerCase()}` : ''}-${Date.now()}.pdf`);
};

/* ═══════════════════════════════════════════ */
const StudentList = () => {
    const { token, user } = useContext(AuthContext);
    const [students, setStudents] = useState([]);
    const [gradeCounts, setGradeCounts] = useState({});
    const [totalCount, setTotalCount] = useState(0);
    const [selectedGrade, setSelectedGrade] = useState('All');
    const [selectedMonth, setSelectedMonth] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [drawerStudent, setDrawerStudent] = useState(null);
    const [editStudent, setEditStudent] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState('');

    const fetchGradeCounts = useCallback(async () => {
        try {
            const res = await axios.get(apiUrl('/api/students/grade-counts'), { headers: { Authorization: `Bearer ${token}` } });
            const map = {}; let total = 0;
            res.data.forEach(({ grade, count }) => { map[grade] = Number(count); total += Number(count); });
            setGradeCounts(map); setTotalCount(total);
        } catch (e) { console.error(e); }
    }, [token]);

    const fetchStudents = useCallback(async () => {
        setLoading(true);
        try {
            const p = new URLSearchParams();
            if (selectedGrade !== 'All') p.set('grade', selectedGrade);
            if (selectedMonth !== 'All') p.set('month', selectedMonth);
            if (searchTerm.trim()) p.set('search', searchTerm.trim());
            const res = await axios.get(apiUrl(`/api/students/by-grade?${p}`), { headers: { Authorization: `Bearer ${token}` } });
            setStudents(res.data);
        } catch (e) { console.error(e); setStudents([]); }
        finally { setLoading(false); }
    }, [token, selectedGrade, selectedMonth, searchTerm]);

    useEffect(() => { fetchGradeCounts(); }, [fetchGradeCounts]);
    useEffect(() => { fetchStudents(); }, [fetchStudents]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this student?')) return;
        try {
            await axios.delete(apiUrl(`/api/students/${id}`), { headers: { Authorization: `Bearer ${token}` } });
            fetchStudents(); fetchGradeCounts();
        } catch { alert('Failed to delete'); }
    };

    const openEdit = (student, e) => {
        e.stopPropagation();
        setEditStudent(student);
        setEditForm({ name: student.name, address: student.address || '', phone: student.phone || '', grade: student.grade || '', year: student.year || new Date().getFullYear() });
        setEditError('');
    };

    const handleEditSave = async (e) => {
        e.preventDefault(); setEditLoading(true); setEditError('');
        try {
            await axios.put(apiUrl(`/api/students/${editStudent.id}`), editForm, { headers: { Authorization: `Bearer ${token}` } });
            setEditStudent(null); fetchStudents(); fetchGradeCounts();
        } catch (err) { setEditError(err.response?.data?.message || 'Update failed'); }
        finally { setEditLoading(false); }
    };

    const ac = GRADE_COLORS[selectedGrade] || GRADE_COLORS['All'];

    const thStyle = { padding: '12px 20px', fontSize: '11px', fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', whiteSpace: 'nowrap' };
    const tdStyle = { padding: '14px 20px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' };

    return (
        <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif" }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Students Directory</h1>
                    <p style={{ color: '#64748b', marginTop: '4px', fontSize: '14px', margin: '4px 0 0' }}>Browse students by grade · click a row to view details &amp; payments</p>
                </div>
                {/* PDF Export */}
                <button
                    id="export-pdf-btn"
                    onClick={() => exportAddressesPDF(students, selectedGrade, selectedMonth)}
                    disabled={students.length === 0}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '10px 18px', borderRadius: '10px',
                        border: 'none', cursor: students.length === 0 ? 'not-allowed' : 'pointer',
                        background: students.length === 0 ? '#e2e8f0' : '#6366f1',
                        color: students.length === 0 ? '#94a3b8' : '#fff',
                        fontSize: '14px', fontWeight: 700,
                        boxShadow: students.length > 0 ? '0 4px 14px #6366f140' : 'none',
                        transition: 'all 0.2s',
                    }}
                    title="Download student addresses as PDF"
                >
                    <FileDown size={16} />
                    Export PDF
                </button>
            </div>

            {/* Grade tabs */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
                {GRADES.map(grade => {
                    const isActive = selectedGrade === grade;
                    const c = GRADE_COLORS[grade];
                    const count = grade === 'All' ? totalCount : (gradeCounts[grade] ?? 0);
                    return (
                        <button key={grade} id={`grade-tab-${grade.replace(/\s+/g, '-').toLowerCase()}`}
                            onClick={() => { setSelectedGrade(grade); setSearchTerm(''); }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
                                borderRadius: '12px', border: isActive ? `2px solid ${c.tab}` : '2px solid #e2e8f0',
                                background: isActive ? c.tab : '#fff', color: isActive ? '#fff' : '#475569',
                                fontWeight: isActive ? 700 : 500, fontSize: '14px', cursor: 'pointer',
                                transition: 'all 0.2s', fontFamily: 'inherit',
                                boxShadow: isActive ? `0 4px 14px ${c.tab}40` : '0 1px 3px rgba(0,0,0,.06)',
                            }}>
                            <GraduationCap size={16} />
                            {grade}
                            <span style={{ background: isActive ? 'rgba(255,255,255,.25)' : c.light, color: isActive ? '#fff' : c.tab, borderRadius: '20px', padding: '1px 9px', fontSize: '12px', fontWeight: 700 }}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Table card */}
            <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,.07)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>

                {/* Card header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: `3px solid ${ac.tab}`, background: `linear-gradient(135deg,${ac.light} 0%,#fff 100%)` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: ac.tab, borderRadius: '10px', padding: '8px', display: 'flex', alignItems: 'center' }}><Users size={18} color="#fff" /></div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>{selectedGrade === 'All' ? 'All Students' : selectedGrade}</h2>
                            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{loading ? 'Loading…' : `${students.length} student${students.length !== 1 ? 's' : ''} found`}</p>
                        </div>
                    </div>
                    {/* Filters */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {/* Month Filter */}
                        <select
                            value={selectedMonth}
                            onChange={e => setSelectedMonth(e.target.value)}
                            style={{ padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', outline: 'none', background: '#fff', color: '#1e293b' }}
                        >
                            <option value="All">All Months (Total)</option>
                            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                                <option key={m} value={m}>{m} (Paid Only)</option>
                            ))}
                        </select>

                        {/* Search */}
                        <div style={{ position: 'relative' }}>
                            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                            <input id="student-search-input" type="text" placeholder="Search by name or ID…" value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                style={{ paddingLeft: '36px', paddingRight: '14px', paddingTop: '9px', paddingBottom: '9px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', outline: 'none', width: '220px', color: '#1e293b', background: '#fff', fontFamily: 'inherit' }}
                                onFocus={e => (e.target.style.borderColor = ac.tab)}
                                onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                        <div style={{ width: '34px', height: '34px', border: `3px solid ${ac.light}`, borderTopColor: ac.tab, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                        Loading students…
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    {['Student ID', 'Full Name', 'Grade', 'Phone', 'Address', ...(user?.role === 'Admin' ? ['Actions'] : [])].map(h => (
                                        <th key={h} style={{ ...thStyle, textAlign: h === 'Actions' ? 'right' : 'left' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {students.length === 0 ? (
                                    <tr><td colSpan={user?.role === 'Admin' ? 6 : 5} style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                                        <GraduationCap size={38} style={{ display: 'block', margin: '0 auto 10px', color: '#cbd5e1' }} />
                                        <div style={{ fontWeight: 600 }}>No {selectedMonth !== 'All' ? 'paid ' : ''}students found{searchTerm ? ` for "${searchTerm}"` : ''}.</div>
                                        <div style={{ fontSize: '13px', marginTop: '4px' }}>
                                            {selectedMonth !== 'All'
                                                ? `No students have paid for ${selectedMonth} in ${selectedGrade === 'All' ? 'any grade' : selectedGrade}.`
                                                : selectedGrade !== 'All' ? `No students in ${selectedGrade} yet.` : 'Register a student to get started.'}
                                        </div>
                                    </td></tr>
                                ) : students.map((s, idx) => {
                                    const gc = GRADE_COLORS[s.grade] || GRADE_COLORS['All'];
                                    return (
                                        <tr key={s.id} onClick={() => setDrawerStudent(s)}
                                            style={{ cursor: 'pointer', transition: 'background 0.15s', background: idx % 2 === 0 ? '#fff' : '#fafbfc' }}
                                            onMouseEnter={e => (e.currentTarget.style.background = gc.light)}
                                            onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#fafbfc')}
                                        >
                                            <td style={tdStyle}>
                                                <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 700, color: ac.tab, background: ac.light, padding: '3px 8px', borderRadius: '6px' }}>{s.student_id}</span>
                                            </td>
                                            <td style={{ ...tdStyle, fontWeight: 600 }}>{s.name}</td>
                                            <td style={tdStyle}>
                                                <span style={{ background: gc.light, color: gc.tab, padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap' }}>{s.grade}</span>
                                            </td>
                                            <td style={{ ...tdStyle, color: '#475569', fontSize: '13px' }}>{s.phone || '—'}</td>
                                            <td style={{ ...tdStyle, color: '#64748b', fontSize: '13px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.address || '—'}</td>
                                            {user?.role === 'Admin' && (
                                                <td style={{ ...tdStyle, textAlign: 'right', whiteSpace: 'nowrap' }}>
                                                    <button id={`edit-${s.id}`} title="Edit" onClick={e => openEdit(s, e)}
                                                        style={{ background: '#eff6ff', color: '#3b82f6', border: 'none', borderRadius: '8px', padding: '7px', cursor: 'pointer', marginRight: '8px', display: 'inline-flex', transition: 'all 0.15s' }}
                                                        onMouseEnter={e => { e.currentTarget.style.background = '#3b82f6'; e.currentTarget.style.color = '#fff'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.color = '#3b82f6'; }}
                                                    ><Edit size={15} /></button>
                                                    <button id={`del-${s.id}`} title="Delete" onClick={e => { e.stopPropagation(); handleDelete(s.id); }}
                                                        style={{ background: '#fff1f2', color: '#ef4444', border: 'none', borderRadius: '8px', padding: '7px', cursor: 'pointer', display: 'inline-flex', transition: 'all 0.15s' }}
                                                        onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.background = '#fff1f2'; e.currentTarget.style.color = '#ef4444'; }}
                                                    ><Trash2 size={15} /></button>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Footer */}
                {!loading && students.length > 0 && (
                    <div style={{ padding: '12px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8' }}>
                        <span>Students</span><ChevronRight size={12} />
                        <span style={{ color: ac.tab, fontWeight: 600 }}>{selectedGrade === 'All' ? 'All Grades' : selectedGrade}</span>
                        {searchTerm && <><ChevronRight size={12} /><span>"{searchTerm}"</span></>}
                        <span style={{ marginLeft: 'auto' }}>Showing {students.length} result{students.length !== 1 ? 's' : ''}</span>
                    </div>
                )}
            </div>

            {/* ── Student Detail Drawer ── */}
            <StudentDetailDrawer student={drawerStudent} onClose={() => setDrawerStudent(null)} />

            {/* ── Edit Modal ── */}
            {editStudent && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}
                    onClick={e => { if (e.target === e.currentTarget) setEditStudent(null); }}>
                    <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '540px', boxShadow: '0 20px 60px rgba(0,0,0,.2)', overflow: 'hidden', margin: '16px' }}>
                        <div style={{ padding: '20px 24px', background: `linear-gradient(135deg,${GRADE_COLORS[editForm.grade]?.light || '#eef2ff'},#fff)`, borderBottom: `3px solid ${GRADE_COLORS[editForm.grade]?.tab || '#6366f1'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>Edit Student</h2>
                                <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#64748b' }}>ID: <strong style={{ fontFamily: 'monospace', color: GRADE_COLORS[editForm.grade]?.tab || '#6366f1' }}>{editStudent.student_id}</strong></p>
                            </div>
                            <button onClick={() => setEditStudent(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', color: '#64748b' }}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleEditSave} style={{ padding: '24px' }}>
                            {editError && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px' }}>{editError}</div>}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                {[{ label: 'Full Name', name: 'name', span: 2 }, { label: 'Grade', name: 'grade', as: 'select' }, { label: 'Year', name: 'year', type: 'number' }, { label: 'Phone', name: 'phone' }, { label: 'Address', name: 'address', as: 'textarea', span: 2 }].map(f => (
                                    <div key={f.name} style={{ gridColumn: f.span ? '1/-1' : undefined }}>
                                        <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: '5px' }}>{f.label}</label>
                                        {f.as === 'select' ? (
                                            <select name={f.name} value={editForm[f.name]} onChange={e => setEditForm(p => ({ ...p, [e.target.name]: e.target.value }))} required style={iStyle}>
                                                <option value="">Select</option>
                                                {['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'].map(g => <option key={g}>{g}</option>)}
                                            </select>
                                        ) : f.as === 'textarea' ? (
                                            <textarea name={f.name} value={editForm[f.name]} onChange={e => setEditForm(p => ({ ...p, [e.target.name]: e.target.value }))} required rows={3} style={iStyle} />
                                        ) : (
                                            <input type={f.type || 'text'} name={f.name} value={editForm[f.name]} onChange={e => setEditForm(p => ({ ...p, [e.target.name]: e.target.value }))} required style={iStyle} />
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                                <button type="button" onClick={() => setEditStudent(null)} style={{ padding: '10px 20px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                                <button type="submit" disabled={editLoading} style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: editLoading ? '#94a3b8' : (GRADE_COLORS[editForm.grade]?.tab || '#6366f1'), color: '#fff', fontSize: '14px', fontWeight: 700, cursor: editLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'inherit' }}>
                                    <Save size={15} />{editLoading ? 'Saving…' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default StudentList;
