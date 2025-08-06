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

                  <button
                     class="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
                     :disabled="!isValidEmail(state.email) || isLoading" @click="signInWithOtp">
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
const localePath = useLocalePath()

definePageMeta({
   layout: false,
});
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const hasRequestedOtp = ref(false);
const timerCountdown = ref(60);
const timerExpired = ref(false);
let timerInterval = null;
const isLoading = ref(false);
const errorMessage = ref(null);

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
   const { error } = await supabase.auth.signInWithOtp({
      email: state.email,
      options: {
         shouldCreateUser: false,
      }
   });
   if (error) {
      console.log(error);
      hasRequestedOtp.value = false;
      isLoading.value = false;
      errorMessage.value = $t('login.error.emailNotRegistered');
      return;
   }
   hasRequestedOtp.value = true;
   isLoading.value = false;
   errorMessage.value = null;
   startTimer();
};

const verifyOtp = async () => {
   isLoading.value = true;
   const { error } = await supabase.auth.verifyOtp({
      email: state.email,
      token: state2.otp,
      type: "email",
   });
   if (error) {
      console.log(error);
      isLoading.value = false;
      errorMessage.value = error.message;
      return;
   }
};

const resendOtp = async () => {
   const { error } = await supabase.auth.signInWithOtp({
      email: state.email
   });
   if (error) {
      console.error(error);
      errorMessage.value = error.message;
      return;
   }
   startTimer();
};

onMounted(() => {
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
         await navigateTo("/");
      }
   },
   { immediate: true }
);

onUnmounted(() => {
   clearInterval(timerInterval);
});
</script>