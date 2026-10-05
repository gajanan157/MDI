package com.mdindia.enrollment.common.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(
    boolean success,
    String message,
    T data,
    Pagination pagination,
    String error,
    Integer status
) {
    public record Pagination(long totalRecords, int totalPages, int currentPage, int pageSize) {}

    public ApiResponse(boolean success, String message, T data, String error, Integer status) {
        this(success, message, data, null, error, status);
    }

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, "Operation successful", data, null, null, 200);
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data, null, null, 200);
    }

    public static <T> ApiResponse<T> success(T data, Pagination pagination) {
        return new ApiResponse<>(true, "Operation successful", data, pagination, null, 200);
    }

    public static <T> ApiResponse<T> success(String message, T data, Pagination pagination) {
        return new ApiResponse<>(true, message, data, pagination, null, 200);
    }

    public static <T> ApiResponse<List<T>> success(List<T> data, long totalRecords, int totalPages, int currentPage, int pageSize) {
        return new ApiResponse<>(true, "Operation successful", data, new Pagination(totalRecords, totalPages, currentPage, pageSize), null, 200);
    }

    public static <T> ApiResponse<List<T>> ofList(List<T> data) {
        long total = data != null ? data.size() : 0;
        int size = (int) Math.max(total, 20);
        return new ApiResponse<>(true, "Operation successful", data, new Pagination(total, 1, 0, size), null, 200);
    }

    public static <T> ApiResponse<List<T>> ofPage(PageResponse<T> page) {
        return new ApiResponse<>(true, "Operation successful", page.content(), new Pagination(page.totalElements(), page.totalPages(), page.currentPage(), page.pageSize()), null, 200);
    }

    public static <T> ApiResponse<T> error(String message, int status) {
        return new ApiResponse<>(false, message, null, null, message, status);
    }

    public static <T> ApiResponse<T> error(String message, String errorDetails, int status) {
        return new ApiResponse<>(false, message, null, null, errorDetails, status);
    }
}
