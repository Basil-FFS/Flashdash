import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { fetchCreditReport } from "../utils/api";
import axios from "axios";

function getClientInfo(contact) {
  if (!contact) return null;
  // Address may be a string or an object
  let address = '';
  if (typeof contact.address === 'string') {
    address = contact.address;
  } else if (contact.address && typeof contact.address === 'object') {
    address = [
      contact.address.address1,
      contact.address.address2,
      contact.address.city,
      contact.address.state,
      contact.address.zip
    ].filter(Boolean).join(', ');
  }
  return {
    name: [contact.first_name, contact.last_name].filter(Boolean).join(' ') || 'N/A',
    email: contact.email || 'N/A',
    phone: contact.phone_number || 'N/A',
    address: address || 'N/A'
  };
}

const STATE_CODES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "FL", "ID", "IN", "KY", "MD", "MA", "MI", "MS", "MO", "MT", "NE", "NV", "NM", "NY", "NC", "OK", "PA", "SD", "TN", "TX", "UT", "DC", "CT", "DE", "GA", "IL", "IA", "KS", "LA", "NJ", "OH", "SC", "VA", "WA"
];

// Step-by-step Add New Client (Contact) form configuration
const CONTACT_STEPS = [
  {
    script: agentName => `Thank you for calling Flash Financial, this is ${agentName}. To whom do I have the pleasure of speaking with?`,
    fields: [
      { name: 'Fname', label: 'First Name', type: 'text' },
      { name: 'Lname', label: 'Last Name', type: 'text' },
    ],
  },
  {
    script: () => 'And how much debt are you calling about today?',
    fields: [
      { name: 'loan_Amount', label: 'Debt Amount', type: 'number' },
    ],
  },
  {
    script: () => 'And how much do you make every month?',
    fields: [
      { name: 'monthly_income', label: 'Monthly Income', type: 'number' },
    ],
  },
  {
    script: () => 'What\'s the best phone number to reach you on?',
    fields: [
      { name: 'Phone', label: 'Phone Number', type: 'text' },
    ],
  },
  {
    script: () => 'What\'s the best email to put on file?',
    fields: [
      { name: 'Email', label: 'Email', type: 'email' },
    ],
  },
  {
    script: () => 'What\'s your full address?',
    fields: [
      { name: 'Address', label: 'Street Address', type: 'text' },
      { name: 'City', label: 'City', type: 'text' },
      { name: 'State', label: 'State', type: 'select', options: STATE_CODES },
      { name: 'Zip', label: 'ZIP Code', type: 'text' },
    ],
  },
  {
    script: () => 'What\'s your date of birth?',
    fields: [
      { name: 'DOB', label: 'Date of Birth', type: 'date' },
    ],
  },
  {
    script: () => 'And go ahead with the last four of your Social Security number.',
    fields: [
      { name: 'SSN', label: 'SSN (Last 4 digits)', type: 'text', maxLength: 4 },
    ],
  },
];

