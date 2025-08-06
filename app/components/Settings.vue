<template>
   <div class="card w-screen p-2 bg-base-100 shadow-2xl ">
      <figure>
         <Icon name="ph:user" class="w-20 h-20" />
      </figure>
      <div class="card-body justify-center text-center items-center">
         <div class="flex flex-col space-y-2">
            <p class="text-lg underline">NAME </p>
            <p class="text-sm ">{{ myProfile?.name ?? "" }}</p>
         </div>
         <div class="flex flex-col space-y-2">
            <p class="text-lg underline">TELEGRAM ID</p>
            <p class="text-sm ">{{ myProfile?.tg_id ?? "" }}</p>
            <!-- <div class="flex flex-row space-x-2">
               <input type="text" class="input input-bordered basis-4/5" v-model="tgId" />
               <button class="btn basis-1/5" @click="updateTgId">Update</button>
            </div> -->
         </div>
         <div class="flex flex-col ">
            <table class=" table-xs ">
               <thead>
                  <tr>
                     <th class="px-4 py-2">A/C Number</th>
                     <th class="px-4 py-2">IBAN</th>
                     <th class="px-4 py-2">CURRENCY</th>
                  </tr>
               </thead>
               <tbody>
                  <tr v-for="(account, index) in myProfile?.account_details" :key="index">
                     <td class="px-4 py-2 border">{{ account.account_number }}</td>
                     <td class="px-4 py-2 border">{{ account.iban }}</td>
                     <td class="px-4 py-2 border">{{ account.currency }}</td>
                  </tr>
               </tbody>
            </table>
         </div>

      </div>
      <div class="flex justify-center items-center pb-4">
         <button class="btn w-1/2 btn-primary " @click="signOut">Sign out</button>
      </div>
   </div>
</template>

<script setup>
const supabase = useSupabaseClient();
const myProfile = ref(null);
const tgId = ref(null)

async function getProfile() {
   try {
      const profile = await useProfile();
      myProfile.value = profile[0];
      tgId.value = profile[0].tg_id;
   } catch (e) {
      //handle error here
      console.log(e);
   }
}

async function signOut() {
   const { error } = await supabase.auth.signOut()
   if (error) {
      console.log(error)
   }
   return navigateTo('/login');
}

onMounted(() => {
   getProfile();
})
</script>