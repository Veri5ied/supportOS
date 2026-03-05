import { useCallback, useEffect, useRef, useState } from 'react'

export function useQuery<T>({
  queryKey,
  queryFn,
  enabled = true,
  initialData,
}: {
  queryKey: unknown[]
  queryFn: () => Promise<T>
  enabled?: boolean
  initialData?: T
}) {
  const [data, setData] = useState<T | null>(initialData ?? null)
  const [isLoading, setIsLoading] = useState(enabled)
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const queryFnRef = useRef(queryFn)
  const key = JSON.stringify(queryKey)

  useEffect(() => {
    queryFnRef.current = queryFn
  }, [queryFn])

  const refresh = useCallback(async () => {
    if (!enabled) return
    setIsLoading(true)
    setIsError(false)
    setError(null)
    try {
      const next = await queryFnRef.current()
      setData(next)
      setIsLoading(false)
    } catch (err) {
      setData(null)
      setIsLoading(false)
      setIsError(true)
      setError(err instanceof Error ? err : new Error('Request failed'))
    }
  }, [enabled])

  useEffect(() => {
    void refresh()
  }, [refresh, key, enabled])

  return { data, isLoading, isError, error, refresh }
}

export function useMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  opts?: {
    onSuccess?: (data: TData, variables: TVariables) => void
    onError?: (error: Error, variables: TVariables) => void
  }
) {
  const [isPending, setIsPending] = useState(false)
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const mutate = useCallback(
    async (variables: TVariables) => {
      setIsPending(true)
      setIsError(false)
      setError(null)
      try {
        const data = await mutationFn(variables)
        setIsPending(false)
        opts?.onSuccess?.(data, variables)
        return data
      } catch (err) {
        const next = err instanceof Error ? err : new Error('Request failed')
        setIsPending(false)
        setIsError(true)
        setError(next)
        opts?.onError?.(next, variables)
        return undefined
      }
    },
    [mutationFn, opts]
  )

  return { isPending, isError, error, mutate }
}
