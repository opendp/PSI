<template>
    <v-data-table :headers="['name', 'epsilon', 'accuracy']"
                  :items="statistics">
    </v-data-table>
</template>

<script>
    export default {
        name: "PanelSummary",
        props: ['statistics']
    }
</script>

<style scoped>

</style>