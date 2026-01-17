import React, { useState, useRef, useEffect } from 'react';
import { WritingMode } from './types';
import { generateWriting } from './services/geminiService';
import { SAMPLE_PROMPTS } from './constants';
import { IconFeather, IconRefresh, IconBook, IconCheck, IconSparkles, IconArrowRight } from './components/Icons';

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [mode, setMode] = useState<WritingMode>(WritingMode.DRAFT);
  const [error, setError] = useState<string | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputText]);

  const handleModeChange = (newMode: WritingMode) => {
    setMode(newMode);
    setError(null);
    if (!inputText) {
      setInputText(SAMPLE_PROMPTS[newMode]);
    }
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    
    setIsStreaming(true);
    setError(null);
    setOutputText(''); // Clear previous output

    try {
      await generateWriting(inputText, mode, (chunk) => {
        setOutputText(chunk);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsStreaming(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText);
  };

  return (
    <div className="min-h-screen bg-royal-50 text-royal-900 font-sans flex flex-col selection:bg-royal-300 selection:text-royal-900">
      
      {/* Royal Header */}
      <header className="bg-royal-900 border-b-4 border-royal-300 sticky top-0 z-20 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-royal-100 rounded-full shadow-lg border-2 border-royal-400 overflow-hidden relative">
               <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Statue-Augustus.jpg/220px-Statue-Augustus.jpg" 
                alt="Augustus Logo" 
                className="w-full h-full object-cover object-top"
               />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display tracking-wide text-white">AUGUSTUS</h1>
              <p className="text-xs text-royal-300 tracking-widest uppercase font-semibold">The Generation Engine</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
             <div className="hidden md:flex items-center text-xs font-medium text-royal-200 bg-royal-800/50 border border-royal-700 px-4 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-green-400 mr-2 shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span>
                Powered by Gemini 3 Flash
             </div>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* Mode Selector */}
        <div className="mb-10 overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex space-x-3 sm:space-x-5 min-w-max px-1">
            {[
              { id: WritingMode.DRAFT, label: 'Draft Generator', icon: IconFeather, desc: 'Topic → Structured Essay' },
              { id: WritingMode.REFINE, label: 'Polishing Engine', icon: IconRefresh, desc: 'Rough → Smooth Prose' },
              { id: WritingMode.ACADEMIC, label: 'Style Transfer', icon: IconBook, desc: 'Casual → Academic' },
              { id: WritingMode.CRITIQUE, label: 'Reviewer', icon: IconCheck, desc: 'Citation & Logic Check' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => handleModeChange(m.id)}
                className={`
                  relative flex flex-col items-start p-5 rounded-xl border-2 transition-all duration-300 w-56 group
                  ${mode === m.id 
                    ? 'bg-white border-royal-300 shadow-[0_4px_20px_-2px_rgba(212,175,55,0.25)] scale-105' 
                    : 'bg-white/50 border-royal-200 hover:border-royal-300/50 hover:bg-white text-royal-500 hover:text-royal-800'}
                `}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <m.icon className={`w-6 h-6 ${mode === m.id ? 'text-royal-600' : 'text-royal-400 group-hover:text-royal-600'}`} />
                  {mode === m.id && <span className="w-2 h-2 bg-royal-300 rounded-full shadow-[0_0_8px_rgba(212,175,55,0.8)]"></span>}
                </div>
                <span className={`font-display font-bold text-sm tracking-wide ${mode === m.id ? 'text-royal-900' : ''}`}>{m.label}</span>
                <span className="text-xs text-royal-500 mt-1 font-medium">{m.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-320px)] min-h-[600px]">
          
          {/* LEFT: Input Area */}
          <div className="flex flex-col bg-white rounded-xl shadow-lg border border-royal-200 overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-1 h-full bg-royal-300/50"></div>
            <div className="px-5 py-4 border-b border-royal-100 flex justify-between items-center bg-royal-50">
              <span className="text-xs font-bold text-royal-500 uppercase tracking-widest font-display">Source Material</span>
              <span className="text-xs font-mono text-royal-400 bg-white px-2 py-0.5 rounded border border-royal-200">
                {inputText.length} chars
              </span>
            </div>
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                mode === WritingMode.DRAFT ? "Enter your essay topic, thesis statement, or rough outline here..." :
                mode === WritingMode.REFINE ? "Paste the paragraph you want to improve..." :
                mode === WritingMode.ACADEMIC ? "Paste casual text to convert to academic style..." :
                "Paste text to check for citation needs..."
              }
              className="flex-grow w-full p-6 resize-none focus:outline-none text-royal-900 font-serif leading-loose text-lg bg-transparent placeholder-royal-300"
              spellCheck={false}
            />
            <div className="p-5 border-t border-royal-100 bg-royal-50/50">
              <button
                onClick={handleGenerate}
                disabled={isStreaming || !inputText.trim()}
                className={`
                  w-full flex items-center justify-center py-4 px-6 rounded-lg font-bold tracking-wide transition-all duration-300
                  ${isStreaming || !inputText.trim()
                    ? 'bg-royal-200 text-royal-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-royal-800 to-royal-900 text-white hover:from-royal-700 hover:to-royal-800 shadow-xl hover:shadow-2xl border border-royal-700 hover:scale-[1.01] active:scale-[0.99]'}
                `}
              >
                {isStreaming ? (
                  <>
                    <IconSparkles className="w-5 h-5 mr-3 animate-spin text-royal-300" />
                    <span className="font-display">Consulting Augustus...</span>
                  </>
                ) : (
                  <>
                    <IconSparkles className="w-5 h-5 mr-3 text-royal-300" />
                    <span className="font-display">Generate Content</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT: Output Area */}
          <div className={`flex flex-col rounded-xl shadow-lg border overflow-hidden transition-all duration-500 relative ${outputText ? 'bg-white border-royal-300' : 'bg-royal-50 border-dashed border-royal-300'}`}>
             <div className="absolute top-0 right-0 w-1 h-full bg-royal-300/50"></div>
            <div className="px-5 py-4 border-b border-royal-100 flex justify-between items-center bg-royal-50/80">
              <span className="text-xs font-bold text-royal-600 uppercase tracking-widest font-display flex items-center gap-2">
                <IconFeather className="w-3 h-3" /> Augustus Output
              </span>
              {outputText && (
                <button 
                  onClick={copyToClipboard}
                  className="text-xs font-bold text-royal-500 hover:text-royal-800 transition-colors uppercase tracking-wider"
                >
                  Copy Text
                </button>
              )}
            </div>
            
            <div className="flex-grow p-8 overflow-y-auto relative custom-scrollbar">
              {error ? (
                 <div className="flex flex-col items-center justify-center h-full text-center p-6 animate-in fade-in zoom-in">
                    <div className="text-red-500 mb-4 bg-red-50 p-3 rounded-full border border-red-100">
                      <IconCheck className="w-6 h-6 rotate-45" /> 
                    </div>
                    <h3 className="text-royal-900 font-bold mb-2">Generation Halted</h3>
                    <p className="text-royal-500 max-w-xs">{error}</p>
                 </div>
              ) : outputText ? (
                <div className="prose prose-lg prose-p:text-royal-800 prose-headings:text-royal-900 prose-headings:font-display prose-headings:font-bold prose-strong:text-royal-900 max-w-none font-serif leading-relaxed whitespace-pre-wrap animate-in fade-in duration-700">
                  {outputText}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-royal-400 p-8">
                  <div className="w-20 h-20 bg-white border-2 border-royal-100 rounded-full flex items-center justify-center mb-6 text-royal-300 shadow-sm">
                    <IconBook className="w-10 h-10" />
                  </div>
                  <p className="text-lg font-display font-bold text-royal-700 mb-2">Awaiting Instructions</p>
                  <p className="text-sm max-w-xs text-royal-500 leading-relaxed">Select a mode from the toolbar and provide input to begin the generation process.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* About Section */}
      <footer className="bg-royal-100 border-t border-royal-200 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            
            {/* Column 1: Identity */}
            <div className="space-y-4">
              <div className="flex items-center justify-center md:justify-start space-x-3 text-royal-900">
                <div className="h-10 w-10 bg-royal-200 rounded-full flex items-center justify-center overflow-hidden border border-royal-300 relative">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Statue-Augustus.jpg/220px-Statue-Augustus.jpg" 
                      alt="Augustus" 
                      className="h-full w-full object-cover object-top"
                    />
                 </div>
                <h3 className="font-display font-bold text-lg tracking-wide">AUGUSTUS</h3>
              </div>
              <p className="text-royal-600 text-sm leading-relaxed">
                A specialized generative AI engine designed for academic rigor. 
                Augustus focuses on the <em>craft</em> of writing—drafting, refining, and polishing.
                It serves as the generative companion to <span className="font-semibold text-royal-800">Julius</span> (Retrieval).
              </p>
            </div>

            {/* Column 2: The Builder */}
            <div className="space-y-4">
               <h3 className="font-display font-bold text-royal-900 text-lg tracking-wide">The Architect</h3>
               <p className="text-royal-600 text-sm leading-relaxed">
                 Built by a Computer Science Sophomore specializing in NLP & Machine Learning. 
                 This project explores the intersection of prompt engineering, style transfer, and structured text generation.
               </p>
            </div>

            {/* Column 3: Tech Stack */}
            <div className="space-y-4">
              <h3 className="font-display font-bold text-royal-900 text-lg tracking-wide">System Specs</h3>
              <ul className="space-y-2 text-sm text-royal-600">
                <li className="flex items-center justify-center md:justify-start">
                  <span className="w-1.5 h-1.5 bg-royal-400 rounded-full mr-2"></span>
                  Model: <span className="text-royal-800 font-semibold ml-1">Gemini 3.0 Flash Preview</span>
                </li>
                <li className="flex items-center justify-center md:justify-start">
                  <span className="w-1.5 h-1.5 bg-royal-400 rounded-full mr-2"></span>
                  Framework: <span className="text-royal-800 font-semibold ml-1">React + TypeScript</span>
                </li>
                <li className="flex items-center justify-center md:justify-start">
                  <span className="w-1.5 h-1.5 bg-royal-400 rounded-full mr-2"></span>
                  Architecture: <span className="text-royal-800 font-semibold ml-1">Twin-Panel Stream</span>
                </li>
              </ul>
            </div>

          </div>
          
          <div className="mt-12 pt-8 border-t border-royal-200/50 text-center text-xs text-royal-400 font-display tracking-widest">
            MMXXVI. Shashank Upadhyay. Per Angusta Ad Augusta.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;