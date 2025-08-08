<template>
   <div class="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div class="card w-full max-w-md bg-base-100 shadow-xl">
         <div class="card-body">
            <h2 class="card-title text-center mb-6">
               <Icon name="material-symbols:verified-user" class="mr-2" />
               Two-Factor Authentication
            </h2>

            <div class="text-center mb-6">
               <Icon name="material-symbols:smartphone" class="text-4xl text-primary mb-2" />
               <p class="text-sm text-base-content/70">
                  Please enter the 6-digit code from your authenticator app
               </p>
            </div>

            <div class="form-control">
               <label class="label">
                  <span class="label-text">Authentication Code:</span>
               </label>
               <input v-model="verificationCode" type="text" placeholder="000000"
                  class="input input-bordered text-center text-xl tracking-widest" maxlength="6" pattern="[0-9]*"
                  inputmode="numeric" @input="handleCodeInput" :disabled="isLoading" autofocus />
            </div>

            <div v-if="error" class="alert alert-error mt-4">
               <Icon name="material-symbols:error" />
               <span>{{ error }}</span>
            </div>

            <div class="card-actions justify-between mt-6">
               <button @click="signOut" class="btn btn-ghost" :disabled="isLoading">
                  <Icon name="material-symbols:logout" />
                  Sign Out
               </button>
               <button @click="verifyCode" class="btn btn-primary"
                  :disabled="verificationCode.length !== 6 || isLoading" :class="{ 'loading': isLoading }">
                  <Icon v-if="!isLoading" name="material-symbols:verified" />
                  Verify
               </button>
            </div>

            <div class="divider text-sm">Trouble with your code?</div>

            <div class="text-center">
               <button @click="showRecoveryHelp = !showRecoveryHelp" class="btn btn-ghost btn-sm">
                  <Icon name="material-symbols:help" />
                  Recovery Options
               </button>
            </div>

            <div v-if="showRecoveryHelp" class="alert alert-info mt-4">
               <Icon name="material-symbols:info" />
               <div class="text-sm">
                  <p class="font-semibold mb-2">If you can't access your authenticator app:</p>
                  <ul class="list-disc list-inside space-y-1">
                     <li>Make sure your device's time is correct</li>
                     <li>Try generating a new code</li>
                     <li>Contact support if you've lost access to your device</li>
                  </ul>
               </div>
            </div>
         </div>
      </div>
   </div>
</template>

<script setup>
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Reactive state
const verificationCode = ref('')
const isLoading = ref(false)
const error = ref('')
const showRecoveryHelp = ref(false)
const factorId = ref('')

// Page meta
definePageMeta({
   layout: false,
   middleware: []  // Skip middleware for this page
})

// Initialize on mount
onMounted(async () => {
   if (!user.value) {
      await navigateTo('/login')
      return
   }

   await loadMFAFactors()
})

const loadMFAFactors = async () => {
   try {
      const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors()

      if (factorsError) {
         throw factorsError
      }

      console.log('Available MFA factors:', factors)

      const totpFactor = factors.totp?.[0]
      if (!totpFactor) {
         console.log('No TOTP factors found, redirecting to enrollment')
         // No TOTP factors found, redirect to enrollment
         await navigateTo('/mfa-enroll')
         return
      }

      console.log('Found TOTP factor:', totpFactor)
      factorId.value = totpFactor.id

   } catch (err) {
      console.error('Error loading MFA factors:', err)
      error.value = 'Failed to load MFA factors'
   }
}

const handleCodeInput = (event) => {
   // Only allow numeric input
   verificationCode.value = event.target.value.replace(/\D/g, '').slice(0, 6)
}

const verifyCode = async () => {
   if (!factorId.value || verificationCode.value.length !== 6) {
      return
   }

   isLoading.value = true
   error.value = ''

   try {
      // Create challenge
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
         factorId: factorId.value
      })

      if (challengeError) {
         throw challengeError
      }

      // Verify the code
      const { error: verifyError } = await supabase.auth.mfa.verify({
         factorId: factorId.value,
         challengeId: challengeData.id,
         code: verificationCode.value,
      })

      if (verifyError) {
         throw verifyError
      }

      // Success! Redirect to dashboard
      await navigateTo('/')

   } catch (err) {
      console.error('MFA verification error:', err)
      error.value = err.message || 'Invalid verification code. Please try again.'
      verificationCode.value = ''
   } finally {
      isLoading.value = false
   }
}

const signOut = async () => {
   try {
      const { error } = await supabase.auth.signOut()
      if (error) {
         console.error('Sign out error:', error)
      }
      await navigateTo('/login')
   } catch (err) {
      console.error('Sign out error:', err)
      await navigateTo('/login')
   }
}
</script>