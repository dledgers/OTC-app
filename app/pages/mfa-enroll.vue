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
                           <div v-html="qrCodeSvg" class="qr-svg-wrapper"></div>
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

                  <!-- Debug info (remove after fixing) -->
                  <div v-if="factorId" class="text-xs text-gray-500 mt-2 p-2 bg-gray-100 rounded">
                     <p><strong>Debug:</strong></p>
                     <p>Has SVG: {{ qrDebugInfo.hasSvg }} ({{ qrDebugInfo.svgLength }} chars)</p>
                     <p>Has Data URL: {{ qrDebugInfo.hasDataUrl }} ({{ qrDebugInfo.dataUrlLength }} chars)</p>
                     <p>Has Error: {{ qrDebugInfo.hasError }}</p>
                     <p v-if="qrCodeSvg">SVG starts: {{ qrCodeSvg.substring(0, 30) }}...</p>
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
         console.log('Found existing unverified TOTP factor, removing it to start fresh')

         try {
            const { error: unenrollError } = await supabase.auth.mfa.unenroll({
               factorId: existingTOTP.id
            })

            if (unenrollError) {
               console.error('Error removing existing factor:', unenrollError)
               error.value = 'Unable to reset MFA setup. Please try signing out and back in.'
               return
            }

            console.log('Successfully removed existing factor, proceeding with new enrollment')
         } catch (unenrollErr) {
            console.error('Failed to remove existing factor:', unenrollErr)
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

      // Store the SVG content directly (Method 1 - Primary)
      const svgContent = data.totp.qr_code
      console.log('QR Code SVG received:', svgContent.substring(0, 100) + '...')

      // Check if this is a data URL or pure SVG
      let cleanedSvg = svgContent.trim()

      if (cleanedSvg.startsWith('data:image/svg+xml')) {
         // Extract the SVG from data URL
         console.log('Detected data URL, extracting SVG content...')

         // Handle both base64 and UTF-8 encoded data URLs
         if (cleanedSvg.includes('base64,')) {
            const base64Part = cleanedSvg.split('base64,')[1]
            cleanedSvg = atob(base64Part)
         } else if (cleanedSvg.includes('utf-8,')) {
            const utf8Part = cleanedSvg.split('utf-8,')[1]
            cleanedSvg = decodeURIComponent(utf8Part)
         } else {
            // Try to extract after the first comma
            const parts = cleanedSvg.split(',')
            if (parts.length > 1) {
               cleanedSvg = decodeURIComponent(parts.slice(1).join(','))
            }
         }
      }

      console.log('SVG starts with:', cleanedSvg.substring(0, 50))
      console.log('SVG ends with:', cleanedSvg.substring(cleanedSvg.length - 50))

      qrCodeSvg.value = cleanedSvg
      console.log('QR Code SVG stored directly')

      // Also create data URL as fallback (Method 2 - Fallback)
      try {
         qrCodeDataUrl.value = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`
         console.log('QR Code data URL created successfully')
      } catch (error) {
         console.error('Error creating QR code data URL:', error)
         qrCodeDataUrl.value = `data:image/svg+xml;base64,${btoa(svgContent)}`
      }

      secretKey.value = data.totp.secret

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
   console.error('QR Code image failed to load')
   qrError.value = true
}

const handleQRLoad = () => {
   console.log('QR Code image loaded successfully')
   qrError.value = false
}

// Debug computed to track QR code state
const qrDebugInfo = computed(() => {
   return {
      hasSvg: !!qrCodeSvg.value,
      hasDataUrl: !!qrCodeDataUrl.value,
      hasError: qrError.value,
      svgLength: qrCodeSvg.value?.length || 0,
      dataUrlLength: qrCodeDataUrl.value?.length || 0
   }
})

// Watch for changes in QR code data
watch(qrDebugInfo, (newInfo) => {
   console.log('QR Code Debug Info:', newInfo)
}, { immediate: true })
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
}

.qr-svg-wrapper {
   width: 100%;
   height: 100%;
   display: flex;
   align-items: center;
   justify-content: center;
}

.qr-svg-wrapper :deep(svg) {
   width: 100% !important;
   height: 100% !important;
   max-width: 176px;
   /* 192px - 16px padding */
   max-height: 176px;
   /* 192px - 16px padding */
   display: block;
   margin: auto;
}
</style>