<template>
    <v-app>
        <Header
                v-bind:logoutUrl="LOGOUT_URL"
                v-bind:viewContentPage="VIEW_CONTENT_PAGE_URL"
                v-bind:user="username"
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

    export default {
        name: 'App',
        components: {
            Header,
            Canvas
        },
        data: () => ({
            getMode() {
                return this.$route.params.mode || 'budgeter';
            },
            LOGOUT_URL: '',
            username: 'TEST',
            VIEW_CONTENT_PAGE_URL: ''
        })
    };
</script>
