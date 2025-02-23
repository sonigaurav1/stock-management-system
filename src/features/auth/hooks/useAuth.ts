import { useState } from 'react';
import { signIn, signOut } from 'next-auth/react';
import { toast } from 'sonner';

export const useAuth = () => {
    const [loading, setLoading] = useState(false);

    const handleSignIn = async (email: string, password: string, callbackUrl: string) => {
        setLoading(true);
        try {
            const result = await signIn('credentials', {
                email,
                password,
                callbackUrl
            });
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success('Signed In Successfully!');
            }
        } catch (error) {
            toast.error('An error occurred during sign-in.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        setLoading(true);
        try {
            await signOut();
            toast.success('Signed Out Successfully!');
        } catch (error) {
            toast.error('An error occurred during sign-out.');
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        handleSignIn,
        handleSignOut
    };
};
