<template>
    <div>
        <div v-if="analysis" v-for="(statistic, i) in analysis"
             :key="i">
            {{statistic.name}}
        </div>
    </div>
</template>

<script>
    export default {
        name: "PanelStatistics",
        props: ['analysis']
    }
</script>

<style scoped>

</style>