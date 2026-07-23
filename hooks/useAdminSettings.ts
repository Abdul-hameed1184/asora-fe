import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminSettingsKeys } from "@/lib/queries/adminSettings.keys";
import { AdminSettingsService } from "@/services/adminSettings.service";
import { AdminSettings, UpdateAdminSettingsDto } from "@/types/adminSettings.types";

export function useAdminSettings() {
  return useQuery<AdminSettings>({
    queryKey: adminSettingsKeys.all,
    queryFn: () => AdminSettingsService.getSettings().then((res) => res.data),
  });
}

export function useUpdateAdminSettings() {
  const qc = useQueryClient();

  return useMutation<AdminSettings, Error, UpdateAdminSettingsDto>({
    mutationFn: (data) => AdminSettingsService.updateSettings(data).then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminSettingsKeys.all });
    },
  });
}
