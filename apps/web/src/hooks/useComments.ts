import { gqlClient } from '../api/client'
import { CREATE_COMMENT_MUTATION } from '../api/comments.queries'
import { useMutation } from './useQueryShim'
import { normalizeComment } from '../support/utils'

export function useCreateComment(onSuccess?: () => void) {
  return useMutation(
    async (payload: { ticketId: string; body: string }) => {
      const data = await gqlClient<{
        addComment: {
          id: string
          body: string
          ticketId: string
          createdAt: string
          updatedAt: string
          user: { id: string; email: string; role: string }
        }
      }>(CREATE_COMMENT_MUTATION, payload)
      return normalizeComment(data.addComment)
    },
    { onSuccess: () => onSuccess?.() }
  )
}
