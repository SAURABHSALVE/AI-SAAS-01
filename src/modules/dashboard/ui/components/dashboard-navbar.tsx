"use client";

import { PanelLeftCloseIcon, PanelLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { DashboardUserButton } from "@/modules/dashboard/ui/components/dashboard-user-button";

export const DashboardNavbar = () => {
  const { state, toggleSidebar, isMobile } = useSidebar();

  return (
    <nav className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/80 px-4 py-3 backdrop-blur-sm">
      <Button
        variant="outline"
        className="size-9"
        onClick={toggleSidebar}
      >
        {(state === "collapsed" || isMobile)
          ? <PanelLeftIcon className="size-4" />
          : <PanelLeftCloseIcon className="size-4" />
        }
      </Button>
      <DashboardUserButton />
    </nav>
  );
};