<!-- LoginPage.vue -->
<template>
   <div
      class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 font-inter relative">
      <!-- Background pattern overlay -->
      <div class="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-slate-500/5"></div>

      <!-- Main login container -->
      <div class="relative w-full max-w-md">
         <!-- Login card -->
         <div class="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
            <!-- Header section -->
            <div class="px-8 pt-8 pb-6 text-center">
               <div class="mb-6">
                  <img src="/logo.png" alt="Digital Ledgers" class="h-12 mx-auto mb-4 filter brightness-0 invert" />
               </div>
               <h1 class="text-2xl font-bold text-white mb-2">{{ $t('login.title') }}</h1>
               <p class="text-blue-200/80 text-sm">{{ $t('login.subtitle') }}</p>
            </div>

            <!-- Form section -->
            <div class="px-8 pb-8">
               <!-- Email input phase -->
               <div v-if="!hasRequestedOtp" class="space-y-6">
                  <div class="space-y-2">
                     <label class="block text-sm font-medium text-blue-200/90">
                        Email Address
                     </label>
                     <div class="relative">
                        <input type="email" :placeholder="$t('login.email.placeholder')" v-model="state.email"
                           class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all duration-200" />
                        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                           <svg class="h-5 w-5 text-blue-200/50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                              fill="currentColor">
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                           </svg>
                        </div>
                     </div>
                     <p v-if="errorMessage" class="text-red-400 text-xs mt-1 flex items-center">
                        <svg class="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                           <path fill-rule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clip-rule="evenodd" />
                        </svg>
                        {{ errorMessage }}
                     </p>
                  </div>

                  <!-- Cloudflare Turnstile CAPTCHA -->
                  <div class="space-y-2">
                     <div id="turnstile-widget" class="flex justify-center"></div>
                     <div v-if="captchaError" class="space-y-2">
                        <p class="text-red-400 text-xs mt-1 flex items-center">
                           <svg class="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fill-rule="evenodd"
                                 d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                 clip-rule="evenodd" />
                           </svg>
                           {{ captchaError }}
                        </p>
                        <button @click="refreshCaptcha"
                           class="text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors duration-200 underline underline-offset-2 flex items-center space-x-1">
                           <svg class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                              <path fill-rule="evenodd"
                                 d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                                 clip-rule="evenodd" />
                           </svg>
                           <span>Refresh CAPTCHA</span>
                        </button>
                     </div>
                  </div>

                  <button
                     class="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
                     :disabled="!isValidEmail(state.email) || isLoading || !captchaToken" @click="signInWithOtp">
                     <span v-if="isLoading"
                        class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                     <span>{{ $t('login.buttons.sendOtp') }}</span>
                  </button>
               </div>

               <!-- OTP verification phase -->
               <div v-else class="space-y-6">
                  <div class="space-y-2">
                     <label class="block text-sm font-medium text-blue-200/90">
                        Verification Code
                     </label>
                     <div class="relative">
                        <input type="text" :placeholder="$t('login.otp.placeholder')" v-model="state2.otp"
                           class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all duration-200 text-center text-lg tracking-widest"
                           maxlength="6" />
                        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                           <svg class="h-5 w-5 text-blue-200/50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                              fill="currentColor">
                              <path fill-rule="evenodd"
                                 d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                 clip-rule="evenodd" />
                           </svg>
                        </div>
                     </div>
                     <p v-if="errorMessage" class="text-red-400 text-xs mt-1 flex items-center">
                        <svg class="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                           <path fill-rule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clip-rule="evenodd" />
                        </svg>
                        {{ errorMessage }}
                     </p>
                  </div>

                  <!-- Timer/Resend section -->
                  <div class="text-center">
                     <div v-if="!timerExpired"
                        class="text-blue-200/70 text-sm flex items-center justify-center space-x-2">
                        <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                           <path fill-rule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                              clip-rule="evenodd" />
                        </svg>
                        <span>{{ $t('login.otp.resend.timer', { count: timerCountdown }) }}</span>
                     </div>
                     <button v-else
                        class="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors duration-200 underline underline-offset-2"
                        @click="resendOtp">
                        {{ $t('login.otp.resend.button') }}
                     </button>
                  </div>

                  <button
                     class="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
                     :disabled="!isValidOtp(state2.otp) || isLoading" @click="verifyOtp">
                     <span v-if="isLoading"
                        class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                     <span>{{ $t('login.buttons.verifyOtp') }}</span>
                  </button>
               </div>
            </div>

            <!-- Footer section -->
            <div class="px-8 py-6 bg-white/5 border-t border-white/10">
               <p class="text-center text-sm text-blue-200/70">
                  {{ $t('login.signup.text') }}
               </p>
               <div class="text-center mt-2">
                  <NuxtLink :to="localePath('/apply')"
                     class="text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors duration-200 underline underline-offset-2">
                     {{ $t('login.signup.link') }}
                  </NuxtLink>
               </div>
            </div>
         </div>

         <!-- Security notice -->
         <div class="mt-6 text-center">
            <p class="text-blue-200/50 text-xs flex items-center justify-center space-x-2">
               <span>{{ $t('login.security.notice') }}</span>
            </p>
         </div>
      </div>
   </div>
