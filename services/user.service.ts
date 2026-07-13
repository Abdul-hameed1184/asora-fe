import { apiClient } from "@/lib/api/client";

import {
  Address,
  User,
  WishlistItem,
  UpdateProfileDto,
  ChangePasswordDto,
  CreateAddressDto,
  UpdateAddressDto,
} from "@/types/user.type";
import { ApiSuccess } from "@/types/api.types";

export class UserService {
  /**
   * ==========================
   * PROFILE
   * ==========================
   */

  static async updateProfile(data: UpdateProfileDto) {
    const response = await apiClient.put<ApiSuccess<User>>(
      "/users/profile",
      data
    );

    return response.data;
  }

  /**
   * ==========================
   * PASSWORD
   * ==========================
   */

  static async changePassword(data: ChangePasswordDto) {
    const response = await apiClient.post<ApiSuccess<null>>(
      "/users/change-password",
      data
    );

    return response.data;
  }

  /**
   * ==========================
   * ADDRESSES
   * ==========================
   */

  static async getAddresses() {
    const response = await apiClient.get<ApiSuccess<Address[]>>(
      "/users/addresses"
    );

    return response.data;
  }

  static async addAddress(data: CreateAddressDto) {
    const response = await apiClient.post<ApiSuccess<Address>>(
      "/users/addresses",
      data
    );

    return response.data;
  }

  static async updateAddress(
    id: string,
    data: UpdateAddressDto
  ) {
    const response = await apiClient.put<ApiSuccess<Address>>(
      `/users/addresses/${id}`,
      data
    );

    return response.data;
  }

  static async deleteAddress(id: string) {
    const response = await apiClient.delete<ApiSuccess<null>>(
      `/users/addresses/${id}`
    );

    return response.data;
  }

  /**
   * ==========================
   * WISHLIST
   * ==========================
   */

  static async getWishlist() {
    const response = await apiClient.get<ApiSuccess<WishlistItem[]>>(
      "/users/wishlist"
    );

    return response.data;
  }

  static async addToWishlist(productId: string) {
    const response = await apiClient.post<ApiSuccess<null>>(
      `/users/wishlist/${productId}`
    );

    return response.data;
  }

  static async removeFromWishlist(productId: string) {
    const response = await apiClient.delete<ApiSuccess<null>>(
      `/users/wishlist/${productId}`
    );

    return response.data;
  }
}