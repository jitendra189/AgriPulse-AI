import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

type PageContainerProps = {
  children: ReactNode;
};

export default function PageContainer({ children }: PageContainerProps) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50">
      <Sidebar />
      <div className="min-h-screen lg:ml-64">
        <Header />
        <main className="px-4 py-5 sm:px-6 sm:py-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1600px] min-w-0">{children}</div>
        </main>
      </div>
    </div>
  );
}