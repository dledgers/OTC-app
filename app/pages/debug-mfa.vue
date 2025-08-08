<template>
   <div class="min-h-screen bg-base-200 p-4">
      <div class="max-w-2xl mx-auto">
         <h1 class="text-2xl font-bold mb-6">MFA Debug Page</h1>

         <div class="space-y-6">
            <!-- User Status -->
            <div class="card bg-base-100 shadow-xl">
               <div class="card-body">
                  <h2 class="card-title">User Status</h2>
                  <p><strong>Authenticated:</strong> {{ !!user }}</p>
                  <p><strong>User ID:</strong> {{ user?.id || 'Not logged in' }}</p>
               </div>
            </div>

            <!-- MFA Status -->
            <div class="card bg-base-100 shadow-xl">
               <div class="card-body">
                  <h2 class="card-title">MFA Status</h2>
                  <button @click="checkMFAStatus" class="btn btn-primary mb-4">Check MFA Status</button>
                  <div v-if="mfaStatus">
                     <p><strong>Current Level:</strong> {{ mfaStatus.currentLevel }}</p>
                     <p><strong>Next Level:</strong> {{ mfaStatus.nextLevel }}</p>
                     <p><strong>Needs Enrollment:</strong> {{ mfaStatus.needsEnrollment }}</p>
                     <p><strong>Needs Verification:</strong> {{ mfaStatus.needsVerification }}</p>
                  </div>
               </div>
            </div>

            <!-- MFA Factors -->
            <div class="card bg-base-100 shadow-xl">
               <div class="card-body">
                  <h2 class="card-title">MFA Factors</h2>
                  <button @click="listFactors" class="btn btn-primary mb-4">List Factors</button>
                  <div v-if="factors">
                     <p><strong>TOTP Factors:</strong> {{ factors.totp?.length || 0 }}</p>
                     <div v-for="factor in factors.totp" :key="factor.id" class="bg-base-200 p-2 rounded mt-2">
                        <p><strong>ID:</strong> {{ factor.id }}</p>
                        <p><strong>Status:</strong> {{ factor.status }}</p>
                        <p><strong>Created:</strong> {{ factor.created_at }}</p>
                     </div>
                  </div>
               </div>
            </div>

            <!-- Test Enrollment -->
            <div class="card bg-base-100 shadow-xl">
               <div class="card-body">
                  <h2 class="card-title">Test Enrollment</h2>
                  <button @click="testEnrollment" class="btn btn-primary mb-4" :disabled="enrolling">
                     {{ enrolling ? 'Enrolling...' : 'Test Enrollment' }}
                  </button>

                  <div v-if="enrollmentData" class="space-y-4">
                     <div>
                        <p><strong>Factor ID:</strong> {{ enrollmentData.id }}</p>
                        <p><strong>Secret:</strong> {{ enrollmentData.totp?.secret }}</p>
                     </div>

                     <!-- QR Code Testing -->
                     <div v-if="enrollmentData.totp?.qr_code">
                        <h3 class="font-semibold">QR Code Test:</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

                           <!-- Method 1: Direct SVG -->
                           <div class="bg-white p-4 rounded">
                              <h4 class="text-sm font-semibold mb-2">Method 1: Direct SVG</h4>
                              <div v-html="enrollmentData.totp.qr_code" class="w-48 h-48"></div>
                           </div>

                           <!-- Method 2: Data URL -->
                           <div class="bg-white p-4 rounded">
                              <h4 class="text-sm font-semibold mb-2">Method 2: Data URL</h4>
                              <img :src="qrDataUrl" alt="QR Code" class="w-48 h-48" @error="qrError = true"
                                 @load="qrError = false" />
                              <p v-if="qrError" class="text-red-500 text-sm mt-2">Failed to load QR code image</p>
                           </div>

                        </div>
                     </div>
                  </div>

                  <div v-if="enrollmentError" class="alert alert-error mt-4">
                     <span>{{ enrollmentError }}</span>
                  </div>
               </div>
            </div>

            <!-- Console Logs -->
            <div class="card bg-base-100 shadow-xl">
               <div class="card-body">
                  <h2 class="card-title">Debug Logs</h2>
                  <div class="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm max-h-64 overflow-y-auto">
                     <div v-for="(log, index) in debugLogs" :key="index">
                        {{ log }}
                     </div>
                  </div>
                  <button @click="clearLogs" class="btn btn-sm btn-ghost mt-2">Clear Logs</button>
               </div>
            </div>
         </div>
      </div>
   </div>
