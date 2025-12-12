import React, { useState } from 'react';
import { Sparkles, BrainCircuit } from 'lucide-react';
import { Task } from '../types';
import { Button } from './Button';
import { generateProductivityAnalysis } from '../services/geminiService';

interface AIInsightsProps {
  tasks: Task[];
}

export const AIInsights: React.FC<AIInsightsProps> = ({ tasks }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ summary: string; suggestions: string[]; productivityScore: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateProductivityAnalysis(tasks);
      setResult(data);
    } catch (err) {
      setError("Failed to generate insights. Ensure you have a valid API Key and completed tasks.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-full mb-4">
          <Sparkles className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">AI Productivity Coach</h2>
        <p className="text-slate-500 mt-2 max-w-lg mx-auto">
          Use Google Gemini to analyze your time tracking logs, discover patterns, and get personalized advice to improve your workflow.
        </p>
      </div>

      {!result && !loading && (
        <div className="text-center">
          <Button size="lg" onClick={handleAnalyze} disabled={tasks.length === 0}>
            <BrainCircuit className="w-5 h-5 mr-2" />
            Analyze My Workflow
          </Button>
          {tasks.length === 0 && (
             <p className="text-xs text-red-500 mt-2">Complete some tasks first!</p>
          )}
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600 font-medium">Gemini is thinking...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-center mb-6">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold">Productivity Report</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm opacity-80">Score</span>
                <span className="text-3xl font-bold">{result.productivityScore}</span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Executive Summary</h4>
                <p className="text-slate-800 leading-relaxed text-lg">{result.summary}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Key Improvements</h4>
                <ul className="space-y-3">
                  {result.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div className="min-w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold mt-0.5">
                        {i + 1}
                      </div>
                      <span className="text-slate-700">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="bg-slate-50 p-4 border-t border-slate-200 text-center">
              <Button variant="secondary" onClick={handleAnalyze} isLoading={loading}>
                Regenerate Analysis
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
