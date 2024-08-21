<script setup lang="ts">
import json from '../../../public/plugin_list.json'
function goToPage(url: string) {
  window.open(url, '_blank')
}
</script>

<template>
  <div class="list">
    <div
      v-for="(item, index) in json.plugins"
      :key="index"
      class="card"
      @click.prevent="() => goToPage(item.link)"
    >
      <div class="icon">
        <img
          :src="item.cover || item.avatar"
          alt=""
        >
      </div>
      <div class="info">
        <div class="title">
          <span>{{ index }}</span>
          <Badge
            :type="item.type"
            :text="item.content"
          />
        </div>
        <p class="description">
          {{ item.info }}
        </p>
      </div>
      <div class="avatar">
        <img
          loading="lazy"
          :src="item.avatar"
          :alt="`${index}'s avatar`"
        >
      </div>
      <div class="arrow">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          class="icon_arrow"
        >
          <path
            d="M13.4697 17.9697C13.1768 18.2626 13.1768 18.7374 13.4697 19.0303C13.7626 19.3232 14.2374 19.3232 14.5303 19.0303L20.3232 13.2374C21.0066 12.554 21.0066 11.446 20.3232 10.7626L14.5303 4.96967C14.2374 4.67678 13.7626 4.67678 13.4697 4.96967C13.1768 5.26256 13.1768 5.73744 13.4697 6.03033L18.6893 11.25H4C3.58579 11.25 3.25 11.5858 3.25 12C3.25 12.4142 3.58579 12.75 4 12.75H18.6893L13.4697 17.9697Z"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<style>
.list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

a {
  text-decoration: none !important;
}

.card {
  --border-radius: 0.75rem;
  --primary-color: var(--vp-c-brand);
  --secondary-color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  box-shadow: 0px 8px 16px 0px rgb(0 0 0 / 3%);
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;
  height: 62px;
  border-radius: 30px;
  padding: 1px;
  transition: 0.3s;
}

.card .icon {
  width: 60px;
  height: 60px;
  flex-grow: 0;
  flex-shrink: 0;
  border-radius: 50%;
}

.card .icon img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: block;
}

.card .info {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  padding-left: 10px;
  overflow: hidden;
}

.card .info .description {
  color: var(--secondary-color);
  font-size: 0.86rem;
  line-height: normal;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card .info .title {
  color: var(--vp-c-text-1);
  padding: 0;
  font-weight: bold;
  display: flex;
  align-items: center;
  margin: 0;
  gap: 5px;
}

.card .info .title span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card .info .title .VPBadge {
  margin-top: 4px;
}

.card .arrow {
  width: 35px;
  height: 35px;
  background: var(--primary-color);
  padding: 0.4rem;
  transition: 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  margin-right: 10px;
}

.card .avatar {
  width: 30px;
  height: 30px;
  flex-grow: 0;
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 10px;
  border: 1.5px solid #f51919;
}

.card .avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: block;
}

.card .icon_arrow {
  transition: 0.2s;
  fill: white;
}

/* hover */
.card:hover {
  cursor: default !important;
  transition: transform 0.4s ease;
  transform: scale(1.05);
  background-color: rgba(251, 68, 68, 0.8);
  backdrop-filter: blur(10px);
}

.card:hover .arrow {
  background: var(--vp-c-bg-soft);
}

.card:hover .icon_arrow {
  fill: var(--primary-color);
}

.card:hover .avatar {
  border: 2px solid var(--primary-color);
}

.card:hover .info .title {
  color: white;
}

.card:hover .info .description {
  color: rgb(235, 226, 225);
}
</style>
