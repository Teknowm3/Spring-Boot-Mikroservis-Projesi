// Utility for making authenticated fetch requests
// Replaces Axios as requested

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const fetchWithAuth = async (endpoint, options = {}) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = user?.token;

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers,
    };

    try {
        const fullUrl = `${BASE_URL}${endpoint}`;
        console.log(`[fetchWithAuth] Requesting: ${fullUrl}`);
        const response = await fetch(fullUrl, config);

        // Handle 401 Unauthorized
        if (response.status === 401) {
            // Optional: Trigger logout or redirect
            console.warn('Unauthorized access. Token might be invalid/expired.');
            // We might want to clear local storage here if we want to force logout
        }

        // Check if response is OK
        if (!response.ok) {
            // Try to parse error message
            let errorMessage = 'Something went wrong';
            try {
                // Read text once to avoid "body stream already read" error
                const errorText = await response.text();
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorMessage;
                } catch {
                    // Not a JSON response, use the text directly
                    errorMessage = errorText || errorMessage;
                }
            } catch (e) {
                // Failed to read text (network error etc)
                console.error("Failed to read error response body", e);
            }

            const error = new Error(errorMessage || `Request failed with status ${response.status}`);
            error.status = response.status;
            throw error;
        }

        // Parse JSON if content type is json
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return await response.json();
        } else {
            return await response.text();
        }

    } catch (error) {
        console.error('API Request Failed:', error);
        throw error;
    }
};
