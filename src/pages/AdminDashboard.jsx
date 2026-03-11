import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import AdminOverview from './AdminOverview';
import EmployeeList from './EmployeeList';
import AdminAttendance from './AdminAttendance'; // Keep it imported if needed elsewhere, but we'll use Timesheet
import AdminTimesheet from './AdminTimesheet';
import AdminLeave from './AdminLeave';
import AdminHoliday from './AdminHoliday';
import AdminPayroll from './AdminPayroll';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <AdminOverview setActiveTab={setActiveTab} />;
            case 'employees': return <EmployeeList />;
            case 'attendance': return <AdminTimesheet />;
            case 'leave': return <AdminLeave />;
            case 'holidays': return <AdminHoliday />;
            case 'payroll': return <AdminPayroll />;
            default: return (
                <div className="card" style={{ padding: '60px', textAlign: 'center', background: 'var(--bg-main)' }}>
                    <h2 style={{ color: 'var(--text-main)', fontSize: '20px', fontWeight: '700' }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module</h2>
                    <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>We are currently building this featured module. Check back soon!</p>
                </div>
            );
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-subtle)' }}>
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>

                <div style={{ maxWidth: '1200px' }}>
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
