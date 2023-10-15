<script setup lang="ts">
import json from '../../../public/plugin_list.json'
</script>

<template>
  <div display="flex" flex-wrap="wrap">
    <div flex="~ wrap gap-1" justify-flex-start gap="20px">
      <a
        v-for="(item, index) in json.plugins" :key="index" :href="item.link"
      >
        <div class="card">
          <h3 class="card__title">{{ index }}<Badge :type="item.type" :text="item.content" />
          </h3>
          <p class="card__content">{{ item.info }} </p>
          <div class="so_top_icon">
            <img
              loading="lazy" :src="item.avatar" rounded-full min-w-10 min-h-10 h-10 w-10
              :alt="`${name}'s avatar`"
            >
          </div>
          <div class="card__arrow">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" height="15" width="15">
              <path fill="#fff" d="M13.4697 17.9697C13.1768 18.2626 13.1768 18.7374 13.4697 19.0303C13.7626 19.3232 14.2374 19.3232 14.5303 19.0303L20.3232 13.2374C21.0066 12.554 21.0066 11.446 20.3232 10.7626L14.5303 4.96967C14.2374 4.67678 13.7626 4.67678 13.4697 4.96967C13.1768 5.26256 13.1768 5.73744 13.4697 6.03033L18.6893 11.25H4C3.58579 11.25 3.25 11.5858 3.25 12C3.25 12.4142 3.58579 12.75 4 12.75H18.6893L13.4697 17.9697Z" />
            </svg>
          </div>
        </div>
      </a>
    </div>
  </div>
</template>

<style>
a {
  text-decoration: none !important;
}

.card {
  --border-radius: 0.75rem;
  --primary-color: var(--vp-c-brand);
  --secondary-color: var(--vp-c-text-2);
  width: 210px;
  height: 130px;
  font-family: "Arial";
  padding: 1rem;
  cursor: pointer;
  border-radius: var(--border-radius);
  background: var(--vp-c-bg-soft);
  box-shadow: 0px 8px 16px 0px rgb(0 0 0 / 3%);
  position: relative;
  display: flex;
}

.card > * + * {
  margin-top: 1.1em;
}

.card .card__content {
  position: absolute;
  top: 40px;
  left: 10px;
  right: 10px;
  display: flex;
  color: var(--secondary-color);
  font-size: 0.86rem;
}

.card .card__title {
  position: absolute;
  top: -13px;
  left: 45px;
  color: var(--vp-c-text-1);
  padding: 0;
  font-size: 1rem;
  font-weight: bold;
}

.card .card__date {
  color: #6e6b80;
  font-size: 0.8rem;
}

.card .card__arrow {
  position: absolute;
  background: var(--primary-color);
  padding: 0.4rem;
  border-top-left-radius: var(--border-radius);
  border-bottom-right-radius: var(--border-radius);
  bottom: 0;
  right: 0;
  transition: 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
}

.card .so_top_icon {
  position: absolute;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #000;
  top: 0px;
  left: 10px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card .so_top_icon img {
  width: 22px;
  height: 22px;
  object-fit: contain;
}

.card svg {
  transition: 0.2s;
}

/* hover */
.card:hover {
  cursor: pointer;
  transition: transform 0.4s ease;
  transform: scale(1.05);
}

.card:hover .card__title {
  color: var(--primary-color);
  text-decoration: underline;
}

.card:hover .card__arrow {
  background: #111;
}

.card:hover .card__arrow svg {
  transform: translateX(3px);
}
</style>
