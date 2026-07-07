import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { tasksApi } from "@/api/tasks"
import { getApiErrorMessage } from "@/api/client"
import type { CreateTaskPayload, TaskListFilters, UpdateTaskPayload } from "@/api/types"

export const taskKeys = {
  all: ["tasks"] as const,
  list: (filters?: TaskListFilters) => ["tasks", "list", filters ?? {}] as const,
  detail: (id: number) => ["tasks", id] as const,
  stats: ["tasks", "stats"] as const,
}

export function useTasks(filters?: TaskListFilters) {
  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: () => tasksApi.list(filters),
  })
}

export function useTask(id: number) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => tasksApi.get(id),
    enabled: Number.isFinite(id),
  })
}

/** Powers the Total / Completed / In Progress / Overdue stat cards. */
export function useTaskStats() {
  return useQuery({
    queryKey: taskKeys.stats,
    queryFn: tasksApi.stats,
  })
}

function useInvalidateTasks() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: taskKeys.all })
    queryClient.invalidateQueries({ queryKey: taskKeys.stats })
  }
}

export function useCreateTask() {
  const invalidateTasks = useInvalidateTasks()

  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => tasksApi.create(payload),
    onSuccess: () => {
      invalidateTasks()
      toast.success("Task created")
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not create task"))
    },
  })
}

export function useUpdateTask(id: number) {
  const invalidateTasks = useInvalidateTasks()

  return useMutation({
    mutationFn: (payload: UpdateTaskPayload) => tasksApi.update(id, payload),
    onSuccess: () => {
      invalidateTasks()
      toast.success("Task updated")
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not update task"))
    },
  })
}

export function useDeleteTask() {
  const invalidateTasks = useInvalidateTasks()

  return useMutation({
    mutationFn: (id: number) => tasksApi.remove(id),
    onSuccess: () => {
      invalidateTasks()
      toast.success("Task deleted")
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not delete task"))
    },
  })
}
