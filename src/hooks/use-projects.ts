import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { projectsApi } from "@/api/projects"
import { getApiErrorMessage } from "@/api/client"
import type { CreateProjectPayload, UpdateProjectPayload } from "@/api/types"

export const projectKeys = {
  all: ["projects"] as const,
  detail: (id: number) => ["projects", id] as const,
}

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.all,
    queryFn: projectsApi.list,
  })
}

export function useProject(id: number) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectsApi.get(id),
    enabled: Number.isFinite(id),
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateProjectPayload) => projectsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
      toast.success("Project created")
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not create project"))
    },
  })
}

export function useUpdateProject(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateProjectPayload) => projectsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(id) })
      toast.success("Project updated")
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not update project"))
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => projectsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
      // Tasks may have belonged to the deleted project (cascade delete on the backend)
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      toast.success("Project deleted")
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not delete project"))
    },
  })
}
