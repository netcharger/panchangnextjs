import { useQuery } from "@tanstack/react-query";
import { fetchPanchangam } from "../lib/api";

export default function useDayData(date, language = 'te') {
  const { data, isLoading, error } = useQuery({
    queryKey: ['panchangam', date, language],
    queryFn: () => fetchPanchangam(date, language),
    enabled: !!date,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  return {
    data: data || null,
    isLoading,
    error
  };
}
