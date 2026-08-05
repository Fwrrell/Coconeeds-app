import { auth } from "@/lib/auth";
import { PerusahaanSidebar } from "@/components/perusahaan-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Provider from "@/components/providers";

// layout perusahaan 1:1 mirror dr admin layout
export default async function PerusahaanLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 14)",
        } as React.CSSProperties
      }
    >
      <PerusahaanSidebar variant="inset" user={session?.user} />
      <SidebarInset className="bg-[#FFFFFF] min-h-screen font-['Quicksand',sans-serif]">
        <SiteHeader />
        <div className="flex flex-1 flex-col bg-[#FFFFFF]">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 md:gap-6">
              <Provider>{children}</Provider>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
