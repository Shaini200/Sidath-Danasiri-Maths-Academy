import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { apiUrl } from '../lib/api';
import {
    X, User, Phone, MapPin, GraduationCap, Calendar,
    CreditCard, CheckCircle, Clock
} from 'lucide-react';

const GRADE_COLORS = {
    'Grade 1': { tab: '#0ea5e9', light: '#e0f2fe' },
    'Grade 2': { tab: '#10b981', light: '#d1fae5' },
    'Grade 3': { tab: '#f59e0b', light: '#fef3c7' },
    'Grade 4': { tab: '#ef4444', light: '#fee2e2' },
    'Grade 5': { tab: '#8b5cf6', light: '#ede9fe' },
};
const DEFAULT_COLOR = { tab: '#6366f1', light: '#eef2ff' };

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

const badge = (color, text) => (
    <span style={{
        background: color.light, color: color.tab,
        borderRadius: '20px', padding: '3px 10px',
        fontSize: '12px', fontWeight: 700,
    }}>{text}</span>
);

const InfoRow = ({ icon: Icon, label, value }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ marginTop: '1px', color: '#94a3b8', flexShrink: 0 }}><Icon size={16} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{label}</div>
            <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: 500, marginTop: '2px', wordBreak: 'break-word' }}>{value || '—'}</div>
        </div>
    </div>
);

const StudentDetailDrawer = ({ student, onClose }) => {
    const { token } = useContext(AuthContext);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    const gradeColor = GRADE_COLORS[student?.grade] || DEFAULT_COLOR;

    /* Monthly coverage grid */
    const paidMonths = new Set(payments.map(p => p.month));

    useEffect(() => {
        if (!student) return;
        setLoading(true);
        axios.get(apiUrl(`/api/payments/student/${student.student_id}`), {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setPayments(res.data))
            .catch(err => console.error('payment fetch error:', err))
            .finally(() => setLoading(false));
    }, [student, token]);

    if (!student) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(15,23,42,0.45)',
                    zIndex: 900,
                    backdropFilter: 'blur(3px)',
                    animation: 'fadeIn 0.15s ease',
                }}
            />

            {/* Drawer */}
            <div style={{
                position: 'fixed', top: 0, right: 0, bottom: 0,
                width: '480px', maxWidth: '95vw',
                background: '#fff',
                boxShadow: '-8px 0 40px rgba(0,0,0,.15)',
                zIndex: 901,
                display: 'flex', flexDirection: 'column',
                animation: 'slideInRight 0.25s ease',
                fontFamily: "'Inter','Segoe UI',sans-serif",
            }}>

                {/* ── Header ── */}
                <div style={{
                    padding: '20px 24px',
                    borderBottom: `3px solid ${gradeColor.tab}`,
                    background: `linear-gradient(135deg, ${gradeColor.light} 0%, #fff 100%)`,
                    flexShrink: 0,
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '50%',
                                background: gradeColor.tab, display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                fontSize: '20px', fontWeight: 800, color: '#fff',
                                flexShrink: 0,
                            }}>
                                {student.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>
                                    {student.name}
                                </h2>
                                <div style={{ display: 'flex', gap: '8px', marginTop: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, color: gradeColor.tab, background: gradeColor.light, padding: '2px 8px', borderRadius: '6px' }}>
                                        {student.student_id}
                                    </span>
                                    {badge(gradeColor, student.grade)}
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} style={{
                            background: '#f1f5f9', border: 'none', borderRadius: '8px',
                            padding: '8px', cursor: 'pointer', display: 'flex',
                            alignItems: 'center', color: '#64748b', flexShrink: 0,
                            transition: 'all 0.15s',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* ── Scrollable body ── */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

                    {/* Student Details */}
                    <div style={{ marginBottom: '28px' }}>
                        <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>
                            Student Details
                        </h3>
                        <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0 16px', background: '#fafbfc' }}>
                            <InfoRow icon={User}           label="Full Name"     value={student.name} />
                            <InfoRow icon={GraduationCap}  label="Grade"         value={student.grade} />
                            <InfoRow icon={Calendar}       label="Year"          value={student.year} />
                            <InfoRow icon={Phone}          label="Phone"         value={student.phone} />
                            <InfoRow icon={MapPin}         label="Address"       value={student.address} />
                        </div>
                    </div>

                    {/* Monthly Payment Coverage */}
                    <div style={{ marginBottom: '28px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                                Monthly Coverage
                            </h3>
                            <span style={{
                                fontSize: '12px', fontWeight: 700,
                                color: paidMonths.size > 0 ? '#10b981' : '#94a3b8',
                            }}>
                                {paidMonths.size} / 12 paid
                            </span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                            {MONTHS.map(month => {
                                const paid = paidMonths.has(month);
                                return (
                                    <div key={month} style={{
                                        padding: '8px 4px', borderRadius: '8px', textAlign: 'center',
                                        background: paid ? '#d1fae5' : '#f8fafc',
                                        border: `1px solid ${paid ? '#6ee7b7' : '#e2e8f0'}`,
                                        fontSize: '11px', fontWeight: 600,
                                        color: paid ? '#059669' : '#94a3b8',
                                        display: 'flex', flexDirection: 'column',
                                        alignItems: 'center', gap: '4px',
                                    }}>
                                        {paid
                                            ? <CheckCircle size={12} style={{ color: '#10b981' }} />
                                            : <Clock size={12} style={{ color: '#cbd5e1' }} />
                                        }
                                        {month.slice(0, 3)}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Payment History Table */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                                Payment History
                            </h3>
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                                {payments.length} record{payments.length !== 1 ? 's' : ''}
                            </span>
                        </div>

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                                <div style={{
                                    width: '28px', height: '28px',
                                    border: `3px solid ${gradeColor.light}`,
                                    borderTopColor: gradeColor.tab,
                                    borderRadius: '50%',
                                    animation: 'spin 0.8s linear infinite',
                                    margin: '0 auto 8px',
                                }} />
                                Loading payments…
                            </div>
                        ) : payments.length === 0 ? (
                            <div style={{
                                textAlign: 'center', padding: '32px',
                                background: '#f8fafc', borderRadius: '12px',
                                border: '1px dashed #e2e8f0',
                                color: '#94a3b8', fontSize: '14px',
                            }}>
                                <CreditCard size={28} style={{ marginBottom: '8px', display: 'block', margin: '0 auto 8px' }} />
                                No payment records found for this student.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {payments.map(p => (
                                    <div key={p.id} style={{
                                        background: '#fff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '10px',
                                        padding: '12px 14px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                    }}>
                                        <div style={{
                                            width: '36px', height: '36px', borderRadius: '8px',
                                            background: '#d1fae5', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0,
                                        }}>
                                            <CreditCard size={16} style={{ color: '#10b981' }} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>
                                                {p.month}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                                                {p.bank} · {p.method} · {new Date(p.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn       { from { opacity: 0; }              to { opacity: 1; } }
                @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
                @keyframes spin         { to   { transform: rotate(360deg); } }
            `}</style>
        </>
    );
};

export default StudentDetailDrawer;
