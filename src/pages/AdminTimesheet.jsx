import { useState, useEffect } from 'react';
import { Search, Plus, Check, X, Calendar } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const AdminTimesheet = () => {
    const [entries, setEntries] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // ✅ Filters
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const { token } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchEntries();
        fetchEmployees();
    }, []);

    const fetchEntries = async () => {
        try {
            const res = await axios.get(`${API_URL}/timesheets/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEntries(res.data);
            setLoading(false);
        } catch (err) {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const res = await axios.get(`${API_URL}/employees`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEmployees(res.data);
        } catch (err) {}
    };

    // ✅ FILTER LOGIC
    const filteredEntries = entries.filter(entry => {
        const matchesSearch =
            entry.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.project?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.module?.toLowerCase().includes(searchTerm.toLowerCase());

        const entryDate = new Date(entry.date);

        const matchesDate =
            (!fromDate || entryDate >= new Date(fromDate)) &&
            (!toDate || entryDate <= new Date(toDate));

        const matchesEmployee =
            !selectedEmployee || entry.userId?._id === selectedEmployee;

        return matchesSearch && matchesDate && matchesEmployee;
    });

    // ✅ EXPORT
    const exportToExcel = () => {
        const data = filteredEntries.map(entry => ({
            Employee: entry.userId?.name,
            Project: entry.project,
            Module: entry.module,
            Phase: entry.phase,
            Date: entry.date,
            Status: entry.status
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Timesheets");

        const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const file = new Blob([buffer], { type: 'application/octet-stream' });

        saveAs(file, 'Timesheets.xlsx');
    };

return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

        {/* HEADER */}
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
        }}>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-main)' }}>
                Timesheet Management
            </h1>

            <button
                onClick={exportToExcel}
                className="btn-primary"
                style={{ padding: '10px 20px', borderRadius: '12px' }}
            >
                Export Excel
            </button>
        </div>

        {/* FILTER BAR */}
        <div className="card" style={{
            display: 'flex',
            gap: '12px',
            padding: '14px',
            flexWrap: 'wrap',
            alignItems: 'center'
        }}>

            <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-main)'
                }}
            />

            <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-main)'
                }}
            />

            <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-main)'
                }}
            >
                <option value="">All Employees</option>
                {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>
                        {emp.name}
                    </option>
                ))}
            </select>

            {/* SEARCH */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                background: 'var(--bg-main)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '0 12px',
                flex: 1,
                minWidth: '200px'
            }}>
                <Search size={16} color="var(--text-muted)" />
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        border: 'none',
                        outline: 'none',
                        padding: '10px',
                        width: '100%',
                        background: 'transparent'
                    }}
                />
            </div>

            <button
                onClick={() => setIsModalOpen(true)}
                className="btn-primary"
                style={{ padding: '10px 16px' }}
            >
                <Plus size={16} /> Add Entry
            </button>

        </div>

        {/* TABLE */}
        <div className="card" style={{
            overflowX: 'auto',
            borderRadius: '16px'
        }}>
            {loading ? (
                <p style={{ padding: '40px', textAlign: 'center' }}>Loading...</p>
            ) : (
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    minWidth: '900px'
                }}>
                    <thead>
                        <tr style={{
                            background: '#f8fafc',
                            textAlign: 'left'
                        }}>
                            {["Employee", "Project", "Module", "Phase", "Date", "Status"].map((head) => (
                                <th key={head} style={{
                                    padding: '14px 20px',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    color: '#64748b'
                                }}>
                                    {head}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {filteredEntries.map((entry) => (
                            <tr key={entry._id} style={{
                                borderBottom: '1px solid var(--border)',
                                transition: '0.2s'
                            }}>
                                <td style={{ padding: '14px 20px', fontWeight: '600' }}>
                                    {entry.userId?.name}
                                </td>
                                <td style={{ padding: '14px 20px' }}>{entry.project}</td>
                                <td style={{ padding: '14px 20px' }}>{entry.module}</td>
                                <td style={{ padding: '14px 20px' }}>{entry.phase}</td>
                                <td style={{ padding: '14px 20px' }}>{entry.date}</td>
                                <td style={{ padding: '14px 20px' }}>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        background:
                                            entry.status === 'Approved'
                                                ? '#dcfce7'
                                                : entry.status === 'Rejected'
                                                ? '#fee2e2'
                                                : '#fef3c7',
                                        color:
                                            entry.status === 'Approved'
                                                ? '#16a34a'
                                                : entry.status === 'Rejected'
                                                ? '#dc2626'
                                                : '#f59e0b',
                                        fontWeight: '600'
                                    }}>
                                        {entry.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>

    </div>
);
};

export default AdminTimesheet;
