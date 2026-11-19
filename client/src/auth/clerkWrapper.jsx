// client/src/auth/clerkWrapper.jsx
// Resilient authentication wrapper supporting both live Clerk and zero-key guest/demo mode

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    Stack,
    Alert
} from '@mui/material';
import * as RealClerk from '../../node_modules/@clerk/clerk-react/dist/index.mjs';

const rawKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
export const isClerkEnabled = typeof rawKey === 'string' &&
    rawKey.trim().length > 0 &&
    (rawKey.startsWith('pk_test_') || rawKey.startsWith('pk_live_'));

const FallbackAuthContext = createContext({
    user: null,
    isSignedIn: false,
    isLoaded: true,
    setUser: () => {}
});

const DEMO_PROFILES = {
    customer: {
        id: 'user_demo_customer_01',
        fullName: 'Demo Customer',
        firstName: 'Demo',
        lastName: 'Customer',
        imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
        primaryEmailAddress: { emailAddress: 'customer@cliniquebeauty.local' },
        publicMetadata: { role: 'customer' }
    },
    seller: {
        id: 'user_demo_seller_01',
        fullName: 'Demo Seller',
        firstName: 'Demo',
        lastName: 'Seller',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
        primaryEmailAddress: { emailAddress: 'seller@cliniquebeauty.local' },
        publicMetadata: { role: 'seller' }
    },
    admin: {
        id: 'user_demo_admin_01',
        fullName: 'Demo Administrator',
        firstName: 'Demo',
        lastName: 'Administrator',
        imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
        primaryEmailAddress: { emailAddress: 'admin@cliniquebeauty.local' },
        publicMetadata: { role: 'admin' }
    }
};

function FallbackClerkProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('clinique_demo_user');
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    const handleSetUser = (nextUser) => {
        if (nextUser) {
            localStorage.setItem('clinique_demo_user', JSON.stringify(nextUser));
        } else {
            localStorage.removeItem('clinique_demo_user');
        }
        setUser(nextUser);
    };

    return (
        <FallbackAuthContext.Provider
            value={{
                user,
                isSignedIn: Boolean(user),
                isLoaded: true,
                setUser: handleSetUser
            }}
        >
            {children}
        </FallbackAuthContext.Provider>
    );
}

export function ClerkProvider(props) {
    if (isClerkEnabled) {
        return <RealClerk.ClerkProvider {...props} />;
    }
    return <FallbackClerkProvider>{props.children}</FallbackClerkProvider>;
}

export function useAuth() {
    if (isClerkEnabled) {
        return RealClerk.useAuth();
    }
    const { user, isSignedIn } = useContext(FallbackAuthContext);
    return {
        isLoaded: true,
        isSignedIn,
        userId: user?.id || null,
        sessionId: isSignedIn ? 'sess_demo_session' : null,
        actor: null,
        orgId: null,
        orgRole: null,
        orgSlug: null,
        signOut: async () => {
            localStorage.removeItem('clinique_demo_user');
            window.location.reload();
        },
        getToken: async () => (isSignedIn ? 'mock_dev_token' : null)
    };
}

export function useUser() {
    if (isClerkEnabled) {
        return RealClerk.useUser();
    }
    const { user, isSignedIn, isLoaded } = useContext(FallbackAuthContext);
    return {
        isLoaded,
        isSignedIn,
        user
    };
}

export function useClerk() {
    if (isClerkEnabled) {
        return RealClerk.useClerk();
    }
    const { user, isSignedIn, setUser } = useContext(FallbackAuthContext);
    return {
        loaded: true,
        user,
        session: isSignedIn
            ? {
                  id: 'sess_demo_session',
                  user,
                  getToken: async () => 'mock_dev_token'
              }
            : null,
        client: { sessions: [] },
        openSignIn: () => {
            window.location.href = '/auth/login';
        },
        openSignUp: () => {
            window.location.href = '/auth/register';
        },
        signOut: async () => {
            setUser(null);
            window.location.href = '/';
        }
    };
}

