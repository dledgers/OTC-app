<template>
   <div class="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div class="card w-full max-w-md bg-base-100 shadow-xl">
         <div class="card-body">
            <h2 class="card-title text-center mb-6">
               <Icon name="material-symbols:security" class="mr-2" />
               Enable Two-Factor Authentication
            </h2>

            <div v-if="!factorId" class="text-center">
               <div class="loading loading-spinner loading-lg"></div>
               <p class="mt-4">Setting up MFA...</p>
            </div>

            <div v-else-if="!isVerified" class="space-y-6">
               <div class="text-center">
                  <p class="text-sm text-base-content/70 mb-4">
                     Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                  </p>

                  <!-- QR Code Display -->
                  <div class="flex justify-center mb-4">
                     <div class="bg-white p-4 rounded-lg">
                        <!-- Method 1: Direct SVG (Primary) -->
                        <div v-if="qrCodeSvg && !qrError" class="qr-code-container">
                           <img :src="qrCodeDataUrl" alt="MFA QR Code" class="qr-svg-wrapper" />
                        </div>

                        <!-- Method 2: Data URL (Fallback) -->
                        <img v-else-if="qrCodeDataUrl && !qrError" :src="qrCodeDataUrl" alt="MFA QR Code"
                           class="w-48 h-48" @error="handleQRError" @load="handleQRLoad" />

                        <!-- Fallback if both methods fail -->
                        <div v-else class="w-48 h-48 flex items-center justify-center text-sm text-gray-600">
                           <div class="text-center">
                              <Icon name="material-symbols:qr-code" class="text-4xl mb-2" />
                              <p>QR Code display issue</p>
                              <p class="text-xs">Use manual entry below</p>
                           </div>
                        </div>
                     </div>
                  </div>



                  <!-- Manual Entry Option -->
                  <div class="collapse collapse-arrow bg-base-200">
                     <input type="checkbox" />
                     <div class="collapse-title text-sm font-medium">
                        Can't scan? Enter manually
                     </div>
                     <div class="collapse-content">
                        <div class="form-control">
                           <label class="label">
                              <span class="label-text text-xs">Secret Key:</span>
                           </label>
                           <input type="text" :value="secretKey" readonly
                              class="input input-bordered input-sm text-xs font-mono" @click="$event.target.select()" />
                           <button @click="copySecret" class="btn btn-sm btn-ghost mt-2"
                              :class="{ 'btn-success': copied }">
                              <Icon :name="copied ? 'material-symbols:check' : 'material-symbols:content-copy'" />
                              {{ copied ? 'Copied!' : 'Copy Secret' }}
                           </button>
                        </div>


                     </div>
                  </div>
               </div>

               <!-- Verification Form -->
               <div class="form-control">
                  <label class="label">
                     <span class="label-text">Enter the 6-digit code from your app:</span>
                  </label>
                  <input v-model="verificationCode" type="text" placeholder="000000"
                     class="input input-bordered text-center text-lg tracking-widest" maxlength="6" pattern="[0-9]*"
                     inputmode="numeric" @input="handleCodeInput" :disabled="isLoading" />
               </div>

               <div v-if="error" class="alert alert-error">
                  <Icon name="material-symbols:error" />
                  <span>{{ error }}</span>
               </div>

               <div class="card-actions justify-between">
                  <button @click="goBack" class="btn btn-ghost" :disabled="isLoading">
                     <Icon name="material-symbols:arrow-back" />
                     Back
                  </button>
                  <button @click="verifyCode" class="btn btn-primary"
                     :disabled="verificationCode.length !== 6 || isLoading" :class="{ 'loading': isLoading }">
                     <Icon v-if="!isLoading" name="material-symbols:verified" />
                     Enable MFA
                  </button>
               </div>
            </div>

            <div v-else class="text-center space-y-4">
               <div class="text-success">
                  <Icon name="material-symbols:check-circle" class="text-4xl" />
               </div>
               <h3 class="text-lg font-semibold">MFA Successfully Enabled!</h3>
               <p class="text-sm text-base-content/70">
                  Your account is now protected with two-factor authentication.
               </p>
               <button @click="goToDashboard" class="btn btn-primary">
                  <Icon name="material-symbols:dashboard" />
                  Go to Dashboard
               </button>
            </div>
         </div>
      </div>
   </div>
</template>

<script setup>
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Reactive state
const factorId = ref('')
const qrCodeSvg = ref('')
const qrCodeDataUrl = ref('')
const secretKey = ref('')
const otpUri = ref('')
const verificationCode = ref('')
const isLoading = ref(false)
const isVerified = ref(false)
const error = ref('')
const copied = ref(false)