</template>

<script setup>
import Joi from "joi";
const { t } = useI18n();
const localePath = useLocalePath()

definePageMeta({
   layout: false,
});
const supabase = useSupabaseClient();
let user = useSupabaseUser();
const hasRequestedOtp = ref(false);
const timerCountdown = ref(60);
const timerExpired = ref(false);
let timerInterval = null;
const isLoading = ref(false);
const errorMessage = ref(null);
const captchaToken = ref(null);
const captchaError = ref(null);
const captchaEnabled = ref(false);
let turnstileWidget = null;
const captchaRetryCount = ref(0);
const maxCaptchaRetries = 3;

const schema = Joi.object({
   email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
         "string.email": `"email" must be a valid email address`,
      }),
});

const schema2 = Joi.object({
   otp: Joi.string()
      .length(6)
      .pattern(/^[0-9]+$/)
      .required()
      .messages({
         "string.length": `"otp" must be exactly 6 digits`,
         "string.pattern.base": `"otp" must contain only digits`,
      }),
});

const state = reactive({
   email: undefined,
});

const state2 = reactive({
   otp: undefined,
});

const startTimer = () => {
   timerExpired.value = false;
   timerCountdown.value = 60;
   timerInterval = setInterval(() => {
      if (timerCountdown.value > 0) {
         timerCountdown.value--;
      } else {
         clearInterval(timerInterval);
         timerExpired.value = true;
      }
   }, 1000);
};

const isValidEmail = (email) => {
   const { error } = schema.validate({ email });
   return !error;
};

const isValidOtp = (otp) => {
   const { error } = schema2.validate({ otp });
   return !error;
};

const signInWithOtp = async () => {
   isLoading.value = true;
   captchaError.value = null;
   errorMessage.value = null;

   if (!captchaToken.value) {
      captchaError.value = 'Please complete the CAPTCHA verification';
      isLoading.value = false;
      return;
   }

   try {
      const { data, error } = await $fetch('/api/auth/send-otp', {
         method: 'POST',
         body: {
            email: state.email,
            captchaToken: captchaToken.value
         }
      });

      if (error) {
         throw new Error(error);
      }

      hasRequestedOtp.value = true;
      isLoading.value = false;
      errorMessage.value = null;
      captchaError.value = null;
      startTimer();

      // Reset CAPTCHA for potential resend
      resetCaptcha();
   } catch (error) {
      console.log(error);
      hasRequestedOtp.value = false;
      isLoading.value = false;

      // Handle different error types
      if (error.statusCode === 404) {
         errorMessage.value = t('login.error.emailNotRegistered');
      } else if (error.statusCode === 400 && error.data?.message?.includes('captcha')) {
         captchaError.value = 'CAPTCHA verification failed. Please try again.';
         resetCaptcha(); // Reset CAPTCHA on verification failure
      } else {
         errorMessage.value = t('login.error.emailNotRegistered');
      }
   }
};

const verifyOtp = async () => {
   isLoading.value = true;
   try {
      const response = await $fetch('/api/auth/verify-otp', {
         method: 'POST',
         body: {
            email: state.email,
            otp: state2.otp
         }
      });

      if (response.error) {
         throw new Error(response.error);
      }

      // Set the session on the frontend Supabase client
      if (response.session) {
         const { error: sessionError } = await supabase.auth.setSession({
            access_token: response.session.access_token,
            refresh_token: response.session.refresh_token
         });

         if (sessionError) {
            throw new Error(sessionError.message);
         }
         user = useSupabaseUser();
      }

      isLoading.value = false;
      errorMessage.value = null;

      // Navigation will be handled by the user watcher
   } catch (error) {
      console.log(error);
      isLoading.value = false;
      errorMessage.value = error.data?.statusMessage || error.message || 'Invalid OTP code';
   }
};

