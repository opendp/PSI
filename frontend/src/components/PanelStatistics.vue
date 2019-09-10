<template>
    <div>
        <div v-for="(statistic, i) in statistics"
             :key="i">
            {{statistic.name}}
        </div>
    </div>
</template>

<script>
    export default {
        name: "PanelStatistics",
        props: ['statistics']
    }
</script>

<style scoped>

</style>