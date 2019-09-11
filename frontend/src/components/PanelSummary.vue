<template>
    <v-data-table v-if="analysis" :headers="['name', 'epsilon', 'accuracy']"
                  :items="analysis">
    </v-data-table>
</template>

<script>
    export default {
        name: "PanelSummary",
        props: ['analysis']
    }
</script>

<style scoped>

</style>