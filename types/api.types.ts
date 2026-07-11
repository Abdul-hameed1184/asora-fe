
export interface ApiSuccess<T> {
    success: true;
    message: string;
    data: T;
}

export interface Meta {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
}

export interface ApiError {
    success: false;
    message: string;
    error: {
        code: string;
        details?: unknown;
    };
}

export interface PaginatedResponse<T> extends ApiSuccess<T>{
    meta: Meta;
}