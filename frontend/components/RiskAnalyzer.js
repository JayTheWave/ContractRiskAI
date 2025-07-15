import { motion } from 'framer-motion';
import { Copy, Globe, FileText, AlertTriangle, Clock } from 'lucide-react';

export default function RiskAnalyzer({ 
  result, 
  showArabic, 
  setShowArabic, 
  getRiskColor, 
  getRiskIcon,
  copyToClipboard 
}) {
  const displayData = showArabic ? result.arabic : result.english;

  return (
    <div className="space-y-6">
      {/* Language Toggle */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowArabic(!showArabic)}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Globe className="w-4 h-4" />
          <span>{showArabic ? 'English' : 'العربية'}</span>
        </button>
      </div>

      {/* Risk Level Card */}
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-lg shadow-md overflow-hidden"
      >
        <div className={`p-6 border-l-4 ${getRiskColor(result.english.risk)}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {getRiskIcon(result.english.risk)}
              <h3 className="text-xl font-semibold">
                Risk Level: {displayData.risk}
              </h3>
            </div>
            <span className="text-sm text-gray-500">
              {result.metadata.processing_time}
            </span>
          </div>
          
          <div className="space-y-4">
            {/* Summary */}
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-2 mb-1">
                <FileText className="w-4 h-4" />
                <span>Summary</span>
              </label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                {displayData.summary}
              </p>
            </div>

            {/* Reason */}
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-2 mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span>Risk Reason</span>
              </label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                {displayData.reason}
              </p>
            </div>

            {/* Suggested Rewrite */}
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-2 mb-1">
                <FileText className="w-4 h-4" />
                <span>Suggested Rewrite</span>
              </label>
              <div className="relative">
                <p className="text-gray-900 bg-green-50 border border-green-200 p-3 rounded-md pr-10">
                  {displayData.rewrite}
                </p>
                <button
                  onClick={() => copyToClipboard(displayData.rewrite)}
                  className="absolute top-2 right-2 p-1.5 text-gray-500 hover:text-gray-700 hover:bg-white rounded transition-all"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Metadata */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-100 rounded-lg p-4"
      >
        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
          <Clock className="w-4 h-4" />
          <span>Analysis Details</span>
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Model:</span>
            <p className="font-medium">{result.metadata.model}</p>
          </div>
          <div>
            <span className="text-gray-500">Processing Time:</span>
            <p className="font-medium">{result.metadata.processing_time}</p>
          </div>
          <div>
            <span className="text-gray-500">Clause Length:</span>
            <p className="font-medium">{result.metadata.clause_length} chars</p>
          </div>
          <div>
            <span className="text-gray-500">Timestamp:</span>
            <p className="font-medium">
              {new Date(result.metadata.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Risk Level Guide */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-blue-50 border border-blue-200 rounded-lg p-4"
      >
        <h4 className="font-medium text-blue-900 mb-2">Understanding Risk Levels</h4>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex items-start space-x-2">
            <span className="font-medium">Low:</span>
            <span>Standard terms, balanced obligations, clear rights</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-medium">Medium:</span>
            <span>Some imbalanced terms, unclear obligations, ambiguous language</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-medium">High:</span>
            <span>Unlimited liability, one-sided terms, no termination rights</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}