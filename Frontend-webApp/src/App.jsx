import { useState } from 'react';

function App() {
  const [formData, setFormData] = useState({
    gregorianDate: '',
    title: '',
    receiver: '',
    cc: '',
    language: 'EN',
  });
  const [loading, setLoading] = useState(false);
  const [letterUrl, setLetterUrl] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submitForm = () => {
    console.log('Submitting form with data:', formData);
    setError('');
    setLetterUrl('');
    
    if (!formData.title || !formData.gregorianDate || !formData.receiver) {
      setError('Please fill in all required fields');
      return;
    }
    setLoading(true);
    
    if (typeof google !== 'undefined' && google.script && google.script.run) {
      console.log('Google Script API is available, calling backend...');
      
      google.script.run
        .withSuccessHandler((url) => {
          console.log('Success! Received URL:', url);
          setLoading(false);
          setLetterUrl(url);
          alert('Letter created successfully! Opening letter in new tab.');
          window.open(url, '_blank');
        })
        .withFailureHandler((error) => {
          console.error('Error generating letter:', error);
          setLoading(false);
          setError('An error occurred: ' + (error.message || error));
        })
        .createLetterFromForm(formData);
    } else {
      console.error('Google Script API not available');
      setLoading(false);
      alert('Cannot connect to Google Apps Script. Are you running this in the correct environment?');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-2 bg-[#38524c]">
      <div className="w-full max-w-xl bg-[#cbdced] rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-[#3f778c] rounded-t-lg">
          <h2 className="text-2xl font-bold text-white text-center">Generate a Letter</h2>
          <p className="text-white/80 text-center mt-2 text-sm">Fill in the details to create your letter</p>
        </div>
        
        {/* Form */}
        <div className="py-4 px-8 space-y-2">
          {/* Progress indicator */}
          <div className="w-full bg-white/50 rounded-full h-2">
            <div className="bg-[#3f778c] rounded-full h-2" style={{ width: '20%' }}></div>
          </div>
          
          {/* Form fields */}
          <div className="space-y-3">
            <div>
              <label className="block font-medium mb-2 text-[#38524c]">
                Gregorian Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="gregorianDate"
                value={formData.gregorianDate}
                onChange={handleChange}
                className="w-full p-3 border border-[#3f778c] focus:border-2 rounded-md focus:outline-none bg-white text-[#38524c] "
                required
              />
            </div>
            
            <div>
              <label className="block font-medium mb-2 text-[#38524c]">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-3 border border-[#3f778c] rounded-md focus:outline-none focus:border-2 bg-white text-[#38524c]"
                placeholder="Enter letter title"
                required
              />
            </div>
            
            <div>
              <label className="block font-medium mb-2 text-[#38524c]">
                Receiver <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="receiver"
                value={formData.receiver}
                onChange={handleChange}
                className="w-full p-3 border border-[#3f778c] rounded-md focus:outline-none focus:border-2 bg-white text-[#38524c]"
                placeholder="Enter receiver's name"
                required
              />
            </div>
            
            <div>
              <label className="block font-medium mb-2 text-[#38524c]">CC</label>
              <input
                type="text"
                name="cc"
                value={formData.cc}
                onChange={handleChange}
                className="w-full p-3 border border-[#3f778c] rounded-md focus:outline-none focus:border-2 bg-white text-[#38524c]"
                placeholder="Enter CC recipients (optional)"
              />
            </div>
            
            <div>
              <label className="block font-medium mb-2 text-[#38524c]">Language</label>
              <div className="relative">
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="w-full p-3 border border-[#3f778c] rounded-md focus:outline-none focus:border-2 bg-white text-[#38524c] appearance-none"
                >
                  <option value="EN">English</option>
                  <option value="AM">Amharic</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-[#3f778c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="p-4 bg-red-100 border-l-4 border-red-500 rounded-md text-red-700 text-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                </svg>
                {error}
              </div>
            </div>
          )}
          
          {/* Submit button */}
          <div className="pt-4">
            <button
              onClick={submitForm}
              className={`w-full py-3 px-4 rounded-md font-medium text-white transition-all flex items-center justify-center ${
                loading ? 'bg-gray-600' : 'bg-[#3f778c] hover:bg-[#38524c]'
              }`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Generate Letter
                </>
              )}
            </button>
          </div>
          
          {/* Success link */}
          {letterUrl && (
            <div className="mt-6 text-center p-4 bg-white/50 rounded-md">
              <p className="text-sm mb-2 text-[#38524c]">Your letter has been generated successfully!</p>
              <a
                href={letterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center font-medium text-[#3f778c] hover:text-[#38524c] transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
                View Generated Letter
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;