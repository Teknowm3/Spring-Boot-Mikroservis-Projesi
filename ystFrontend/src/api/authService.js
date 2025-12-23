import { fetchWithAuth } from './fetchClient';

export const loginUser = async (username, password) => {
    // Assuming the backend expects { username, password }
    return await fetchWithAuth('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    });
};

export const registerUser = async (userDataOrUsername, email, password) => {
    let body;
    if (typeof userDataOrUsername === 'object') {
        body = JSON.stringify(userDataOrUsername);
    } else {
        body = JSON.stringify({ username: userDataOrUsername, email, password });
    }

    return await fetchWithAuth('/auth/register', {
        method: 'POST',
        body: body,
    });
};
