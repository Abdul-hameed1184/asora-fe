import {
    QueryKey,
    useQuery,
    UseQueryOptions,
} from "@tanstack/react-query";

type ApiQueryOptions<TData> = Omit<
    UseQueryOptions<TData>,
    "queryKey" | "queryFn"
> & {
    queryKey: QueryKey;
    queryFn: () => Promise<TData>;
};

export function useApiQuery<TData>({
    queryKey,
    queryFn,
    ...options
}: ApiQueryOptions<TData>) {
    return useQuery({
        queryKey,
        queryFn,
        ...options,
    });
}