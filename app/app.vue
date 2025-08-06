<template>
  <div class="absolute top-2 left-2 z-50">
    <div class="dropdown dropdown-end">
      <label tabindex="0" class="btn btn-sm">
        <Icon name="material-symbols:language" class="mr-1" />
        <Icon name="mdi:chevron-down" />
      </label>
      <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box left-0">
        <li>
          <a @click="setLocale('es')" class="flex items-center">
            <Icon name="circle-flags:es" class="w-5 h-5 mr-2" />
          </a>
        </li>
        <li>
          <a @click="setLocale('en')" class="flex items-center">
            <Icon name="circle-flags:uk" class="w-5 h-5 mr-2" />
          </a>
        </li>
      </ul>
    </div>
  </div>
  <NuxtPwaManifest />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>

const { locales, setLocale } = useI18n()
// defineOgImage({
//    url: 'https://app.digitaledgers.com/ogimage.png'
// })
useHead({
  // title: 'Digitaledgers',
  meta: [
    {
      name: 'description',
      content: "Digitaledgers - Manage your digital assets"
    }
  ],
  link: [
    {
      rel: 'icon',
      type: 'image/ico',
      href: '/favicon.ico'
    }
  ]
})
useSeoMeta({
  ogImage: 'https://app.digitaledgers.com/ogimage.png',
  ogImageType: 'image/png',
  ogUrl: "https://app.digitaledgers.com",
  ogDescription: "Digitaledgers - Manage your digital assets",
  twitterTitle: 'Digitaledgers',
  twitterDescription: "Digitaledgers - Manage your digital assets",
  twitterImage: 'https://app.digitaledgers.com/ogimage.png',
  twitterCard: 'summary'
})
</script>