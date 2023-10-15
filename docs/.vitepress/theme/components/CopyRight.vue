<script setup lang="ts">
import { ref } from 'vue'
import { useData } from 'vitepress'

const defaultAuthor = 'Wuyi'
const { frontmatter } = useData()

const author = ref(defaultAuthor)

if (frontmatter.value?.author)
  author.value = frontmatter.value?.author

function reName(name: string) {
  return name === 'Choi Yang' ? 'Chocolate1999' : name
}

const pageHref = location.href

function getGithubLink(name: string) {
  return `https://github.com/${reName(name)}`
}
</script>
