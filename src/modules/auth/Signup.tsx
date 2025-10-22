import { useAuth } from '@/components/AuthProvider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCustomMutation } from '@/hooks/useTanstackQuery';
import { useToast } from '@/hooks/useToast';
import { signupFormSchema, type SignupFormData } from '@/models/auth/auth.model';
import { authKeys, authService, type SignupResponse } from '@/services/auth/authService';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Eye, EyeOff, GalleryVerticalEnd, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { setToken } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupFormSchema),
  });

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');

  // Signup mutation with comprehensive error handling
  const signupMutation = useCustomMutation<SignupResponse, SignupFormData>(
    async (data: SignupFormData) => {
      const response = await authService.signup({
        email: data.email,
        password: data.password,
      });
      return response;
    },
    {
      mutationKey: [authKeys.LOGIN],
      onSuccess: (data: SignupResponse) => {
        toast({
          title: "Account created successfully",
          description: data.message || "Please check your email to verify your account.",
          variant: "default",
        });
        reset();
        navigate('/signin');
      },
      onError: (error) => {
        console.error('Signup error:', error);
        // Show error toast
        toast({
          title: "Signup failed",
          description: 'An unexpected error occurred. Please try again.',
          variant: "destructive",
        });
      },
      retry: false,
    }
  );

  const onSubmit = async (data: SignupFormData) => {
    try {
      await signupMutation.mutateAsync(data);
    } catch (error) {
      // Error is already handled in onError callback
      console.error('Signup submission error:', error);
    }
  };

  const handleMicrosoftSignup = () => {
    // TODO: Implement Microsoft OAuth
    toast({
      title: "Microsoft Signup",
      description: "Microsoft authentication will be available soon.",
      variant: "default",
    });
  };

  return (
    <div className='flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-almond-100 via-cambridge-blue-50 to-tropical-indigo-100 dark:from-tropical-indigo-950 dark:via-cambridge-blue-950 dark:to-puce-950 px-4 py-8 sm:px-6 lg:px-8 relative overflow-hidden'>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-tropical-indigo-400 dark:bg-tropical-indigo-600 rounded-full opacity-20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cambridge-blue-400 dark:bg-cambridge-blue-600 rounded-full opacity-20 blur-3xl animate-pulse delay-1000" />
      </div>

      <div className='bg-card/80 border-tropical-indigo-200 dark:border-tropical-indigo-800 animate-fade-in mx-auto flex w-full max-w-md flex-col items-center justify-center rounded-2xl border-2 p-8 shadow-2xl backdrop-blur-md relative z-10'>
        <div className='mb-8 flex justify-center gap-3 sm:justify-start'>
          <a
            href='/'
            className='group flex items-center gap-3 font-semibold transition-colors hover:opacity-80'
          >
            <div className='bg-gradient-to-r from-tropical-indigo-600 to-cambridge-blue-600 hover:from-tropical-indigo-700 hover:to-cambridge-blue-700 dark:from-tropical-indigo-500 dark:to-cambridge-blue-500 flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300'>
              <GalleryVerticalEnd className='h-6 w-6' />
            </div>
            <span className='text-xl tracking-tight sm:text-2xl text-foreground'>
              {import.meta.env.VITE_APPLICATION_NAME || 'HTML2PDF'}
            </span>
          </a>
        </div>
        
        <div className='w-full'>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className='flex flex-col gap-6'
          >
            <div className='flex flex-col items-center gap-2 text-center'>
              <h1 className='text-2xl font-bold'>Create an account</h1>
              <p className='text-muted-foreground text-sm text-balance'>
                Enter your email below to create your account
              </p>
            </div>

            {/* Global Error Alert */}
            {signupMutation.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {(signupMutation.error as ApiError)?.response?.data?.message || 
                   (signupMutation.error as ApiError)?.message || 
                   'An unexpected error occurred. Please try again.'}
                </AlertDescription>
              </Alert>
            )}

            <div className='grid gap-6'>
              <div className='grid gap-3'>
                <Label htmlFor='email'>
                  Email <span className='text-destructive'>*</span>
                </Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='Enter your email'
                  disabled={signupMutation.isPending}
                  {...register('email', {
                    required: 'Email is required',
                  })}
                />
                {errors.email && (
                  <span className='text-destructive text-sm'>
                    {errors.email.message}
                  </span>
                )}
              </div>
              
              <div className='grid gap-3'>
                <Label htmlFor='password'>
                  Password <span className='text-destructive'>*</span>
                </Label>
                <div className='relative'>
                  <Input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    placeholder='Create a strong password'
                    disabled={signupMutation.isPending}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                    className='pr-10'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={signupMutation.isPending}
                    className='text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transform transition-colors disabled:opacity-50'
                  >
                    {showPassword ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <span className='text-destructive text-sm'>
                    {errors.password.message}
                  </span>
                )}
              </div>

              <div className='grid gap-3'>
                <Label htmlFor='confirmPassword'>
                  Confirm Password <span className='text-destructive'>*</span>
                </Label>
                <div className='relative'>
                  <Input
                    id='confirmPassword'
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder='Confirm your password'
                    disabled={signupMutation.isPending}
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                    })}
                    className='pr-10'
                  />
                  <button
                    type='button'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={signupMutation.isPending}
                    className='text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transform transition-colors disabled:opacity-50'
                  >
                    {showConfirmPassword ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className='text-destructive text-sm'>
                    {errors.confirmPassword.message}
                  </span>
                )}
                {password &&
                  confirmPassword &&
                  password !== confirmPassword && (
                    <span className='text-destructive text-sm'>
                      Passwords do not match
                    </span>
                  )}
              </div>
              
              <Button
                type='submit'
                className='bg-gradient-to-r from-tropical-indigo-600 to-cambridge-blue-600 hover:from-tropical-indigo-700 hover:to-cambridge-blue-700 dark:from-tropical-indigo-500 dark:to-cambridge-blue-500 dark:hover:from-tropical-indigo-600 dark:hover:to-cambridge-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer w-full disabled:opacity-50 disabled:cursor-not-allowed'
                disabled={signupMutation.isPending}
              >
                {signupMutation.isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
              
              <div className='after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t'>
                <span className='bg-background text-muted-foreground relative z-10 px-2'>
                  Or continue with
                </span>
              </div>
              
              <Button 
                type='button'
                variant='outline' 
                className='w-full'
                onClick={handleMicrosoftSignup}
                disabled={signupMutation.isPending}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='16'
                  height='16'
                  viewBox='0 0 23 23'
                  className='mr-2'
                >
                  <path fill='#f35325' d='M1 1h10v10H1z' />
                  <path fill='#81bc06' d='M12 1h10v10H12z' />
                  <path fill='#05a6f0' d='M1 12h10v10H1z' />
                  <path fill='#ffba08' d='M12 12h10v10H12z' />
                </svg>
                Sign up with Microsoft Account
              </Button>
            </div>
            
            <div className='text-center text-sm'>
              Already have an account?{' '}
              <a 
                href='/signin' 
                className='font-semibold text-tropical-indigo-700 dark:text-tropical-indigo-400 hover:text-cambridge-blue-700 dark:hover:text-cambridge-blue-400 transition-colors underline-offset-4 hover:underline'
              >
                Sign in
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}