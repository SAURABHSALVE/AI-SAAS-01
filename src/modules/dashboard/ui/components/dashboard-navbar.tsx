"use client";

import { PanelLeftCloseIcon, PanelLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

export const DashboardNavbar = () => {
  const { state, toggleSidebar, isMobile } = useSidebar();

  return (
    <nav className="flex px-4 py-3 border-b bg-background">
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
    </nav>
  );
};