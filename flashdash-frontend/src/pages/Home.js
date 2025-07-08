import React from 'react';
import Sidebar from '../components/Sidebar';

function Home({ user }) {
  // Placeholder data for agent details and metrics
  const agentDetails = {
    name: user?.name || 'N/A',
    email: user?.email || 'N/A',
    workPhone: user?.workPhone || 'N/A',
    extension: user?.extension || 'N/A',
    department: user?.department || 'N/A',
    role: user?.role || 'N/A',
  };

  // Placeholder metrics data
  const metrics = [
    { label: 'Daily', enrolledAmount: '$0', enrollmentPercent: '0%', totalDebt: '$0' },
    { label: 'Weekly', enrolledAmount: '$0', enrollmentPercent: '0%', totalDebt: '$0' },
    { label: 'Monthly', enrolledAmount: '$0', enrollmentPercent: '0%', totalDebt: '$0' },
  ];

  return (
    <div className="min-h-screen bg-[#004845] text-white flex">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10 ml-80 flex flex-col gap-8">
        {/* Agent Details Section */}
        <section className="bg-white bg-opacity-10 rounded-xl shadow p-6 md:p-8 mb-4 w-full max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Agent Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><span className="font-semibold">Name:</span> {agentDetails.name}</div>
            <div><span className="font-semibold">Email:</span> {agentDetails.email}</div>
            <div><span className="font-semibold">Work Phone:</span> {agentDetails.workPhone}</div>
            <div><span className="font-semibold">Extension:</span> {agentDetails.extension}</div>
            <div><span className="font-semibold">Department:</span> {agentDetails.department}</div>
            <div><span className="font-semibold">Role:</span> {agentDetails.role}</div>
          </div>
        </section>

        {/* Performance Metrics Section */}
        <section className="bg-white bg-opacity-10 rounded-xl shadow p-6 md:p-8 w-full max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Performance Metrics</h2>
          <div className="overflow-x-auto">
            <table className="w-full table-auto rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-white bg-opacity-20">
                  <th className="px-4 py-2 text-left">Period</th>
                  <th className="px-4 py-2 text-left">Enrolled Amount</th>
                  <th className="px-4 py-2 text-left">Enrollment %</th>
                  <th className="px-4 py-2 text-left">Total Debt Enrolled</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((row, idx) => (
                  <tr key={row.label} className="hover:bg-white hover:bg-opacity-10">
                    <td className="px-4 py-2 font-semibold">{row.label}</td>
                    <td className="px-4 py-2">{row.enrolledAmount}</td>
                    <td className="px-4 py-2">{row.enrollmentPercent}</td>
                    <td className="px-4 py-2">{row.totalDebt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;
