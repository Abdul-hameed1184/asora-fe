export interface UserSettings {
  id: string;
  userId: string;
  orderUpdates: boolean;
  newArrivals: boolean;
  promotionalNotifications: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserSettingsDto {
  orderUpdates?: boolean;
  newArrivals?: boolean;
  promotionalNotifications?: boolean;
}
