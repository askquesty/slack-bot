<template>
  <div class="login-form">
    <b-form>
      <b-form-group
              id="input-group-login"
              label="Login:"
              label-for="input-login"
      >
        <b-form-input
                id="input-login"
                v-model="form.login"
                placeholder="Enter login"
        ></b-form-input>
      </b-form-group>

      <b-form-group id="input-group-password" label="Your password:" label-for="input-password">
        <b-form-input
                id="input-password"
                v-model="form.password"
                type="password"
                placeholder="Enter password"
        ></b-form-input>
      </b-form-group>
      <b-button type="button" v-on:click="onSubmit" variant="primary">Log in</b-button>
    </b-form>
  </div>
</template>

<script>
  export default {
    name: 'Login',
    data(){
      return {
        form:{
          login:'',
          password:'',
        }
      }
    },
    methods:{
      onSubmit(){
        this.$emit('login', {
          login:this.form.login,
          pass:this.form.password
        })
      }
    }
  }
</script>
<style>
  .login-form {
    width: 500px;
    margin: 0 auto;
    padding-top: 200px;
  }
</style>