const qrError = ref(false)

// Page meta
definePageMeta({
   layout: false,
})

// Watch for user authentication state
watch(user, async (newUser) => {
   if (!newUser) {
      await navigateTo('/login')
   }
}, { immediate: true })

// Initialize MFA enrollment on component mount
onMounted(async () => {
   if (!user.value) {
      await navigateTo('/login')
      return
   }

   await startEnrollment()
})

const startEnrollment = async () => {
   try {
      error.value = ''

      // First, check if user already has factors enrolled
      const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors()

      if (factorsError) {
         throw factorsError
      }

      // Check for TOTP factors in both totp array and all array
      const totpFactors = [
         ...(factors.totp || []),
         ...(factors.all?.filter(f => f.factor_type === 'totp') || [])
      ]

      const existingTOTP = totpFactors[0]
      if (existingTOTP) {
         // Check if it's already verified
         if (existingTOTP.status === 'verified') {
            // User already has MFA set up, redirect to dashboard
            await navigateTo('/')
            return
         }

         // Factor exists but not verified - we need to reset it
         try {
            const { error: unenrollError } = await supabase.auth.mfa.unenroll({
               factorId: existingTOTP.id
            })

            if (unenrollError) {
               error.value = 'Unable to reset MFA setup. Please try signing out and back in.'
               return
            }
         } catch (unenrollErr) {
            error.value = 'Unable to reset MFA setup. Please try signing out and back in.'
            return
         }
      }

      // No existing factors, proceed with new enrollment
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
         factorType: 'totp',
      })

      if (enrollError) {
         // Handle the specific case where a factor already exists
         if (enrollError.message?.includes('already exists')) {
            error.value = 'You already have MFA partially set up. Please sign out and sign back in to restart the process.'
            return
         }
         throw enrollError
      }

      factorId.value = data.id



      // Store the QR code as received from Supabase (following their documentation)
      const qrCode = data.totp.qr_code

      // Store raw SVG for debug info
      qrCodeSvg.value = qrCode

      // Handle QR code display as per Supabase documentation
      if (qrCode.startsWith('data:')) {
         // Already a data URL, use as-is
         qrCodeDataUrl.value = qrCode
      } else {
         // Convert SVG to data URL as shown in Supabase docs
         qrCodeDataUrl.value = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrCode)}`
      }

      secretKey.value = data.totp.secret

      // Store URI if provided by Supabase, otherwise construct it
      if (data.totp.uri) {
         otpUri.value = data.totp.uri
      } else {
         // Construct the OTP URI manually
         const user = useSupabaseUser()
         const userEmail = user.value?.email || 'user@digitaledgers.com'
         otpUri.value = `otpauth://totp/Digitaledgers:${encodeURIComponent(userEmail)}?secret=${data.totp.secret}&issuer=Digitaledgers&algorithm=SHA1&digits=6&period=30`
      }

   } catch (err) {
      console.error('MFA enrollment error:', err)
      error.value = err.message || 'Failed to start MFA enrollment'
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

      isVerified.value = true

   } catch (err) {
      console.error('MFA verification error:', err)
      error.value = err.message || 'Invalid verification code. Please try again.'
      verificationCode.value = ''
   } finally {
      isLoading.value = false
   }
}

const copySecret = async () => {
   try {
      await navigator.clipboard.writeText(secretKey.value)
      copied.value = true
      setTimeout(() => {
         copied.value = false
      }, 2000)
   } catch (err) {
      console.error('Failed to copy secret:', err)
   }
}



const goBack = () => {
   navigateTo('/')
}

const goToDashboard = () => {
   navigateTo('/')
}

const handleQRError = () => {
   qrError.value = true
}

const handleQRLoad = () => {
   qrError.value = false
}





</script>

<style scoped>
.qr-code-container {
   width: 192px;
   height: 192px;
   background-color: white;
   display: flex;
   align-items: center;
   justify-content: center;
   padding: 8px;
   box-sizing: border-box;
   position: relative;
}

.qr-svg-wrapper {
   width: 176px;
   height: 176px;
   display: flex;
   align-items: center;
   justify-content: center;
   position: relative;
}

.qr-svg-wrapper :deep(svg) {
   width: 176px !important;
   height: 176px !important;
   display: block;
   margin: 0;
   position: absolute;
   top: 50%;
   left: 50%;
   transform: translate(-50%, -50%);
   /* Override any SVG positioning */
   x: 0 !important;
   y: 0 !important;
}
</style>