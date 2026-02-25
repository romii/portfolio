import LeftBar from "@/components/LeftBar";
import RightBar from "@/components/RightBar";
import LatestCommit from "@/components/LatestCommit";
import ActivityChart from "@/components/ActivityChart";
import Languages from "@/components/Languages";
import Terminal from "@/components/Terminal";

export default function Home() {
  return (
    <div className="h-screen text-primary-500 font-vt323 crt-noise overflow-hidden">
      {/* DESKTOP LAYOUT */}
      <div 
        className="hidden lg:flex border-primary-500 p-4 crt-curve overflow-hidden"
        style={{
          height: 'var(--desktop-container-height)',
          marginLeft: 'var(--desktop-side-margin)',
          marginRight: 'var(--desktop-side-margin)',
          marginTop: 'var(--desktop-top-bottom-margin)',
          marginBottom: 'var(--desktop-top-bottom-margin)',
          borderWidth: 'var(--desktop-border-width)'
        }}
      >
        <div className="h-full grid grid-cols-12 gap-3 flex-1 min-h-0">
          <div className="col-span-3 min-h-0">
            <LeftBar />
          </div>
          <div className="col-span-7 min-h-0">
            <Terminal 
              username="ian@portfolio"
            />
          </div>
          <div className="col-span-2 min-h-0">
            <RightBar />
          </div>
        </div>
      </div>

      {/* MOBILE LAYOUT */}
      <div className="lg:hidden h-full overflow-y-auto p-3">
        <div className="space-y-3">
          <Terminal 
            username="ian@portfolio"
          />
          <Languages isMobile={true} />
          <ActivityChart isMobile={true} />
          <LatestCommit isMobile={true} />
        </div>
      </div>
    </div>
  );
}
