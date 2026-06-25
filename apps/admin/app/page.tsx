import { AdminShell } from "@/components/admin-shell";
import { SitesDashboard } from "@/components/sites-dashboard";
import { getSitesForDashboardFast } from "@/lib/sites-meta";

export default function AdminDashboardPage() {
  const sites = getSitesForDashboardFast();

  return (
    <AdminShell
      title="Domény"
      subtitle={`${sites.length} ${sites.length === 1 ? "stránka" : sites.length < 5 ? "stránky" : "stránok"} na správu`}
    >
      <SitesDashboard sites={sites} />
    </AdminShell>
  );
}