import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import { supabase } from '../config/db.js';

// JWKS URL for Clerk - Consider fetching dynamically or using env var for flexibility
// You can get this from Clerk Dashboard -> API Keys -> Advanced -> JWT Public Key
// Or use process.env.CLERK_JWT_KEY if set
const CLERK_PUBLIC_KEY = process.env.CLERK_JWT_KEY || `-----BEGIN PUBLIC KEY-----
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

    if (!CLERK_PUBLIC_KEY) {
        console.error("FATAL ERROR: CLERK_JWT_KEY environment variable or hardcoded public key is missing.");
        res.status(500);
        throw new Error('Server configuration error: Missing JWT verification key.');
    }

    try {
        // Verify the Clerk JWT using the public key
        const decoded = jwt.verify(token, CLERK_PUBLIC_KEY, {
            algorithms: ['RS256']
        });

        // Extract user info from the Clerk token
        const clerkUserId = decoded.sub; // Clerk's user ID
        const email = decoded.email || (decoded.primary_email_address ? decoded.primary_email_address.email_address : ''); // Adjust based on your token claims
        const name = decoded.name || decoded.full_name || decoded.first_name || email.split('@')[0] || 'User'; // Get name from claims

        if (!clerkUserId) {
            throw new Error('Clerk User ID (sub) not found in token');
        }

        // Look for the user in your database using clerk_id
        const { data: user, error: findError } = await supabase
            .from('users')
            .select('*') // Select all columns to attach to req.user
            .eq('clerk_id', clerkUserId)
            .single();

        if (findError && findError.code !== 'PGRST116') { // PGRST116 = row not found
            console.error('Error finding user by clerk_id:', findError);
            res.status(500);
            throw new Error('Database error while finding user');
        }

        if (!user) {
            // User doesn't exist yet, create them
            console.log(`User with clerk_id ${clerkUserId} not found. Creating...`);
            const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert({
                    clerk_id: clerkUserId,
                    email: email,
                    name: name, // Use name extracted from token
                    role: 'customer' // Default role
                })
                .select()
                .single();

            if (createError) {
                console.error('Failed to create user profile:', createError);
                res.status(500);
                throw new Error('Failed to create user profile');
            }
            console.log(`User created with ID: ${newUser.id}`);
            req.user = newUser; // Attach the newly created user object (including your DB ID)
        } else {
            // User found, attach their data (including your DB ID)
            req.user = user;
        }

        // Crucially, ensure req.user contains the ID from *your* users table
        if (!req.user || !req.user.id) {
            console.error('Middleware failed to attach valid user object to request:', req.user);
            res.status(500);
            throw new Error('Internal server error: User context missing');
        }

        next();
    } catch (error) {
        console.error('Auth error:', error.message);
        // Handle specific JWT errors
        if (error.name === 'JsonWebTokenError') {
            res.status(401);
            throw new Error('Invalid token format');
        } else if (error.name === 'TokenExpiredError') {
            res.status(401);
            throw new Error('Token expired');
        }
        res.status(401); // Default to 401 for other auth errors
        throw new Error(error.message || 'Authentication failed');
    }
});
