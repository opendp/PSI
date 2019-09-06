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
    import HelloWorld from './components/HelloWorld';
    import Header from './components/Header';

    let username = "TEST";

    export default {
        name: 'App',
        components: {
            HelloWorld,
            Header
        },
        data: () => ({
            //
        }),
    };
</script>
