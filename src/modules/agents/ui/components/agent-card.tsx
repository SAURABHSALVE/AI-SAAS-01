"use client";

import Link from "next/link";
import { GlobeIcon, LockIcon, MoreVerticalIcon, PencilIcon, TrashIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GeneratedAvatar } from "@/components/ui/generated-avatar";
import { CATEGORY_OPTIONS } from "@/modules/agents/constants";
import type { AgentGetMany } from "@/modules/agents/types";

interface AgentCardProps {
  agent: AgentGetMany;
  onEdit: () => void;
  onDelete: () => void;
}

export const AgentCard = ({ agent, onEdit, onDelete }: AgentCardProps) => {
  const categoryLabel =
    CATEGORY_OPTIONS.find((c) => c.value === agent.category)?.label ?? agent.category;

  return (
    <Card className="group h-full transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      <CardHeader className="flex-row items-start gap-4 space-y-0">
        <GeneratedAvatar
          seed={agent.avatar || agent.name}
          variant="botttsNeutral"
          className="size-10 ring-2 ring-transparent transition-all group-hover:ring-primary/20"
        />

        <div className="min-w-0 flex-1 space-y-1.5">
          <Link
            href={`/agents/${agent.id}`}
            className="line-clamp-1 font-medium underline-offset-4 transition-colors group-hover:text-primary hover:underline"
          >
            <CardTitle className="truncate">{agent.name}</CardTitle>
          </Link>
          <CardDescription className="line-clamp-1">{agent.role}</CardDescription>

          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <Badge variant="secondary" className="font-normal">
              {categoryLabel}
            </Badge>
            <Badge variant="outline" className="gap-1 font-normal">
              {agent.visibility === "public" ? (
                <GlobeIcon className="size-3" />
              ) : (
                <LockIcon className="size-3" />
              )}
              {agent.visibility === "public" ? "Public" : "Private"}
            </Badge>
          </div>

          {!agent.isOwner && (
            <p className="truncate text-xs text-muted-foreground">by {agent.owner.name}</p>
          )}
        </div>

        {agent.isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0"
                aria-label="Agent actions"
              >
                <MoreVerticalIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <PencilIcon className="size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={onDelete}>
                <TrashIcon className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
    </Card>
  );
};
