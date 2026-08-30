import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    // A user blob without a token is a stale or hand-edited localStorage entry.
    if (!userStr || !token) {
        return <Navigate to="/auth" replace />;
    }

    let user;
    try {
        user = JSON.parse(userStr);
    } catch {
        return <Navigate to="/auth" replace />;
    }

    if (!user?.role) {
        return <Navigate to="/auth" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to their appropriate dashboard if they try to access unauthorized route
        if (user.role === 'NGO') return <Navigate to="/ngo-dashboard" replace />;
        if (user.role === 'DONOR') return <Navigate to="/donor-dashboard" replace />;
        if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
