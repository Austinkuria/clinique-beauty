import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import { supabase } from '../config/db.js';

// JWKS URL for Clerk
const CLERK_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0/zfo+c6xM3XsLB+D51T
YyyynDJauVrxEWK2NPMgQSY7zffIf/bgViZtO62HGEriZ57TDj27D7Y4A3HAUqiY
nXXp0JLhhb1yvzJESz0rQl27aeREt9jFZCvHa1bGkN915zzyLfZtWWQXtvXp0nlN
QZN82v6PnDLQmTl/tVOtpgG3d5miA9YWGYvUBa3wpQnP0mvKRSyvGz2bzceWNDpQ
TL/7nQG0YJRH6skK/SQEilGIHUpt8JqFURh7pvmz/pxCz0cCieb81JO0ae+Y2M7D
Qob8YtbWzzHeQrr+fQoVq5GdHhII8dyV1kViUnTqV6r46iIkActS9GAA8u0rUx9Z
9QIDAQAB
-----END PUBLIC KEY-----`;

export const clerkMiddleware = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        res.status(401);
        throw new Error('No token provided');
    }

    try {
        // Verify the Clerk JWT using the public key
        const decoded = jwt.verify(token, CLERK_PUBLIC_KEY, {
            algorithms: ['RS256']
        });

        // Extract user info from the Clerk token
        const userId = decoded.sub;
        const email = decoded.email || '';

        // Look for the user in your database
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('clerk_id', userId)
            .single();

        if (error || !user) {
            // User doesn't exist yet, create them
            const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert({
                    clerk_id: userId,
                    email: email,
                    name: decoded.name || email.split('@')[0] || 'User',
                    role: 'customer'
                })
                .select()
                .single();

            if (createError) {
                console.error('Failed to create user profile:', createError);
                res.status(500);
                throw new Error('Failed to create user profile');
            }

            req.user = newUser;
        } else {
            req.user = user;
        }

        next();
    } catch (error) {
        console.error('Auth error:', error.message);
        res.status(401);
        throw new Error('Invalid token');
    }
});
