"use client";

import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { NAV_DATA } from "./data";
import { ArrowLeftIcon, ChevronUp } from "./icons";
import { MenuItem } from "./menu-item";
import { useSidebarContext } from "./sidebar-context";

export function Sidebar() {
  const pathname = usePathname();
  const { setIsOpen, isOpen, isMobile, toggleSidebar } = useSidebarContext();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title],
    );
  };

  const checkActive = useCallback(
    (url: string) => pathname === url || pathname.startsWith(url + "/"),
    [pathname], // only depends on pathname
  );

  useEffect(() => {
    // Automatically expand items if any of their subpages are active
    NAV_DATA.forEach((section) => {
      section.items.forEach((item) => {
        if (
          item.items.length &&
          item.items.some((subItem) => checkActive(subItem.url || ""))
        ) {
          if (!expandedItems.includes(item.title)) {
            setExpandedItems((prev) => [...prev, item.title]);
          }
        }
      });
    });
  }, [pathname, expandedItems, checkActive]); // now checkActive is stable

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "max-w-[250px] overflow-hidden border-r border-gray-200 bg-white transition-[width] duration-200 ease-linear dark:border-gray-800 dark:bg-gray-dark",
          isMobile ? "fixed bottom-0 top-0 z-50" : "sticky top-0 h-screen",
          isOpen ? "w-full" : "w-0",
        )}
        aria-label="Main navigation"
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <div className="flex h-full flex-col py-4 pl-[25px] pr-[7px]">
          <div className="relative pr-4.5">
            <Link
              href={"/admin/dashboard"}
              onClick={() => isMobile && toggleSidebar()}
              className="px-0 min-[850px]:py-0"
            >
              <Logo />
            </Link>

            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="absolute left-3/4 right-4.5 top-1/2 -translate-y-1/2 text-right"
              >
                <span className="sr-only">Close Menu</span>
                <ArrowLeftIcon className="ml-auto size-7" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <div className="custom-scrollbar mt-6 flex-1 overflow-y-auto pr-3 min-[850px]:mt-10">
            {NAV_DATA.map((section) => (
              <div key={section.label} className="mb-6">
                <h2 className="mb-5 text-sm font-medium text-dark-4 dark:text-dark-6">
                  {section.label}
                </h2>

                <nav role="navigation" aria-label={section.label}>
                  <ul className="space-y-2">
                    {section.items.map((item) => {
                      // If the item has subitems
                      if (item.items.length) {
                        const isExpanded = expandedItems.includes(item.title);
                        const isActiveItem = item.items.some((sub) =>
                          checkActive(sub.url || ""),
                        );

                        return (
                          <li key={item.title}>
                            <MenuItem
                              isActive={isActiveItem}
                              onClick={() => toggleExpanded(item.title)}
                            >
                              <item.icon
                                className="size-6 shrink-0"
                                aria-hidden="true"
                              />
                              <span className="text-[16px]">{item.title}</span>
                              <ChevronUp
                                className={cn(
                                  "ml-auto rotate-180 transition-transform duration-200",
                                  isExpanded && "rotate-0",
                                )}
                                aria-hidden="true"
                              />
                            </MenuItem>
                          </li>
                        );
                      }

                      // Single item without subitems
                      const href =
                        "url" in item
                          ? item.url + ""
                          : "/" +
                            item.title?.toLowerCase().split(" ").join("-");

                      return (
                        <li key={item.title}>
                          <MenuItem
                            className="flex items-center gap-3 py-3"
                            as="link"
                            href={href}
                            isActive={checkActive(href)}
                          >
                            <item.icon
                              className="size-6 shrink-0"
                              aria-hidden="true"
                            />
                            <span>{item.title}</span>
                          </MenuItem>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
