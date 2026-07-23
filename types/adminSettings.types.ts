export interface AdminSettings {
  id: string;
  mailUsersOnNewArrival: boolean;
  mailUsersOnRestock: boolean;
  mailUsersOnNewCoupon: boolean;
  updatedAt: string;
}

export interface UpdateAdminSettingsDto {
  mailUsersOnNewArrival?: boolean;
  mailUsersOnRestock?: boolean;
  mailUsersOnNewCoupon?: boolean;
}
