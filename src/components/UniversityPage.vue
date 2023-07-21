<template>
  <div class="university-page">
    <h2>{{ university.name }}</h2>
    <p>Location: {{ university.location }}</p>
    <p>Ranking: {{ university.ranking }}</p>
    <p>Tuition: {{ university.tuition }}</p>
    <p>Website: <a :href="university.website" target="_blank">{{ university.website }}</a></p>
  </div>
</template>

<script>
export default {
  props: ['university'],
};
</script>

<style>
/* Add your desired CSS styles here */
</style>