function Dashboard({ user }) {
  const isAdmin = user.role === "admin";

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

  // Dropdown state
  const [dropdown, setDropdown] = useState('');

  // Credit report state
  const [contactId, setContactId] = useState('');
  const [debts, setDebts] = useState([]);
  const [client, setClient] = useState(null);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Contact form state (single form, no steps)
  const [contactFormLoading, setContactFormLoading] = useState(false);
  const [contactFormSuccess, setContactFormSuccess] = useState('');
  const [contactFormError, setContactFormError] = useState('');
  const [fileId, setFileId] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    setDebts([]);
    setSelected([]);
    setClient(null);
    try {
      const res = await axios.post('https://1813b6ckkf.execute-api.us-east-1.amazonaws.com/dev/forthcrm/credit-report', { clientIdOrName: contactId });
      let debtsArr = [];
      if (res.data.response && Array.isArray(res.data.response)) {
        debtsArr = res.data.response;
      } else if (res.data.debts) {
        debtsArr = res.data.debts;
      }
      // Filter out debts under $400 and sort largest to smallest
      debtsArr = debtsArr
        .filter(debt => parseFloat(debt.current_debt_amount || 0) >= 400)
        .sort((a, b) => parseFloat(b.current_debt_amount || 0) - parseFloat(a.current_debt_amount || 0));
      setDebts(debtsArr);
      setSelected(debtsArr.map((_, idx) => true)); // All selected by default
      setClient(getClientInfo(res.data.contact));
    } catch (err) {
      setError('Failed to fetch debts. Please check the contact ID.');
    }
    setLoading(false);
  };

  const handleSelect = (idx) => {
    setSelected(prev => prev.map((val, i) => (i === idx ? !val : val)));
  };

  const handleSelectAll = (checked) => {
    setSelected(debts.map(() => checked));
  };

  const totalDebt = debts.reduce((sum, debt, idx) => sum + (selected[idx] ? parseFloat(debt.current_debt_amount || 0) : 0), 0);

  // Handler for field changes
  const handleContactFieldChange = (e) => {
    const { name, value } = e.target;
    setContactFormError('');
    setContactFormSuccess('');
    
    if (name === 'SSN') {
      // Format as 000-00-XXXX
      const cleaned = value.replace(/[^0-9]/g, '').slice(0, 4);
      e.target.value = cleaned;
    } else if (name === 'Phone') {
      // Format phone number as XXX-XXX-XXXX
      const cleaned = value.replace(/[^0-9]/g, '').slice(0, 10);
      if (cleaned.length >= 6) {
        e.target.value = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
      } else if (cleaned.length >= 3) {
        e.target.value = `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
      } else {
        e.target.value = cleaned;
      }
    }
  };

  // Handler for submit
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactFormLoading(true);
    setContactFormError('');
    setContactFormSuccess('');
    setFileId('');
    
    try {
      const formData = new FormData(e.target);
      
      // Map fields according to ForthCRM specifications
      const fieldMappings = {
        'Fname': 'Fname',
        'Lname': 'Lname',
        'Phone': 'phone',
        'Email': 'email',
        'Address': 'address',
        'City': 'city',
        'State': 'state',
        'Zip': 'zip',
        'DOB': 'DOB',
        'SSN': 'SSN',
        'loan_Amount': 'Loan_amount',
        'monthly_income': 'monthly_income'
      };
      
      // Create new FormData with correct field names
      const forthFormData = new FormData();
      
      for (const [originalName, forthName] of Object.entries(fieldMappings)) {
        const value = formData.get(originalName);
        if (value) {
          forthFormData.set(forthName, value);
        }
      }
      
      // Format SSN as 000-00-XXXX
      const ssnValue = forthFormData.get('SSN');
      if (ssnValue) {
        forthFormData.set('SSN', `000-00-${ssnValue}`);
      }
      
      // Debug: Log what we're sending
      console.log('Submitting to ForthCRM:');
      for (let [key, value] of forthFormData.entries()) {
        console.log(`${key}: ${value}`);
      }
      
      const response = await axios.post('https://client.forthcrm.com/post/48f7e38d20f79707e427c5bfbd05efe895ff18b1/', forthFormData);
      console.log('Form submitted successfully');
      console.log('ForthCRM Response:', response.data);
      
      // Try to extract file ID from different possible response formats
      let extractedFileId = '';
      if (response.data) {
        extractedFileId = response.data.file_id || 
                         response.data.fileId || 
                         response.data.id || 
                         response.data.contact_id || 
                         response.data.client_id || 
                         response.data.record_id || 
                         '';
      }
      
      setFileId(extractedFileId);
      setContactFormSuccess(extractedFileId ? `Client added successfully! File ID: ${extractedFileId}` : 'Client added successfully!');
      e.target.reset();
    } catch (err) {
      console.error('Form submission error:', err.response?.data || err.message);
      
      // Check if this is a CORS error (which means the request actually succeeded)
      if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
        console.log('CORS error detected, but data was likely submitted successfully');
        console.log('Error response data:', err.response?.data);
        
        // Try to extract file ID from error response if available
        let extractedFileId = '';
        if (err.response?.data) {
          extractedFileId = err.response.data.file_id || 
                           err.response.data.fileId || 
                           err.response.data.id || 
                           err.response.data.contact_id || 
                           err.response.data.client_id || 
                           err.response.data.record_id || 
                           '';
        }
        
        setFileId(extractedFileId);
        setContactFormSuccess(extractedFileId ? `Client added successfully! File ID: ${extractedFileId}` : 'Client added successfully!');
        e.target.reset();
      } else {
        setContactFormError(`Failed to add client: ${err.response?.data?.message || err.message}`);
      }
    }
    setContactFormLoading(false);
  };

  // Get all fields from all steps
  const getAllFields = () => {
    return CONTACT_STEPS.flatMap(step => step.fields);
  };

  return (
    <main className="flex-1 p-3 md:p-6 flex flex-col items-center justify-start gap-8">
      {/* Welcome Heading */}
      <h1 className="text-4xl md:text-5xl font-extrabold mb-2 text-center w-full" style={{letterSpacing: 1}}>Welcome,</h1>
      {/* Agent Details Section */}
      <section className="bg-white bg-opacity-10 rounded-2xl shadow p-6 md:p-10 w-full max-w-2xl flex flex-col gap-4 items-center">
        <h2 className="text-2xl font-bold mb-2 text-center w-full">Agent Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 w-full">
          <div><span className="font-semibold">Name:</span> {agentDetails.name}</div>
          <div><span className="font-semibold">Email:</span> {agentDetails.email}</div>
          <div><span className="font-semibold">Work Phone:</span> {agentDetails.workPhone}</div>
          <div><span className="font-semibold">Extension:</span> {agentDetails.extension}</div>
          <div><span className="font-semibold">Department:</span> {agentDetails.department}</div>
          <div><span className="font-semibold">Role:</span> {agentDetails.role}</div>
        </div>
      </section>

      {/* Dropdowns Section */}
      <section className="w-full max-w-4xl flex flex-col gap-4 items-center">
        <div className="w-full">
          <label className="block font-semibold mb-2">Select Action</label>
          <select
            className="w-full p-2 rounded text-black"
            value={dropdown}
            onChange={e => setDropdown(e.target.value)}
          >
            <option value="">Select...</option>
            <option value="credit">Credit Report Lookup</option>
            <option value="newclient">Add New Client</option>
          </select>
        </div>

        {/* Credit Report Lookup Component */}
        {dropdown === 'credit' && (
          <div className="w-full bg-white bg-opacity-10 rounded-2xl shadow p-6 mt-4 flex flex-col gap-4 items-center">
            <h2 className="text-xl font-bold mb-2 text-center w-full">Credit Report Lookup</h2>
            <div className="w-full flex items-center gap-4 mb-4">
              <input
                type="text"
                placeholder="Enter Contact ID"
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                className="border p-2 rounded w-full text-black"
              />
              <button
                onClick={fetchData}
                disabled={loading || !contactId}
                className="bg-white text-[#004845] px-4 py-2 rounded hover:bg-gray-200"
              >
                {loading ? 'Loading...' : 'Search'}
              </button>
            </div>
            {error && <p className="text-red-300 mb-4">{error}</p>}
            {client && (
              <div className="w-full mb-6 border p-4 rounded bg-white bg-opacity-5">
                <h3 className="text-xl font-semibold mb-2">Client Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div><strong>Name:</strong> {client.name}</div>
                  <div><strong>Email:</strong> {client.email}</div>
                  <div><strong>Phone:</strong> {client.phone}</div>
                  <div><strong>Address:</strong> {client.address}</div>
                </div>
              </div>
            )}
            {debts.length > 0 && (
              <div className="w-full bg-white bg-opacity-5 rounded-xl p-6 shadow mb-4">
                <h3 className="text-xl font-bold mb-2">Total Debt in Table</h3>
                <div className="text-3xl font-bold text-green-300">
                  ${totalDebt.toLocaleString()}
                </div>
                <p className="text-sm text-gray-300 mt-2">
                  Total current debt amount for all selected records
                </p>
              </div>
            )}
            {debts.length > 0 && (
              <div className="w-full">
                <h3 className="text-xl font-bold mb-4">Debt Records</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-white bg-opacity-20">
                        <th className="border px-4 py-3 text-left">Select <input type="checkbox" checked={selected.every(Boolean) && selected.length > 0} onChange={e => handleSelectAll(e.target.checked)} /></th>
                        <th className="border px-4 py-3 text-left">Creditor Name</th>
                        <th className="border px-4 py-3 text-left">Current Amount</th>
                        <th className="border px-4 py-3 text-left">Payment</th>
                        <th className="border px-4 py-3 text-left">Debt Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {debts.map((debt, idx) => (
                        <tr key={debt.id || idx} className="hover:bg-white hover:bg-opacity-10 border-b border-white border-opacity-20">
                          <td className="border px-4 py-3 text-center">
                            <input type="checkbox" checked={selected[idx] || false} onChange={() => handleSelect(idx)} />
                          </td>
                          <td className="border px-4 py-3">{debt.creditor?.company_name || 'N/A'}</td>
                          <td className="border px-4 py-3">${parseFloat(debt.current_debt_amount || 0).toLocaleString()}</td>
                          <td className="border px-4 py-3">${parseFloat(debt.current_payment || 0).toLocaleString()}</td>
                          <td className="border px-4 py-3">{debt.debt_type?.label || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Single Form New Client Component */}
        {dropdown === 'newclient' && (
          <form className="w-full bg-white bg-opacity-10 rounded-2xl shadow p-6 mt-4 flex flex-col gap-4 items-center" onSubmit={handleContactSubmit}>
            <h2 className="text-xl font-bold mb-2 text-center w-full">Add New Client</h2>
            <div className="w-full flex flex-col gap-6 items-center">
              {/* Step 1: Initial Greeting */}
              <div className="w-full">
                <div className="mb-3 text-center" style={{ fontSize: '22px', color: '#f7b815' }}>
                  Thank you for calling Flash financial my Name is {user?.name || 'Agent'} we are on a recorded line. To whom do I have the pleasure of speaking with?
                </div>
              </div>

              {/* Step 2: Debt Amount */}
              <div className="w-full">
                <div className="mb-3 text-center" style={{ fontSize: '22px', color: '#f7b815' }}>
                  Hello [Name], how much debt are you calling about today?
                </div>
                <input name="loan_Amount" placeholder="Amount of Debt" className="p-2 rounded text-black w-full" type="text" style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }} onChange={handleContactFieldChange} />
              </div>

              {/* Step 3: Service Message */}
              <div className="w-full">
                <div className="mb-3 text-center" style={{ fontSize: '22px', color: '#f7b815' }}>
                  Hopefully that's something we'll be able to help you with. To best service your needs I'm going to go ahead and verify some basic information so that we can proceed with your application.
                </div>
              </div>

              {/* Step 4: Name Verification */}
              <div className="w-full">
                <div className="mb-3 text-center" style={{ fontSize: '22px', color: '#f7b815' }}>
                  Go ahead with the spelling of your first and last name.
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input name="Fname" placeholder="First Name" className="p-2 rounded text-black" type="text" onChange={handleContactFieldChange} />
                  <input name="Lname" placeholder="Last Name" className="p-2 rounded text-black" type="text" onChange={handleContactFieldChange} />
                </div>
              </div>

              {/* Step 5: Phone Number */}
              <div className="w-full">
                <div className="mb-3 text-center" style={{ fontSize: '22px', color: '#f7b815' }}>
                  Is this the best phone number to reach you at?
                </div>
                <input name="Phone" placeholder="Phone Number" className="p-2 rounded text-black w-full" type="text" onChange={handleContactFieldChange} />
              </div>

              {/* Step 6: Email */}
              <div className="w-full">
                <div className="mb-3 text-center" style={{ fontSize: '22px', color: '#f7b815' }}>
                  What is your Email Address?
                </div>
                <input name="Email" placeholder="Email" className="p-2 rounded text-black w-full" type="email" onChange={handleContactFieldChange} />
              </div>

              {/* Step 7: Address */}
              <div className="w-full">
                <div className="mb-3 text-center" style={{ fontSize: '22px', color: '#f7b815' }}>
                  And the first line of your home address?
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input name="Address" placeholder="Address Line" className="p-2 rounded text-black" type="text" onChange={handleContactFieldChange} />
                  <input name="City" placeholder="City" className="p-2 rounded text-black" type="text" onChange={handleContactFieldChange} />
                  <select name="State" className="p-2 rounded text-black">
                    <option value="">Select State</option>
                    {STATE_CODES.map(code => <option key={code} value={code}>{code}</option>)}
                  </select>
                  <input name="Zip" placeholder="ZIP Code" className="p-2 rounded text-black" type="text" onChange={handleContactFieldChange} />
                </div>
              </div>

              {/* Step 8: Employment Status */}
              <div className="w-full">
                <div className="mb-3 text-center" style={{ fontSize: '22px', color: '#f7b815' }}>
                  Are you currently working or on a fixed income?
                </div>
                <select name="employment_status" className="p-2 rounded text-black w-full">
                  <option value="">Select Employment Status</option>
                  <option value="employed">Employed</option>
                  <option value="fixed_income">Fixed Income</option>
                </select>
              </div>

              {/* Step 9: Monthly Income */}
              <div className="w-full">
                <div className="mb-3 text-center" style={{ fontSize: '22px', color: '#f7b815' }}>
                  What is your net monthly income after taxes?
                </div>
                <input name="monthly_income" placeholder="Monthly Income" className="p-2 rounded text-black w-full" type="text" style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }} onChange={handleContactFieldChange} />
              </div>

              {/* Step 10: Credit Permission */}
              <div className="w-full">
                <div className="mb-3 text-center" style={{ fontSize: '22px', color: '#f7b815' }}>
                  Do I have your permission to run a soft inquiry of your credit report? This will not affect your score.
                </div>
              </div>

              {/* Step 11: Date of Birth */}
              <div className="w-full">
                <div className="mb-3 text-center" style={{ fontSize: '22px', color: '#f7b815' }}>
                  Please verify your date of birth.
                </div>
                <input name="DOB" placeholder="Date of Birth" className="p-2 rounded text-black w-full" type="date" onChange={handleContactFieldChange} />
              </div>

              {/* Step 12: SSN */}
              <div className="w-full">
                <div className="mb-3 text-center" style={{ fontSize: '22px', color: '#f7b815' }}>
                  Verify the last four digits of your social number.
                </div>
                <input name="SSN" placeholder="SSN (Last 4 digits)" className="p-2 rounded text-black w-full" type="text" maxLength={4} onChange={handleContactFieldChange} />
              </div>

              {/* Step 13: Closing Message */}
              <div className="w-full">
                <div className="mb-3 text-center" style={{ fontSize: '22px', color: '#f7b815' }}>
                  Thank you [Name], I've gone ahead and started an application for you, we'll go over your expenses and your credit to see what options we can get you qualified for.
                </div>
              </div>
            </div>
            {contactFormError && <div className="text-red-400 mb-2 w-full text-center">{contactFormError}</div>}
            {contactFormSuccess && (
              <div className="text-green-400 mb-2 w-full text-center">
                <div className="font-semibold">{contactFormSuccess}</div>
                {fileId && (
                  <div className="mt-2 p-2 bg-green-900 bg-opacity-30 rounded border border-green-400">
                    <div className="text-sm">File ID: <span className="font-mono font-bold">{fileId}</span></div>
                  </div>
                )}
              </div>
            )}
            <button
              type="submit"
              className="bg-green-400 text-[#004845] px-6 py-2 rounded font-semibold hover:bg-green-300"
              disabled={contactFormLoading}
            >
              {contactFormLoading ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

export default Dashboard;