const resendOtp = async () => {
   if (!captchaToken.value) {
      captchaError.value = 'Please complete the CAPTCHA verification';
      return;
   }

   errorMessage.value = null;
   captchaError.value = null;

   try {
      const { data, error } = await $fetch('/api/auth/send-otp', {
         method: 'POST',
         body: {
            email: state.email,
            captchaToken: captchaToken.value
         }
      });

      if (error) {
         throw new Error(error);
      }

      startTimer();
      resetCaptcha(); // Reset CAPTCHA after successful resend
   } catch (error) {
      console.error(error);
      if (error.statusCode === 400 && error.data?.message?.includes('captcha')) {
         captchaError.value = 'CAPTCHA verification failed. Please try again.';
         resetCaptcha(); // Reset CAPTCHA on verification failure
      } else {
         errorMessage.value = error.data?.statusMessage || error.message || 'Failed to resend OTP';
      }
   }
};

// Initialize Cloudflare Turnstile CAPTCHA
const initializeCaptcha = async () => {
   const config = useRuntimeConfig();

   if (!config.public.cloudflareSiteKey) {
      console.error('Cloudflare Turnstile site key is not configured');
      captchaError.value = 'CAPTCHA configuration error. Please contact support.';
      return;
   }

   // Clear any existing widget first
   if (turnstileWidget !== null && window.turnstile) {
      try {
         window.turnstile.remove(turnstileWidget);
      } catch (error) {
         console.warn('Failed to remove existing widget:', error);
      }
      turnstileWidget = null;
   }

   captchaEnabled.value = true;

   if (!window.turnstile) {
      console.warn('Turnstile not available, retrying...');
      if (captchaRetryCount.value < maxCaptchaRetries) {
         captchaRetryCount.value++;
         setTimeout(() => initializeCaptcha(), 500 * captchaRetryCount.value);
      } else {
         captchaError.value = 'Failed to load CAPTCHA. Please refresh the page.';
      }
      return;
   }

   // Wait for DOM element to be available with polling
   let retries = 0;
   const maxRetries = 20;

   const tryRender = () => {
      const container = document.getElementById('turnstile-widget');

      if (!container) {
         retries++;
         if (retries < maxRetries) {
            setTimeout(tryRender, 100);
            return;
         } else {
            console.error('Turnstile container element not found after retries');
            captchaError.value = 'CAPTCHA widget could not be loaded.';
            return;
         }
      }

      // Clear the container in case there's any leftover content
      container.innerHTML = '';

      try {
         turnstileWidget = window.turnstile.render(container, {
            sitekey: config.public.cloudflareSiteKey,
            callback: function (token) {
               console.log('CAPTCHA solved successfully');
               captchaToken.value = token;
               captchaError.value = null;
               captchaRetryCount.value = 0; // Reset retry count on success
            },
            'error-callback': function (error) {
               console.error('CAPTCHA error:', error);
               captchaToken.value = null;
               captchaError.value = 'CAPTCHA verification failed. Please try again.';

               // Auto-retry once on error
               if (captchaRetryCount.value < 1) {
                  captchaRetryCount.value++;
                  setTimeout(() => {
                     resetCaptcha();
                  }, 1000);
               }
            },
            'expired-callback': function () {
               console.log('CAPTCHA expired');
               captchaToken.value = null;
               captchaError.value = 'CAPTCHA expired. Please verify again.';
            },
            'timeout-callback': function () {
               console.log('CAPTCHA timeout');
               captchaToken.value = null;
               captchaError.value = 'CAPTCHA timed out. Please try again.';
            },
            theme: 'dark',
            size: 'normal',
            retry: 'auto',
            'retry-interval': 8000,
         });

         console.log('Turnstile widget rendered with ID:', turnstileWidget);
      } catch (error) {
         console.error('Failed to render Turnstile widget:', error);
         captchaError.value = 'Failed to initialize CAPTCHA. Please refresh the page.';
      }
   };

   tryRender();
};

