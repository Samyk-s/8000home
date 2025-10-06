"use client";
import Breadcrumbs from "@/components/adminComponents/beadcrumb/bedcrumb";
const SeoForm = dynamic(
  () =>
    import(
      "@/components/adminComponents/pages-components/forms/seo-form/seo-form"
    ),
);
import PageTabs from "@/components/adminComponents/tabs/page-tabs";
import { SeoEntity } from "@/types/enum/enum";
import { Card } from "antd";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import React from "react";

const SEOPage = () => {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="flex flex-col gap-3">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Page", href: "/admin/pages" },
          { label: "Edit Page", href: `/admin/pages/${id}/edit` },
        ]}
        separator="/"
      />
      <Card>
        <div className="flex flex-col gap-3">
          <PageTabs id={id as string} />
          <SeoForm id={id} type={SeoEntity.PAGE} />
        </div>
      </Card>
    </div>
  );
};

export default SEOPage;
