import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { authApi } from "@/api/auth"
import { TOKEN_STORAGE_KEY, getApiErrorMessage } from "@/api/client"
import type { LoginPayload, RegisterPayload } from "@/api/types"

export const authKeys = {
  me: ["auth", "me"] as const,
}

/** Fetches the currently logged-in user. Disabled automatically if there's no token. */
export function useCurrentUser() {
  const hasToken = Boolean(localStorage.getItem(TOKEN_STORAGE_KEY))

  return useQuery({
    queryKey: authKeys.me,
    queryFn: authApi.me,
    enabled: hasToken,
    retry: false,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: async (token) => {
      localStorage.setItem(TOKEN_STORAGE_KEY, token.access_token)
      await queryClient.invalidateQueries({ queryKey: authKeys.me })
      toast.success("Welcome back!")
      navigate("/")
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Invalid email or password"))
    },
  })
}

export function useRegister() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: () => {
      toast.success("Account created — please sign in")
      navigate("/login")
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not create account"))
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    queryClient.clear()
    navigate("/login")
  }
}
