import { getDashboard } from "@/lib/api/dashboard";
import DashboardClient from "@/components/Dashboard/DashboardClient";
export default async function HomePage() {
  const dashboardData = await getDashboard();

  return (
    <div>
      <DashboardClient initialData={dashboardData} />
    </div>
  );
}
