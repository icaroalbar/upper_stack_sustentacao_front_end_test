"use client";

import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icons";
import Link from "next/link";
import React from "react";
import { sidebar } from "./sidebar-info";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const currentPath = usePathname();
  const lastSegment = currentPath.split("/").filter(Boolean).pop();

  return (
    <div className="bg-background border-border/30 col-span-1 h-screen border-r py-10">
      <ul>
        {sidebar.map((item, index) => (
          <li key={index}>
            <Button
              variant="ghost"
              asChild
              className={`w-full ${lastSegment === item.link ? "bg-red-500" : ""}`}
            >
              <Link
                href={`/settings/${item.link}`}
                className="flex justify-start"
              >
                <Icon name={item.icon} />
                <span>{item.title}</span>
              </Link>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