</template>

<script setup>
const supabase = useSupabaseClient()
const user = useSupabaseUser()

definePageMeta({
   layout: false,
   middleware: []
})

// Reactive state
const mfaStatus = ref(null)
const factors = ref(null)
const enrollmentData = ref(null)
const enrollmentError = ref('')
const enrolling = ref(false)
const qrError = ref(false)
const debugLogs = ref([])

// Computed
const qrDataUrl = computed(() => {
   if (!enrollmentData.value?.totp?.qr_code) return ''
   try {
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(enrollmentData.value.totp.qr_code)}`
   } catch (error) {
      return `data:image/svg+xml;base64,${btoa(enrollmentData.value.totp.qr_code)}`
   }
})

// Methods
const log = (message) => {
   const timestamp = new Date().toLocaleTimeString()
   debugLogs.value.push(`[${timestamp}] ${message}`)
   console.log(message)
}

const clearLogs = () => {
   debugLogs.value = []
}

const checkMFAStatus = async () => {
   try {
      log('Checking MFA status...')
      const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

      if (error) {
         log(`MFA status error: ${error.message}`)
         return
      }

      mfaStatus.value = {
         currentLevel: data.currentLevel,
         nextLevel: data.nextLevel,
         needsEnrollment: data.currentLevel === 'aal1' && data.nextLevel === 'aal1',
         needsVerification: data.currentLevel === 'aal1' && data.nextLevel === 'aal2'
      }

      log(`MFA Status: ${JSON.stringify(mfaStatus.value)}`)
   } catch (error) {
      log(`MFA status check failed: ${error.message}`)
   }
}

const listFactors = async () => {
   try {
      log('Listing MFA factors...')
      const { data, error } = await supabase.auth.mfa.listFactors()

      if (error) {
         log(`Factors error: ${error.message}`)
         return
      }

      factors.value = data
      log(`Factors: ${JSON.stringify(data)}`)
   } catch (error) {
      log(`List factors failed: ${error.message}`)
   }
}

const testEnrollment = async () => {
   enrolling.value = true
   enrollmentError.value = ''
   enrollmentData.value = null

   try {
      log('Starting MFA enrollment...')

      // First check existing factors
      await listFactors()

      // If there are existing unverified factors, remove them
      if (factors.value?.totp?.length > 0) {
         for (const factor of factors.value.totp) {
            if (factor.status !== 'verified') {
               log(`Removing unverified factor: ${factor.id}`)
               const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId: factor.id })
               if (unenrollError) {
                  log(`Failed to remove factor: ${unenrollError.message}`)
               } else {
                  log(`Successfully removed factor: ${factor.id}`)
               }
            }
         }
      }

      // Now try to enroll
      log('Attempting new enrollment...')
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' })

      if (error) {
         log(`Enrollment error: ${error.message}`)
         enrollmentError.value = error.message
         return
      }

      enrollmentData.value = data
      log(`Enrollment successful: ${JSON.stringify(data)}`)
      log(`QR Code length: ${data.totp?.qr_code?.length || 0} characters`)

   } catch (error) {
      log(`Enrollment failed: ${error.message}`)
      enrollmentError.value = error.message
   } finally {
      enrolling.value = false
   }
}

onMounted(() => {
   log('Debug page mounted')
   if (user.value) {
      log(`User authenticated: ${user.value.id}`)
   } else {
      log('User not authenticated')
   }
})
</script>