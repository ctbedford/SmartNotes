import { Helmet } from "react-helmet";
import MandalaChart from "@/components/dashboard/MandalaChart";
import RecentActivity from "@/components/dashboard/RecentActivity";
import RecentCaptures from "@/components/dashboard/RecentCaptures";
import XpProgress from "@/components/dashboard/XpProgress";

export default function Dashboard() {
  return (
    <>
      <Helmet>
        <title>Dashboard | Aether Lite</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
      </Helmet>
      
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <h2 className="text-2xl font-bold mb-2 sm:mb-0">Dashboard</h2>
          <XpProgress />
        </div>

        <MandalaChart />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivity />
          <RecentCaptures />
        </div>
      </div>
    </>
  );
}
