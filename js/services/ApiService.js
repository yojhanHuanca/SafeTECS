// js/services/ApiService.js
const API_BASE_URL = 'http://localhost:3001/api'; // Ensure this matches your backend

async function request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    // Retrieve token from localStorage if it exists
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const token = user ? user.token : null; // Assuming token is stored within currentUser object

    const defaultHeaders = {
        'Content-Type': 'application/json',
    };
    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        headers: {
            ...defaultHeaders,
            ...options.headers, // Allow overriding default headers or adding new ones
        },
        ...options, // Spread other options like method, body
    };

    try {
        const response = await fetch(url, config);

        // Try to parse JSON, even for errors, as the body might contain error details
        let responseData;
        try {
            responseData = await response.json();
        } catch (e) {
            // If response is not JSON (e.g. plain text error, or empty)
            if (!response.ok) { // If it's an HTTP error but not JSON
                 throw { status: response.status, data: { message: response.statusText || 'Server error without JSON body' } };
            }
            responseData = {}; // If response.ok but no JSON body (e.g. 204 No Content)
        }

        if (!response.ok) {
            // Use error message from responseData if available, otherwise default
            const errorMessage = responseData.error || responseData.message || `Error ${response.status}`;
            throw { status: response.status, data: responseData, message: errorMessage };
        }

        return responseData;

    } catch (error) {
        // Handle network errors or errors thrown from the try block
        // console.error('ApiService request error:', error);
        // Re-throw a consistent error structure or the original error
        // If it's already in the {status, data, message} structure, rethrow it
        if (error.status !== undefined) {
            throw error;
        }
        // For generic network errors (fetch itself failed)
        throw { status: 0, data: {}, message: error.message || 'Network error or request failed' };
    }
}

export const ApiService = {
    get: (endpoint, params = null) => {
        let url = endpoint;
        if (params) {
            const queryParams = new URLSearchParams(params);
            url += `?${queryParams.toString()}`;
        }
        return request(url);
    },
    post: (endpoint, data) => request(endpoint, { method: 'POST', body: JSON.stringify(data) }),
    put: (endpoint, data) => request(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};

// Example usage (commented out):
// ApiService.get('/users')
//   .then(data => console.log(data))
//   .catch(error => console.error('Error fetching users:', error.status, error.message, error.data));

// ApiService.post('/users', { name: 'John Doe' })
//   .then(data => console.log(data))
//   .catch(error => console.error('Error creating user:', error.status, error.message, error.data));
