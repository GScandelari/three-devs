"use client";

import { useEffect, useState } from "react";
import {
  getAllClients,
  getAllContracts,
  getAllProjects,
} from "@/lib/firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import {
  DashboardView,
  type DashboardData,
} from "@/components/admin/DashboardView";

export default function AdminDashboardPage() {
  const { developer } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [clients, projects, contracts] = await Promise.all([
          getAllClients(),
          getAllProjects(),
          getAllContracts(),
        ]);
        setData({ clients, projects, contracts });
      } catch {
        setFailed(true);
      }
    }
    load();
  }, []);

  return (
    <DashboardView
      data={data}
      failed={failed}
      developerName={developer?.name}
    />
  );
}
