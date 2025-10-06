"use client";
import React, { Suspense } from "react";
import { useParams } from "next/navigation";
import { useDepartures } from "@/hooks/departure/useDeparture";
import Loader from "../loader/loader";
import Entry from "../../entry/entry";
import Search from "../../search/search";
import Pagination from "../../pagination/pagination";
import ToggleButton from "../../toggle-button/toggle-button";
import { PlusIcon, TrashIcon } from "@/assets/icons";
import { Button, message, Modal, Popconfirm } from "antd";
import PackageTabs from "../../tabs/package-tabs";
import dynamic from "next/dynamic";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DepartureItem } from "@/types/departure";

const DepartureForm = dynamic(
  () => import("../forms/departure-form/departure-form"),
  { ssr: false },
);

const DepartureTable: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const packageId = Number(id);

  const {
    items,
    loading,
    error,
    meta,
    limit,
    search,
    isModalOpen,
    handleSearch,
    openModal,
    closeModal,
    handleDelete,
    handleToggleStatus,
    changePage,
    changeLimit,
  } = useDepartures(packageId);

  if (loading) return <Loader />;
  if (error) message.error(error);

  return (
    <>
      <div className="min-h-screen p-1">
        <div className="rounded-lg bg-white shadow-sm">
          {/* Header */}
          <div className="flex flex-col gap-3 border-b border-gray-200 p-6">
            <div className="flex flex-wrap-reverse items-center justify-center gap-3 md:justify-between">
              <PackageTabs />
              <Button
                className="flex w-fit items-center gap-1 rounded-md bg-black px-2 py-1 text-white hover:!bg-black hover:!text-white dark:bg-white dark:text-black"
                onClick={openModal}
              >
                <PlusIcon />
                <span>Create</span>
              </Button>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Entry
                value={limit}
                onChange={(val) => changeLimit(Number(val))}
                total={meta?.totalItems}
              />
              <Search
                placeholder="Search departure..."
                search={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader className="bg-blue-900 text-white">
                <TableRow>
                  <TableHead className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider text-white">
                    S.N.
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider text-white">
                    Start date
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider text-white">
                    End date
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider text-white">
                    Days
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider text-white">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-200 bg-white">
                {items && items.length > 0 ? (
                  items.map((item: DepartureItem, index: number) => (
                    <TableRow key={item.id}>
                      <TableCell className="px-6 py-4">{index + 1}</TableCell>
                      <TableCell className="px-6 py-4">
                        {item.startDate}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {item.endDate}
                      </TableCell>
                      <TableCell className="px-6 py-4">{item.days}</TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Popconfirm
                            title="Delete the Departure"
                            description="Are you sure to delete this departure?"
                            onCancel={() => message.error("Cancelled")}
                            onConfirm={() => handleDelete(item.id)}
                            okText="Yes"
                            cancelText="No"
                          >
                            <button
                              className="rounded p-1 text-red-600 hover:bg-red-50 hover:text-red-900"
                              title="Delete departure"
                            >
                              <TrashIcon />
                            </button>
                          </Popconfirm>

                          <ToggleButton
                            onChange={() => handleToggleStatus(item.id)}
                            checked={item.status === 1}
                            title={
                              item.status === 1 ? "Deactivate" : "Activate"
                            }
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="px-6 py-8 text-center text-base text-gray-500"
                    >
                      No departure found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={meta?.currentPage}
            totalPages={meta?.totalPages}
            itemsPerPage={limit}
            totalItems={meta?.totalItems}
            onPageChange={changePage}
          />
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        title="Add Departure"
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        centered
        width={800}
        style={{ maxWidth: "90%", padding: 0 }}
      >
        <Suspense fallback={null}>
          <DepartureForm onClose={closeModal} />
        </Suspense>
      </Modal>
    </>
  );
};

export default DepartureTable;