export function UserButton({ appearance, afterSignOutUrl = '/' }) {
    if (isClerkEnabled) {
        return <RealClerk.UserButton appearance={appearance} afterSignOutUrl={afterSignOutUrl} />;
    }

    const { user, isSignedIn, setUser } = useContext(FallbackAuthContext);
    const [anchorEl, setAnchorEl] = useState(null);

    if (!isSignedIn || !user) {
        return null;
    }

    const handleOpen = (e) => setAnchorEl(e.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleSignOut = () => {
        handleClose();
        setUser(null);
        window.location.href = afterSignOutUrl;
    };

    return (
        <>
            <Avatar
                src={user.imageUrl}
                alt={user.fullName || 'User'}
                onClick={handleOpen}
                sx={{
                    width: 36,
                    height: 36,
                    cursor: 'pointer',
                    border: '2px solid #e0e0e0'
                }}
            />
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {user.fullName || 'Demo User'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {user.primaryEmailAddress?.emailAddress || 'demo@cliniquebeauty.local'}
                    </Typography>
                    <Typography variant="caption" display="block" color="primary.main" sx={{ mt: 0.5, fontWeight: 500 }}>
                        Role: {user.publicMetadata?.role || 'customer'}
                    </Typography>
                </Box>
                <Divider />
                <MenuItem onClick={handleSignOut}>
                    Sign Out
                </MenuItem>
            </Menu>
        </>
    );
}

export function SignIn() {
    if (isClerkEnabled) {
        return <RealClerk.SignIn />;
    }

    const { setUser } = useContext(FallbackAuthContext);

    const handleSelectDemoUser = (role) => {
        const profile = DEMO_PROFILES[role] || DEMO_PROFILES.customer;
        setUser(profile);
        window.location.href = '/';
    };

    return (
        <Card sx={{ maxWidth: 460, mx: 'auto', my: 4, p: 2, boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
                <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                    Sign In
                </Typography>
                <Alert severity="info" sx={{ mb: 3 }}>
                    Clerk authentication is running in development fallback mode. Configure VITE_CLERK_PUBLISHABLE_KEY in client/.env for live Clerk auth.
                </Alert>

                <Typography variant="subtitle2" gutterBottom color="text.secondary">
                    Choose a demo profile to test role-based marketplace access:
                </Typography>

                <Stack spacing={1.5} sx={{ mt: 2 }}>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={() => handleSelectDemoUser('customer')}
                        sx={{ py: 1.2, textTransform: 'none' }}
                    >
                        Continue as Demo Customer
                    </Button>
                    <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => handleSelectDemoUser('seller')}
                        sx={{ py: 1.2, textTransform: 'none' }}
                    >
                        Sign in as Demo Seller
                    </Button>
                    <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => handleSelectDemoUser('admin')}
                        sx={{ py: 1.2, textTransform: 'none' }}
                    >
                        Sign in as Demo Administrator
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}

export function SignUp() {
    if (isClerkEnabled) {
        return <RealClerk.SignUp />;
    }
    return <SignIn />;
}

export function SignedIn({ children }) {
    if (isClerkEnabled) {
        return <RealClerk.SignedIn>{children}</RealClerk.SignedIn>;
    }
    const { isSignedIn } = useContext(FallbackAuthContext);
    return isSignedIn ? children : null;
}

export function SignedOut({ children }) {
    if (isClerkEnabled) {
        return <RealClerk.SignedOut>{children}</RealClerk.SignedOut>;
    }
    const { isSignedIn } = useContext(FallbackAuthContext);
    return !isSignedIn ? children : null;
}

export function SignInButton({ children, ...props }) {
    if (isClerkEnabled) {
        return <RealClerk.SignInButton {...props}>{children}</RealClerk.SignInButton>;
    }
    return (
        <Button
            onClick={() => {
                window.location.href = '/auth/login';
            }}
            {...props}
        >
            {children || 'Sign In'}
        </Button>
    );
}

export function ClerkLoaded({ children }) {
    if (isClerkEnabled) {
        return <RealClerk.ClerkLoaded>{children}</RealClerk.ClerkLoaded>;
    }
    return children;
}

export function ClerkLoading({ children }) {
    if (isClerkEnabled) {
        return <RealClerk.ClerkLoading>{children}</RealClerk.ClerkLoading>;
    }
    return null;
}

export * from '../../node_modules/@clerk/clerk-react/dist/index.mjs';
