"use client";


import { useState } from "react";

interface TerminalProps {
  username: string;
}

type TabType = "welcome" | "links";

export default function Terminal({}: TerminalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("welcome");


  {/* WELCOME TAB */}
  const renderWelcomeContent = () => (
    <>
      <div className="text-primary-500 mb-4">
        <span className="text-primary-400 text-glow text-lg lg:text-2xl">[TERM-1] IAN :: TYPE WELCOME.TXT</span>
      </div>
      
      <div className="text-primary-400 font-vt323 text-center">
        <pre className="text-glow text-[10px] lg:text-base leading-tight">
{`
   ____            ______             _        
  /  _/__ ____    / __/ /  ___ ____  (_)______ 
 _/ // _ \`/ _ \\  _\\ \\/ _ \\/ _ \`/ _ \\/ / __/ _ \\
/___/\\_,_/_//_/ /___/_//_/\\_,_/ .__/_/_/  \\___/
                             /_/               
`}
        </pre>
        <div className="mt-6 text-primary-400 text-glow text-lg lg:text-xl">
          <div className="mb-2">:: PORTFOLIO v1.0 ::</div>
          <div className="text-sm lg:text-base opacity-80">Select a tab to begin exploring...</div>
        </div>
      </div>

      <div className="text-primary-500 mt-6 mb-4">
        <span className="text-primary-400 text-glow text-lg lg:text-2xl">[TERM-1] IAN :: TYPE ABOUT.TXT</span>
      </div>
      <div className="text-primary-400 font-vt323 max-w-[800px] mx-auto text-center">
        <p className="text-glow text-lg lg:text-2xl leading-relaxed">
          CS grad, developer, drummer, and hardware tinkerer from Memphis. I like to code, build FPV drones, 
          make music, and ship small video games. I work at a security startup that fights malvertising, but 
          most of the time I'm just building stuff for fun. I love old computers, cybersecurity, and retro 
          aesthetics. When I'm not at the keyboard I'm probably soldering something or behind a kit.
        </p>
        <div className="text-glow text-lg lg:text-2xl mt-3">Feel free to explore my links.</div>
      </div>
    </>
  );

  {/* LINKS TAB */}
  const renderLinksContent = () => (
    <>
      <div className="text-primary-500 mb-4">
        <span className="text-primary-400 text-glow text-lg lg:text-2xl">[TERM-1] IAN :: TYPE LINKS.TXT</span>
      </div>
      
      <div className="text-primary-400 font-vt323 space-y-2 text-center">
        <div className="text-glow text-lg lg:text-2xl">
          <a 
            href="https://github.com/romii" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline text-primary-400 hover:text-primary-300 transition-colors duration-200"
          >
            <span className="text-primary-500">{'>>'}</span> <span className="text-glow-hover">GitHub</span> <span className="text-primary-500">{'<<'}</span>
          </a>
        </div>
        <div className="text-glow text-lg lg:text-2xl">
          <a 
            href="https://www.linkedin.com/in/ianshapirodev/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline text-primary-400 hover:text-primary-300 transition-colors duration-200"
          >
            <span className="text-primary-500">{'>>'}</span> <span className="text-glow-hover">LinkedIn</span> <span className="text-primary-500">{'<<'}</span>
          </a>
        </div>
        <div className="text-glow text-lg lg:text-2xl">
          <a 
            href="mailto:ianshapiro1@gmail.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline text-primary-400 hover:text-primary-300 transition-colors duration-200"
          >
            <span className="text-primary-500">{'>>'}</span> <span className="text-glow-hover">Email</span> <span className="text-primary-500">{'<<'}</span>
          </a>
        </div>
        <div className="text-glow text-lg lg:text-2xl">
          <a 
            href="https://romii0x.itch.io/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline text-primary-400 hover:text-primary-300 transition-colors duration-200"
          >
            <span className="text-primary-500">{'>>'}</span> <span className="text-glow-hover">itch.io</span> <span className="text-primary-500">{'<<'}</span>
          </a>
        </div>
      </div>
    </>
  );

  {/* TERMINAL */}
  return (
    <div className="lg:h-full font-vt323 flex flex-col min-h-0 border border-primary-500">
      {/* top tabs */}
      <div className="bg-black border-b border-primary-500">
        <div className="flex">
          <button
            onClick={() => setActiveTab("welcome")}
            className={`flex-1 px-3 py-1 text-base lg:text-lg transition-colors duration-200 border-r border-primary-500 ${
              activeTab === "welcome"
                ? "text-primary-400 text-glow border-primary-400"
                : "text-primary-500 hover:text-primary-300 text-glow text-glow-hover"
            }`}
            style={activeTab === "welcome" ? { backgroundColor: 'var(--color-tab-active-bg)' } : {}}
          >
            WELCOME
          </button>
          <button
            onClick={() => setActiveTab("links")}
            className={`flex-1 px-3 py-1 text-base lg:text-lg transition-colors duration-200 ${
              activeTab === "links"
                ? "text-primary-400 text-glow border-primary-400"
                : "text-primary-500 hover:text-primary-300 text-glow text-glow-hover"
            }`}
            style={activeTab === "links" ? { backgroundColor: 'var(--color-tab-active-bg)' } : {}}
          >
            LINKS
          </button>
        </div>
      </div>

      {/* body */}
      <div className="p-3 h-full overflow-y-auto min-h-0">
        {activeTab === "welcome" && renderWelcomeContent()}
        {activeTab === "links" && renderLinksContent()}

        <div className="mt-4 text-primary-500">
          <span className="text-primary-400 text-glow text-lg lg:text-2xl">[TERM-1] IAN :: </span>
          <span className="text-primary-400 cursor-blink text-glow text-lg lg:text-2xl">_</span>
        </div>
      </div>
    </div>
  );
} 