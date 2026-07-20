"use client";

import React, { useEffect, useState } from "react";
import { X, Pencil, Plus, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useCreateCategory,
  useUpdateCategory,
} from "@/hooks/useCategories";
import type { Category } from "@/lib/api/category.api";

const labelCls =
  "text-[10px] font-courier font-bold tracking-[2px] uppercase text-zinc-400 block mb-1";
const inputCls =
  "w-full px-3 py-2 bg-white border border-[#EBE8E2] text-sm text-zinc-900 focus:outline-none focus:border-[#C99A36] transition-colors";

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onCreated?: (category: Category) => void;
}

export default function CategoryManagerModal({
  isOpen,
  onClose,
  categories,
  onCreated,
}: CategoryManagerModalProps) {
  // ── Add-new form state ────────────────────────────────────────────────
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  // ── Inline-edit state (one row at a time) ───────────────────────────
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const error = createMutation.error?.message ?? updateMutation.error?.message;

  useEffect(() => {
    if (!isOpen) {
      setNewName("");
      setNewDescription("");
      setEditingId(null);
      createMutation.reset();
      updateMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditDescription(category.description ?? "");
    updateMutation.reset();
  };

  const cancelEdit = () => {
    setEditingId(null);
    updateMutation.reset();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newDescription.trim() || createMutation.isPending)
      return;

    try {
      const created = await createMutation.mutateAsync({
        name: newName.trim(),
        description: newDescription.trim(),
      });
      setNewName("");
      setNewDescription("");
      onCreated?.(created);
    } catch {
      // Surfaced via createMutation.error in the banner above.
    }
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim() || !editDescription.trim() || updateMutation.isPending)
      return;

    try {
      await updateMutation.mutateAsync({
        id,
        data: { name: editName.trim(), description: editDescription.trim() },
      });
      setEditingId(null);
    } catch {
      // Surfaced via updateMutation.error in the banner above.
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-60 transition-opacity"
        onClick={onClose}
      />

      {/* Centered panel */}
      <div className="fixed inset-0 z-60 flex items-center justify-center p-4 pointer-events-none">
        <div
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-auto w-full max-w-[440px] max-h-[80vh] bg-[#FAF7F2] border border-border shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-border bg-white shrink-0">
            <h2 className="text-lg font-garamound font-bold text-zinc-900">
              Manage Categories
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-[#C23A3A] px-3 py-2 text-xs font-courier">
                <span className="font-bold uppercase tracking-wider shrink-0">
                  Error
                </span>
                <span>{error}</span>
              </div>
            )}

            {/* ── Add new category ──────────────────────────────────────── */}
            <form onSubmit={handleCreate} className="space-y-3">
              <h3 className="text-xs font-courier font-bold tracking-[2px] uppercase text-zinc-500 border-b border-border pb-2">
                New Category
              </h3>
              <div>
                <label className={labelCls}>Name</label>
                <input
                  type="text"
                  placeholder="Menswear"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <input
                  type="text"
                  placeholder="Men's clothing and accessories"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className={inputCls}
                />
              </div>
              <button
                type="submit"
                disabled={
                  !newName.trim() ||
                  !newDescription.trim() ||
                  createMutation.isPending
                }
                className="flex items-center gap-1.5 bg-[#C99A36] hover:bg-[#B0852E] disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-2 text-xs font-courier font-bold uppercase tracking-wider transition-colors"
              >
                {createMutation.isPending ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Plus size={13} />
                )}
                Add Category
              </button>
            </form>

            {/* ── Existing categories ───────────────────────────────────── */}
            <div className="space-y-3">
              <h3 className="text-xs font-courier font-bold tracking-[2px] uppercase text-zinc-500 border-b border-border pb-2">
                Existing Categories
              </h3>

              {categories.length === 0 && (
                <p className="text-xs font-courier text-zinc-400 text-center py-4">
                  No categories yet.
                </p>
              )}

              <div className="space-y-2">
                {categories.map((c) => {
                  const isEditing = editingId === c.id;
                  const isSavingThis =
                    updateMutation.isPending &&
                    updateMutation.variables?.id === c.id;

                  return (
                    <div
                      key={c.id}
                      className="bg-white border border-[#EBE8E2] p-3 space-y-2"
                    >
                      {isEditing ? (
                        <>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className={inputCls}
                          />
                          <input
                            type="text"
                            value={editDescription}
                            onChange={(e) =>
                              setEditDescription(e.target.value)
                            }
                            className={inputCls}
                          />
                          <div className="flex items-center gap-3 pt-1">
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(c.id)}
                              disabled={
                                !editName.trim() ||
                                !editDescription.trim() ||
                                isSavingThis
                              }
                              className="flex items-center gap-1 text-[11px] font-courier font-bold uppercase tracking-wider text-[#C99A36] hover:text-[#B0852E] disabled:opacity-60 transition-colors"
                            >
                              {isSavingThis ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <Check size={12} />
                              )}
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="text-[11px] font-courier font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-zinc-900 truncate">
                              {c.name}
                            </p>
                            {c.description && (
                              <p className="text-xs text-zinc-500 truncate">
                                {c.description}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => startEdit(c)}
                            className="p-1 text-zinc-300 hover:text-[#C99A36] transition-colors shrink-0"
                          >
                            <Pencil size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
