"use client";
import Title from "antd/es/skeleton/Title";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const PageTabs = ({
  id,
  path = "pages",
  title = "Page",
}: {
  id?: string;
  path?: string;
  title?: string;
}) => {
  const pathname = usePathname();

  const isSeo = pathname.endsWith("/seo");
  const isCreate = pathname.endsWith("/create-page");
  const isPage = !isSeo;

  return isCreate ? (
    <div>
      <Link
        href={`/admin/${path}/${id}`}
        className={`cursor-default ${isPage ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-500 hover:text-gray-500"} px-4 py-1 font-semibold`}
      >
        {title}
      </Link>
    </div>
  ) : (
    <div>
      <Link
        href={`/admin/${path}/${id}`}
        className={`cursor-default ${isPage ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-500 hover:text-gray-500"} px-4 py-1 font-semibold`}
      >
        {title}
      </Link>
      <Link
        href={`/admin/${path}/${id}/seo`}
        className={`px-4 py-1 font-semibold ${isSeo ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-500 hover:text-gray-500"} `}
      >
        SEO
      </Link>
    </div>
  );
};

export default PageTabs;
