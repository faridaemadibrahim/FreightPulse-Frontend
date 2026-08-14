import { getAlerts } from "@/lib/api/alerts";
import AlertsClient from "@/components/alerts/AlertsClient";

export default async function AlertsPage() {
  const alerts = await getAlerts();

  return <AlertsClient initialAlerts={alerts} />;
}
