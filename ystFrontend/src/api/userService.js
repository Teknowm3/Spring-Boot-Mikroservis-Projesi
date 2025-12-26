import { fetchWithAuth } from './fetchClient';

export const getUsers = async () => {
    return await fetchWithAuth('/users');
};

export const getMe = async () => {
    return await fetchWithAuth('/users/me');
};

export const createUser = async (user) => {
    // Ensure we send exactly what is required or the full object if backend supports it.
    // User requested specifically: { username, password, email, role } to be sent to /auth/users
    // We can filter the user object or just send it all if the backend ignores extras.
    // Creating a clean payload based on user request:
    const payload = {
        username: user.username,
        password: user.password,
        email: user.email,
        role: user.role
    };

    return await fetchWithAuth('/auth/users', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
};

export const updateUser = async (id, user) => {
    return await fetchWithAuth(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(user),
    });
};

export const updateUserRole = async (username, role) => {
    return await fetchWithAuth(`/auth/users/${username}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: role })
    });
};

export const deleteUser = async (username) => {
    return await fetchWithAuth(`/auth/users/${username}`, {
        method: 'DELETE',
    });
};
