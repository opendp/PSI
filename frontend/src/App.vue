<template>
    <v-app>
        <Header
                v-bind:logoutUrl="LOGOUT_URL"
                v-bind:viewContentPage="VIEW_CONTENT_PAGE_URL"
                v-bind:username="username"
                v-bind:mode="getMode()"
        ></Header>

        <v-content>
            <Canvas/>
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
            LOGOUT_URL: '',
            username: USER_NAME,
            VIEW_CONTENT_PAGE_URL: ''
        })
    };
</script>
