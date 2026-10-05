package com.mdindia.enrollment.common.dto;

import java.util.List;

public record PageResponse<T>(
    List<T> content,
    long totalElements,
    int totalPages,
    int currentPage,
    int pageSize
) {
    public static <T> PageResponse<T> of(List<T> content, long totalElements, int currentPage, int pageSize) {
        int totalPages = pageSize > 0 ? (int) Math.ceil((double) totalElements / pageSize) : 1;
        return new PageResponse<>(content, totalElements, totalPages, currentPage, pageSize);
    }
}
