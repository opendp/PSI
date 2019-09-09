<template>
    <v-app>
        <Header
                v-bind:logoutUrl="LOGOUT_URL"
                v-bind:viewContentPage="VIEW_CONTENT_PAGE_URL"
                v-bind:user="username"
        ></Header>

        <v-content>
            <HelloWorld/>
        </v-content>
    </v-app>
</template>

<script>
    import HelloWorld from './components/HelloWorld.vue';
    import Header from './components/Header.vue';

    // let username = "TEST";
    // let LOGOUT_URL = '';
    // let VIEW_CONTENT_PAGE_URL = '';

    export default {
        name: 'App',
        components: {
            Header,
            HelloWorld
        },
        data: () => ({
            LOGOUT_URL: '',
            username: 'TEST',
            VIEW_CONTENT_PAGE_URL: ''
        }),
    };
</script>
