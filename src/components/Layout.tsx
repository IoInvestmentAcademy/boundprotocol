import { Navbar } from "./Navbar";
import { useRouter } from "next/router";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const isBoundV2Page = router.pathname === "/bound-v2";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main style={{ backgroundColor: "#f6f4fe" }} className="pt-16 pb-8 ">
        <div
          className={
            isBoundV2Page ? "" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          }
        >
          {children}
        </div>
      </main>
    </div>
  );
}
