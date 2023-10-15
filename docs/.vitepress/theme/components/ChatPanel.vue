<script lang="ts">
export default {
  props: {
    controls: Boolean,
    title: String,
  },

  data: () => ({
    tab: 'default',
  }),

  computed: {
    mini() {
      return !this.controls && !this.title
    },
  },
}
</script>

<template>
  <div class="panel-view" :class="{ mini }">
    <div class="controls">
      <div class="circle red" />
      <div class="circle yellow" />
      <div class="circle green" />
      <div class="title">
        <span v-if="title" class="title-text">{{ title }}</span>
      </div>
    </div>
    <div class="content">
      <slot />
    </div>
  </div>
</template>

<style lang="scss">
$circleRadius: 6px;
$circleSpacing: 19px;
$textShadow: 1px 1px 1px rgba(23, 31, 35, 0.5);

.panel-view {
  outline: 2px;
  outline-color: #ea1313;
  outline-style: auto;
  position: relative;
  border-radius: 6px;
  margin: 1rem 0;
  overflow: auto hidden;
  background-color: var(--vp-c-bg-alt);

  &.manager, &.container {
    background-color: #032f62;
  }

  .controls {
    display: initial;
    position: absolute;
    top: 0.8rem;
    width: 100%;
  }

  .circle {
    position: absolute;
    top: 8px - $circleRadius;
    width: 2 * $circleRadius;
    height: 2 * $circleRadius;
    border-radius: $circleRadius;
    &.red {
      left: 17px;
      background-color: #ff5f56;
    }
    &.yellow {
      left: 17px + $circleSpacing;
      background-color: #ffbd2e;
    }
    &.green {
      left: 17px + 2 * $circleSpacing;
      background-color: #27c93f;
    }
  }

  .title {
    text-align: center;
    width: 100%;
    font-size: 1rem;
    font-weight: bold;
    line-height: 1rem;

    .tab {
      color: gray;
      cursor: pointer;
      transition: .3s ease;
    }

    .tab.active {
      color: white;
      cursor: default;
    }

    .title-text:not(:last-child)::after {
      color: gray;
      content: " - ";
    }

    .tab + .tab::before {
      cursor: default;
      content: " | ";
      color: gray;
    }
  }

  .content {
    padding: 0.2rem 1.2rem;

    > p {
      font-size: 0.8rem;
      color: #909399;
      text-align: center;
    }
  }

  &.mini .controls {
    display: none;
  }
  &:not(.mini) .content {
    padding-top: 2rem;
  }
}
</style>
