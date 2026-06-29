"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { Subject, ActiveStatus, ActiveStatusLabel } from "@/types";
import { notify } from "@/lib/notify";
import { parseApiError } from "@/lib/error-utils";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  subjectSchema,
  type SubjectFormValues,
} from "@/schemas/subject.schema";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
  IconBook2,
  IconSearch,
  IconArrowsSort,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

type Meta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

function StatusBadge({ isActive }: { isActive: boolean }) {
  if (isActive) {
    return (
      <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 text-[11px] font-medium rounded-tr-md rounded-bl-md border border-emerald-100">
        <IconCheck size={14} />
        {ActiveStatusLabel[ActiveStatus.ACTIVE]}
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-1 bg-slate-50 text-slate-600 px-2.5 py-1 text-[11px] font-medium rounded-tr-md rounded-bl-md border border-slate-200">
      <IconX size={14} />
      {ActiveStatusLabel[ActiveStatus.INACTIVE]}
    </div>
  );
}

export default function AdminSubjectPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL State
  const page = searchParams.get("page") || "1";
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "all";
  const sort_by = searchParams.get("sort_by") || "id";
  const sort_dir = searchParams.get("sort_dir") || "desc";

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Local state for search input (to debounce)
  const [localSearch, setLocalSearch] = useState(search);

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: "",
      is_active: true,
    },
  });

  const isActiveWatch = watch("is_active");

  const fetchSubjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/api/admin/subjects", {
        params: { page, search, status, sort_by, sort_dir, per_page: 10 },
      });
      setSubjects(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      setError(parseApiError(err, "Cannot load subject list."));
    } finally {
      setIsLoading(false);
    }
  }, [page, search, status, sort_by, sort_dir]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== search) {
        updateFilter("search", localSearch);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, search]);

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== "page") params.set("page", "1");

    router.push(`${pathname}?${params.toString()}`);
  };

  const requestSort = (key: string) => {
    let newDir = "asc";
    if (sort_by === key && sort_dir === "asc") {
      newDir = "desc";
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort_by", key);
    params.set("sort_dir", newDir);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const openAddDialog = () => {
    setEditingSubject(null);
    reset({ name: "", is_active: true });
    setFormError(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (subject: Subject) => {
    setEditingSubject(subject);
    reset({ name: subject.name, is_active: subject.is_active });
    setFormError(null);
    setIsDialogOpen(true);
  };

  const handleDelete = (subject: Subject) => {
    setSubjectToDelete(subject);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!subjectToDelete) return;
    setIsSubmitting(true);
    try {
      const res = await api.delete(`/api/admin/subjects/${subjectToDelete.id}`);
      notify.success(res.data.message || "Subject deleted successfully!");
      setIsDeleteDialogOpen(false);
      setSubjectToDelete(null);
      fetchSubjects();
    } catch (err) {
      notify.error(parseApiError(err, "Cannot delete subject."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit: SubmitHandler<SubjectFormValues> = async (data) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      if (editingSubject) {
        const res = await api.put(
          `/api/admin/subjects/${editingSubject.id}`,
          data,
        );
        notify.success(res.data.message || "Subject updated successfully!");
      } else {
        const res = await api.post("/api/admin/subjects", data);
        notify.success(res.data.message || "Subject added successfully!");
      }
      setIsDialogOpen(false);
      fetchSubjects();
    } catch (err) {
      notify.error(parseApiError(err, "An error occurred while saving the subject."));
      setFormError(parseApiError(err, "An error occurred while saving the subject."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-8xl mx-auto">
      {/* Header Section */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-slate-900">Subject Management</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage the list of subjects supported on the TutorConnect platform.
        </p>
      </div>

      {/* Content Section */}
      <div className="w-full border border-slate-200 rounded-xl overflow-hidden bg-white px-6 py-4">
        <div className="py-2 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-100">
          <div>
            <p className="font-bold text-lg text-slate-900">
              SUBJECT LIST
            </p>
          </div>
          <Button
            onClick={openAddDialog}
            className="py-5 px-4 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
          >
            <IconPlus size={18} className="mr-2" />
            Add Subject
          </Button>
        </div>

        <div className="p-4 bg-slate-50/50 flex flex-col sm:flex-row gap-4 items-end justify-between border-b border-slate-100">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="w-full sm:w-72 space-y-1.5">
              <Label className="text-md font-medium text-slate-500">
                Search
              </Label>
              <div className="relative">
                <IconSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <Input
                  placeholder="Search subjects..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="pl-9 rounded-lg bg-white"
                />
              </div>
            </div>

            <div className="w-full sm:w-48 space-y-1.5">
              <Label className="text-md font-medium text-slate-500">
                Status
              </Label>
              <Select
                value={status}
                onValueChange={(val) => updateFilter("status", val)}
              >
                <SelectTrigger className="w-full bg-white rounded-lg">
                  <SelectValue placeholder="All Statuses">
                    {status === "all"
                      ? "All Statuses"
                      : ActiveStatusLabel[status as ActiveStatus]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className="p-2" value="all">
                    All Statuses
                  </SelectItem>
                  <SelectItem className="p-2" value={ActiveStatus.ACTIVE}>
                    {ActiveStatusLabel[ActiveStatus.ACTIVE]}
                  </SelectItem>
                  <SelectItem className="p-2" value={ActiveStatus.INACTIVE}>
                    {ActiveStatusLabel[ActiveStatus.INACTIVE]}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-sm text-slate-500 whitespace-nowrap">
            Showing{" "}
            <span className="font-medium text-slate-900">
              {meta?.total || 0}
            </span>{" "}
            results
          </div>
        </div>

        {error ? (
          <div className="p-6 text-red-600 text-sm font-medium">{error}</div>
        ) : isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-12 bg-slate-100 animate-pulse rounded-lg"
              ></div>
            ))}
          </div>
        ) : subjects.length === 0 ? (
          <div className="text-center py-16">
            <IconBook2 size={48} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-medium text-slate-700">
              No subjects found
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              No matching data found.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow className="hover:bg-transparent">
                    <TableHead
                      className="w-[100px] cursor-pointer hover:text-slate-900 transition-colors font-medium"
                      onClick={() => requestSort("id")}
                    >
                      <div className="flex items-center gap-1">
                        ID
                        <IconArrowsSort
                          size={14}
                          className={
                            sort_by === "id"
                              ? "text-slate-900"
                              : "text-slate-400"
                          }
                        />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:text-slate-900 transition-colors font-medium"
                      onClick={() => requestSort("name")}
                    >
                      <div className="flex items-center gap-1">
                        Subject Name
                        <IconArrowsSort
                          size={14}
                          className={
                            sort_by === "name"
                              ? "text-slate-900"
                              : "text-slate-400"
                          }
                        />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:text-slate-900 transition-colors font-medium"
                      onClick={() => requestSort("is_active")}
                    >
                      <div className="flex items-center gap-1">
                        Status
                        <IconArrowsSort
                          size={14}
                          className={
                            sort_by === "is_active"
                              ? "text-slate-900"
                              : "text-slate-400"
                          }
                        />
                      </div>
                    </TableHead>
                    <TableHead className="text-center font-medium">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((subject) => (
                    <TableRow key={subject.id} className="group">
                      <TableCell className="font-medium text-slate-600">
                        #{subject.id}
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">
                        {subject.name}
                      </TableCell>
                      <TableCell>
                        <StatusBadge isActive={subject.is_active} />
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => openEditDialog(subject)}
                            className="cursor-pointer p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <IconEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(subject)}
                            className="cursor-pointer p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <IconTrash size={18} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Component */}
            {meta && meta.last_page > 1 && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                <p className="text-sm text-slate-500 hidden sm:block">
                  Page {meta.current_page} of {meta.last_page}
                </p>
                <Pagination className="justify-end w-auto mx-0">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (meta.current_page > 1)
                            updateFilter("page", String(meta.current_page - 1));
                        }}
                        className={
                          meta.current_page === 1
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>

                    {[...Array(meta.last_page)].map((_, i) => {
                      const pageNum = i + 1;
                      if (
                        pageNum === 1 ||
                        pageNum === meta.last_page ||
                        (pageNum >= meta.current_page - 1 &&
                          pageNum <= meta.current_page + 1)
                      ) {
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              href="#"
                              isActive={pageNum === meta.current_page}
                              onClick={(e) => {
                                e.preventDefault();
                                updateFilter("page", String(pageNum));
                              }}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }

                      // Hiển thị dấu ...
                      if (
                        pageNum === meta.current_page - 2 ||
                        pageNum === meta.current_page + 2
                      ) {
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (meta.current_page < meta.last_page)
                            updateFilter("page", String(meta.current_page + 1));
                        }}
                        className={
                          meta.current_page === meta.last_page
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium">
              {editingSubject ? "Edit Subject" : "Add New Subject"}
            </DialogTitle>
            <DialogDescription>
              {editingSubject
                ? "Update the name or change the active status of this subject."
                : "Enter a new subject name to expand options for tutors and students."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
            {formError && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                {formError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name" className="font-medium text-slate-700">
                Subject Name
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Ex: Grade 12 Math, IELTS Preparation..."
                className="rounded-xl"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-slate-50">
              <div>
                <Label
                  className="font-medium text-slate-700 cursor-pointer"
                  htmlFor="is_active"
                >
                  Active Status
                </Label>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inactive subjects will not be displayed in search results
                </p>
              </div>
              <button
                type="button"
                id="is_active"
                role="switch"
                aria-checked={isActiveWatch}
                onClick={() => setValue("is_active", !isActiveWatch)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isActiveWatch ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isActiveWatch ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="rounded-xl border-slate-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Subject</DialogTitle>
            <DialogDescription className="mt-2 text-slate-600">
              Are you sure you want to delete the subject &quot;
              <span className="font-semibold text-slate-900">
                {subjectToDelete?.name}
              </span>
              &quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex gap-3 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="rounded-xl border-slate-200"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isSubmitting}
              onClick={executeDelete}
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? "Deleting..." : "Delete Subject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
