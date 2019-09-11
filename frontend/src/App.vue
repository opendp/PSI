<template>
    <v-app>
        <Header
                v-bind:datasetName="datasetName()"
                v-bind:logoutUrl="LOGOUT_URL"
                v-bind:viewContentPage="VIEW_CONTENT_PAGE_URL"
                v-bind:username="username"
                v-bind:mode="getMode()"
                v-bind:selectedMenu="getSelectedMenu()"
        ></Header>

        <v-content>
            <Canvas v-bind:selectedMenu="getSelectedMenu()"/>
        </v-content>
    </v-app>
</template>

<script>
    import Canvas from './components/Canvas.vue';
    import Header from './components/Header.vue';

    let validModes = new Set(['budgeter', 'researcher']);

    export default {
        name: 'App',
        components: {
            Header,
            Canvas
        },
        data: () => ({
            getMode() {
                let mode = this.$route.params.mode || 'budgeter';
                if (!validModes.has(mode))
                return mode;
            },
            datasetName() {
                let workspace = this.$store.state.workspace;
                if (workspace) return workspace.dataset.name;
            },
            getSelectedMenu() {
                return this.$store.state.selectedMenu
            },
            LOGOUT_URL: '',
            username: USER_NAME,
            VIEW_CONTENT_PAGE_URL: ''
        })
    };
</script>
