import { useState } from 'react';
import Head from 'next/head';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Copy, 
  Loader2,
  FileText,
  Shield,
  Globe
} from 'lucide-react';
import RiskAnalyzer from '../components/RiskAnalyzer';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function Home() {
  const [clause, setClause] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showArabic, setShowArabic] = useState(false);
  const [selectedExample, setSelectedExample] = useState('');

  const exampleClauses = [
    {
      title: "Unlimited Liability",
      text: "The Contractor shall be liable for any and all damages, losses, costs, and expenses arising from or related to the performance of services under this Agreement, without any limitation."
    },
    {
      title: "Automatic Renewal",
      text: "This Agreement shall automatically renew for successive one-year terms unless either party provides written notice of non-renewal at least 90 days prior to the end of the current term."
    },
    {
      title: "Broad Confidentiality",
      text: "All information shared by either party, whether marked confidential or not, shall be deemed confidential and shall not be disclosed for a period of 10 years after termination."
    }
  ];

  const analyzeClause = async () => {
    if (!clause.trim()) {
      toast.error('Please enter a contract clause to analyze');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post(`${API_URL}/api/analyze`, {
        clause: clause.trim()
      });

      setResult(response.data);
      toast.success('Analysis complete!');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.detail || 'Failed to analyze clause');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'High':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (risk) => {
    switch (risk) {
      case 'Low':
        return <CheckCircle className="w-5 h-5" />;
      case 'Medium':
        return <AlertCircle className="w-5 h-5" />;
      case 'High':
        return <XCircle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>ContractRiskAI - Smart Contract Clause Analysis</title>
        <meta name="description" content="Analyze contract clauses for legal and commercial risks using advanced AI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Toaster position="top-right" />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">ContractRiskAI</h1>
              </div>
              <div className="flex items-center space-x-4">
                <a 
                  href="https://github.com/yourusername/contract-risk-ai" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-700"
                >
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Contract Clause Risk Analysis
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powered by GPT-4o with advanced prompt engineering. Analyze any contract clause 
              for legal and commercial risks in seconds.
            </p>
          </div>

          {/* Example Clauses */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Try an example clause:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {exampleClauses.map((example, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setClause(example.text);
                    setSelectedExample(example.title);
                  }}
                  className={`p-3 text-left rounded-lg border transition-all ${
                    selectedExample === example.title
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-gray-900">{example.title}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{example.text}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Input Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <label htmlFor="clause" className="block text-sm font-medium text-gray-700 mb-2">
              Enter Contract Clause
            </label>
            <textarea
              id="clause"
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Paste or type a contract clause here..."
              value={clause}
              onChange={(e) => setClause(e.target.value)}
            />
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {clause.length} characters
              </span>
              <button
                onClick={analyzeClause}
                disabled={loading || !clause.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    <span>Analyze Risk</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Section */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <RiskAnalyzer 
                  result={result}
                  showArabic={showArabic}
                  setShowArabic={setShowArabic}
                  getRiskColor={getRiskColor}
                  getRiskIcon={getRiskIcon}
                  copyToClipboard={copyToClipboard}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-500">
                This is an AI-powered tool for informational purposes only. 
                Always consult with a licensed attorney for legal advice.
              </p>
              <p className="text-sm text-gray-600">
                Built by{' '}
                <a 
                  href="https://www.linkedin.com/in/jay-patel-b186411b8" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Jay Patel
                </a>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}