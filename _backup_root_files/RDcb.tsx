import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// IMPORTANT: load SidebarAdmin as client-only to avoid server/client boundary issues
const SidebarAdmin = dynamic(() => import("@/components/shared/SidebarAdmin"), {
  ssr: false,
  loading: () => <div className="p-3 text-sm">Loading sidebar...</div>,
});

export const metadata: Metadata = {
  title: "Luminedge Booking Portal",
  description:
    "Luminedge Bangladesh offers a wide range of services, including educational consulting for studying abroad, visa and immigration assistance, English language proficiency exams, and career pathway guidance. Luminedge assists students in studying abroad in various countries across the globe, including but not limited to Australia, the United States, Canada, the United Kingdom, New Zealand, and European nations. We offer comprehensive preparation courses for English language proficiency exams such as IELTS, PTE, and TOEFL. Our experienced instructors provide personalized training to help you achieve your target scores and enhance your language skills for academic and professional success.",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row p-0">
      {/* Sidebar */}
      <div className="w-full md:w-1/5 bg-[#ffffff] text-[#00000f] shadow-1xl rounded-1xl md:rounded-2xl border md:border-2 md:min-h-screen p-3 relative">
        <Suspense fallback={<div className="p-3 text-sm">Loading sidebar...</div>}>
          <SidebarAdmin />
        </Suspense>

        {/* Responsive divider */}
        <div className="hidden md:block absolute right-0 top-0 bottom-0 w-px bg-gray-200" />
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full md:w-4/5 p-0">
        <div className="p-0">{children}</div>
      </div>
    </div>
  );
}