// Reset CAPTCHA widget
const resetCaptcha = () => {
   captchaToken.value = null;
   captchaError.value = null;

   if (!window.turnstile) {
      console.warn('Turnstile not available for reset');
      return;
   }

   if (turnstileWidget !== null) {
      try {
         window.turnstile.reset(turnstileWidget);
         console.log('CAPTCHA reset successfully');
      } catch (error) {
         console.warn('Failed to reset CAPTCHA widget:', error);
         // Re-initialize if reset fails
         turnstileWidget = null;
         setTimeout(() => initializeCaptcha(), 500);
      }
   } else {
      // Widget doesn't exist, try to initialize
      setTimeout(() => initializeCaptcha(), 100);
   }
};

// Refresh CAPTCHA (complete re-initialization)
const refreshCaptcha = () => {
   captchaRetryCount.value = 0;
   if (turnstileWidget !== null && window.turnstile) {
      try {
         window.turnstile.remove(turnstileWidget);
      } catch (error) {
         console.warn('Failed to remove widget during refresh:', error);
      }
   }
   turnstileWidget = null;
   captchaToken.value = null;
   captchaError.value = null;

   setTimeout(() => initializeCaptcha(), 100);
};

// Load Cloudflare Turnstile script
const loadTurnstileScript = () => {
   // Check if script is already loaded and functional
   if (document.querySelector('script[src*="turnstile"]') && window.turnstile) {
      console.log('Turnstile script already loaded and available');
      setTimeout(initializeCaptcha, 100);
      return;
   }

   // Remove any existing script that might be broken
   const existingScript = document.querySelector('script[src*="turnstile"]');
   if (existingScript) {
      existingScript.remove();
   }

   const script = document.createElement('script');
   script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad';
   script.async = true;
   script.defer = true;

   // Create a global callback for when Turnstile loads
   window.onTurnstileLoad = () => {
      console.log('Turnstile script loaded via callback');
      setTimeout(initializeCaptcha, 200);
   };

   script.onload = () => {
      console.log('Turnstile script loaded via onload');
      // Fallback if the callback doesn't fire
      if (!window.turnstileLoadCallbackFired) {
         setTimeout(initializeCaptcha, 200);
      }
   };

   script.onerror = (error) => {
      console.error('Failed to load Cloudflare Turnstile script:', error);
      captchaError.value = 'Failed to load CAPTCHA. Please check your internet connection and refresh the page.';
   };

   document.head.appendChild(script);

   // Cleanup function for the global callback
   const cleanup = () => {
      if (window.onTurnstileLoad) {
         delete window.onTurnstileLoad;
      }
   };

   // Set a timeout to clean up if the script doesn't load
   setTimeout(cleanup, 10000);
};

onMounted(() => {
   // Load Cloudflare Turnstile CAPTCHA
   loadTurnstileScript();

   if (window.Telegram) {
      console.log('Telegram WebApp detected: LOGIN')
      Telegram.WebApp.expand();
      Telegram.WebApp.onExpand = () => {
         console.log('Application is in fullscreen mode');
      };
   }
});



watch(
   user,
   async () => {
      if (user.value) {
         // Check MFA status before redirecting
         try {
            const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

            if (error) {
               console.error('Error checking MFA status:', error)
               await navigateTo("/")
               return
            }

            // If user doesn't have MFA enrolled, redirect to enrollment
            if (data.currentLevel === 'aal1' && data.nextLevel === 'aal1') {
               await navigateTo("/mfa-enroll")
               return
            }

            // If user has MFA enrolled but needs to verify it
            if (data.currentLevel === 'aal1' && data.nextLevel === 'aal2') {
               await navigateTo("/mfa-verify")
               return
            }

            // User has completed MFA or already verified, go to dashboard
            await navigateTo("/")

         } catch (error) {
            console.error('MFA check error:', error)
            await navigateTo("/")
         }
      }
   },
   { immediate: true }
);

onUnmounted(() => {
   clearInterval(timerInterval);

   // Clean up CAPTCHA widget
   if (turnstileWidget !== null && window.turnstile) {
      try {
         window.turnstile.remove(turnstileWidget);
      } catch (error) {
         console.warn('Failed to remove CAPTCHA widget on unmount:', error);
      }
   }

   // Clean up global callback
   if (window.onTurnstileLoad) {
      delete window.onTurnstileLoad;
   }
});
</script>