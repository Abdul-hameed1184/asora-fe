import {
  useMutation,
  useQueryClient,
  QueryKey,
} from "@tanstack/react-query";

interface MutationProps<TData, TVariables> {
  mutationFn: (
    variables: TVariables
  ) => Promise<TData>;

  invalidateKeys?: QueryKey[];
}

export function useApiMutation<
  TData,
  TVariables
>({
  mutationFn,
  invalidateKeys = [],
}: MutationProps<TData, TVariables>) {

  const queryClient = useQueryClient();

  return useMutation({

    mutationFn,

    onSuccess() {

      invalidateKeys.forEach((key) => {

        queryClient.invalidateQueries({
          queryKey: key,
        });

      });

    },

  });

}