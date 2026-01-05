import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';

/**
 * Custom hook để fetch data từ API
 * @param {string} url - API endpoint
 * @param {object} options - Options { immediate: boolean }
 */
const useFetch = (url, options = { immediate: true }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.get(url, { params });
            setData(response);
            return response;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Đã xảy ra lỗi';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [url]);

    useEffect(() => {
        if (options.immediate) {
            fetchData();
        }
    }, [options.immediate, fetchData]);

    const refetch = useCallback((params) => {
        return fetchData(params);
    }, [fetchData]);

    return { data, loading, error, refetch };
};

export default useFetch;
