/* Add your Application JavaScript */

Vue.component('app-header', {
    template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary fixed-top">
      <a class="navbar-brand"><i class="fa fa-camera"> Photogram </i></a>
     
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul v-if="jtoken==''" class="navbar-nav mr-auto">
        
          <li class="nav-item active">
            <router-link class="nav-link" to="/">Home <span class="sr-only">(current)</span></router-link>
          </li>
          <li class="nav-item active">
            <router-link class="nav-link" to="/explore">Explore<span class="sr-only">(current)</span></router-link>
          </li>
           <li class="nav-item active">
            <router-link class="nav-link" to="/users/0">My Profile<span class="sr-only">(current)</span></router-link>
          </li>
          
           <li class="nav-item active">
            <router-link class="nav-link" to="/logout">Logout<span class="sr-only">(current)</span></router-link>
          </li>
          </ul>
          
         <ul v-else class="navbar-nav mr-auto">
         <li class="nav-item active">
            <router-link class="nav-link" to="/">Home <span class="sr-only">(current)</span></router-link>
          </li>
          <li class="nav-item active">
            <router-link class="nav-link" to="/login">Login<span class="sr-only">(current)</span></router-link>
          </li>
          </ul>
       
      </div>
    </nav>
     `,//watch: {
    //     '$route' (to, from){
    //         this.reload()
    //     }
    //   },
    created: function() {
        let self = this;
        this.jtoken = localStorage.getItem('jtoken')
    },
    data: function() {
        return {
            jtoken:""
            
        };
    },
    methods:{
        reload(){
            let self = this;
            self.jtoken= localStorage.getItem('jtoken');
            
            
        }
    }
});

Vue.component('app-footer', {
    template: `
    <footer>
        <div class="container">
            <p>Copyright &copy; llllPhotogram Inc.</p>
        </div>
    </footer>
    `
});

const Home = Vue.component('home', {  template: `
  <div>
    <div v-if="usertoken=='Not logged in'" class="jumbotron">
      <div style="margin-top: 20%;">
          <router-link class="btn btn-success col-md-5" to="/register">Register</router-link>
          <router-link class="btn btn-primary col-md-5" to="/login">Login</router-link>
        </div>
    </div>
    <div v-else>
    <h1> Welcome Friend </h1>
        <h3>You are already logged in </h3>
    </div>
    </div>
  `,
    created: function(){
        let self = this;
        console.log(localStorage.getItem('jtoken'))
        if (localStorage.getItem('jtoken')!==null){
            usertoken=localStorage.getItem('jtoken');
        }
    },
    data: function() {
      return {
          usertoken:'Not logged in'
      }
    }
});

const Register=Vue.component('register',{
    template:`
    
    <div>
    <div v-if ="message">
          <p class="alert alert-success" >
            {{message}}
          </p>
        </div>
        <div v-if="errors">
         <p v-for ="err in errors" class="alert alert-danger">
            {{err}}
            </p>
    </div>
    <div class="form-group">
    <form id="registerform" @submit.prevent="register" method="POST" enctype="multipart/form-data">
    <label>Username</label><br>
    <input type="text" name="username">
    <br><br>
    
    <label>Password</label><br>
    <input type="password" name="password">
    <br><br>
    
    <label>Retype-Password:</label><br>
    <input type="password" name="confirmpassword">
    <br><br>
    
    <label>First name</label><br>
    <input type="text" name="fname">
    <br><br>
    
    <label>Last name</label><br>
    <input type="text" name="lname">
    <br><br>
    
    <label>Email</label><br>
    <input type="email" name="email">
    <br><br>
    
    <label>Location</label><br>
    <input type="text" name="location">
    <br><br>
    
    <label>Biography</label><br>
    <textarea class="form-control" rows="3" id="desc" name="biography"></textarea>
    <br><br>
    
    <label>Profile Photo</label><br>
    <input class="form-control-file" type="file" name="profile_photo"/>
    <br><br>
    
    <button class="btn btn-primary">Register</button>
    </form>    
    </div>
    </div>
    `
, data: function(){
    return {
        message:"",
        errors:[]
    }
},methods:{
    
    register: function(){
        let self = this;
        let registerform = document.getElementById('registerform');
        let form_data = new FormData(registerform);
        
        fetch("/api/users/register", { 
            method: 'POST', 
            body: form_data,
            headers: {
                    'X-CSRFToken': token
                },
                credentials: 'same-origin'
            })
            .then(function (response) {
                return response.json();
            })
            .then(function (jsonResponse) {
                if(jsonResponse.message){
                   
                    self.message = jsonResponse.message;
                    //this.$route.router.go('/login');
                    console.log("Account created for , Please login.");
                    self.$router.push('/login');
                } 
                else{     
                    self.errors=jsonResponse.errors;  
                    console.log(jsonResponse.errors);
                }
            
            })
            .catch(function (error) {
                console.log(error);
            });
    }
}
});

const Login =Vue.component('login',{
    template:`
    <div>
        <div v-if ="message">
          <p class="alert alert-success" >
            {{message}}
          </p>
        </div>
        <div v-if="errors">
          <p v-for ="err in errors" class="alert alert-danger">
            {{err}}
            </p>
        </div>
        <div class="form-group">
        <form id="loginform" method="POST" @submit.prevent="login">
        <label>Username:</label>
        <input type="text" name="username">
        <br><br>
        <label>Password:</label>
        <input type="password" name="password"><br>
        <button class="btn btn-primary" type="submit">Login</button>
        </form>  
        </div>
    </div>
                    `
, data: function() {
    return {
        message:"",
        errors:[]
    }
    
}, methods:{
    login: function(){
        let self = this;
        let loginform = document.getElementById('loginform');
        let form_data = new FormData(loginform);
        fetch("/api/auth/login", { 
            method: 'POST', 
            body: form_data,
            headers: {
                    'X-CSRFToken': token
                },
            credentials: 'same-origin'
            })
            .then(function (response) {
                return response.json();
                
            })
            .then(function (jsonResponse) {
                if(jsonResponse.errors){
                    console.log(jsonResponse.errors);
                    self.errors = jsonResponse.errors;
                }
                else{
                    let self.jtoken = localStorage.getItem('jtoken');
                    // //let userid=localStorage.getItem('userid');
                    // let self.user=localStorage.getItem('user');
                    
                    localStorage.setItem('user', jsonResponse.user)
                    localStorage.setItem('jtoken', jsonResponse.token);
                    //localStorage.setItem('userid',jsonResponse.user.userid);
                    console.log(localStorage.getItem('jtoken'))
                    
                    self.message = jsonResponse.message;
                    console.log(jsonResponse.message, localStorage.getItem('user'));
                    //this.$route.router.go('/explore');
                    self.$router.push({path:'/explore' });
                }
                
            })
            .catch(function (error) {
                console.log(error);
            });
    }
}
    
});

// const Logout=Vue.component('logout',{
//     template:`
//     <div>
//      <div v-if ="message">
//     <p class="alert alert-success" >
//         {{message}}
//     </p>
//     </div>
//     <p>Are you sure you want to logout</p>
//     <form id="logout" @submit.prevent="logout">
//     <button class="btn btn-primary" type="submit" >Logout</button>
//     </form>
//     </div>
// `,
//     created:function(){
//             let self = this;
//             if(localStorage.getItem('token')!==null){
//                 self.usertoken=localStorage.getItem('token');   
//             }
//         },
//     data:function(){
//         return {
//             message :'',
//             usertoken:''
//         }
//     },methods:{
//         logout: function(){
//         if (localStorage.getItem('sessionuser')!==null){
//             let self = this;
//             //self.usertoken=localStorage.getItem('token');
//             let logoutform = document.getElementById('logout');
//             let form_data = new FormData(logoutform);
//             fetch("/api/auth/logout", { 
//                 method: 'GET',
//                 headers: {
//                         //'Authorization': 'Bearer ' + localStorage.getItem('token'),
//                         'X-CSRFToken': token
//                     },
//                 credentials: 'same-origin'
                
//                 })
//                 .then(function (response) {
//                     return response.json();
//                 })
//                 .then(function (jsonResponse) {
//                     if(jsonResponse.message){
//                         console.log('out')
//                         //localStorage.removeItem('token');
//                         localStorage.removeItem('sessionuser');
//                         localStorage.removeItem('sessionuserphoto');
//                         self.message=jsonResponse.message;
                        
//                         self.$router.push('/')
//                     }
//                 })
//                 .catch(function (error) {
//                     console.log(error);
//                 });
//             }
//         }    }
//     });


const AddPost=Vue.component('addpost',{
    template:`

    <div>
            
            <div v-if ="message">
              <p class="alert alert-success" >
                {{message}}
              </p>
             </div>
              <div v-if="errors">
              <p v-for ="err in errors" class="alert alert-danger">
                {{err}}
                </p>
                </div>
          <div class="form-group"> 
          <h1>Upload</h1>
            <form id="postform"  @submit.prevent="uploadPost" method="POST" enctype="multipart/form-data">
                <input class="form-control-file" type="file"  name="photo"/>
                <br>
                <br>
                <label for="desc">Caption:</label>
                <br>
                <textarea class="form-control" rows="3" id="caption" name="caption"></textarea>
                <br><br>
                <button class="btn btn-primary" type="submit">Upload</button>
            </form>
            </div>
    </div>
  `,
        // created:function(){
        //     let self = this;
        //     if(localStorage.getItem'token')!==null){
        //         self.usertoken=localStorage.getItem('token');   
        //     }
        // },
    data:function(){
        return {
            message:'',
            errors:[]
            //usertoken:''
        };
    },methods: {
        uploadPost: function () {
            let self = this;
            let uploadForm = document.getElementById('postform');
            let form_data = new FormData(uploadForm);
            let user_id =localStorage.getItem("sessionuser")
            fetch("/api/users/"+user_id+"/posts", { 
            method: 'POST',
            body: form_data,
            headers: {
                  // 'Authorization': 'Bearer ' //+ localStorage.getItem('token'),
                    'X-CSRFToken': token
                },
            credentials: 'same-origin'
            
            })
            .then(function (response) {
                return response.json();
            })
            .then(function (jsonResponse) {
                 if(jsonResponse.message){
                    console.log(jsonResponse.message);
                    self.message = jsonResponse.message
                    user_id = localStorage.getItem("sessionuser")
                    self.$router.push({path:'/users/'+ user_id })
                } 
                else{     
                    self.errors=jsonResponse.errors; 
                    console.log(jsonResponse.errors)

                }
            })
            .catch(function (error) {
                console.log(error);
            });
        }
    }
    
});

const Explorer=Vue.component('Allposts',{
template:`
                
                <div style="margin-top: 20%;">
                    <router-link class="btn btn-success col-md-5" to="/posts/new">New Post</router-link>
                </div>
               <div>
                    <div v-for="post in allposts">
                        <img style="width:100px; height:100px" v-bind:src="post.uphoto"><h4>{{post.uname}}</h4>
                        <img style="width:600px; height:600px" v-bind:src="post.photo"/>
                        <p>{{post.caption}}</p>
                       
                            <div v-if="post.likebyuser=='No'">
                                <button :id=post.id v-on:click="like(post.id)" style="background-color:transparent">
                                    <img style="width:35px; height:35px" v-bind:src="'static/uploads/pgheart.png'" />
                                </button>
                            </div>
                            <div v-else>
                                <button style="background-color:transparent" disabled>
                                    <img style="width:35px; height:35px" v-bind:src="'static/uploads/pgheart.png'" />
                                </button>
                            </div>
                        <p>Likes: <span :id="'like'+post.pid">{{post.likes}}</span></p></div>
                        <p>{{post.created_on}}</p>
                        </div>
                    
                    </div>
                
               
        
      `,
        created: function () {
        let self = this;
        // if(localStorage.getItem('jtoken')){
        //     self.usertoken=localStorage.getItem('jtoken');
        //     console.log(localStorage.getItem('jtoken'));
            fetch("/api/posts", { 
            method: 'GET',
            headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('jtoken'),
                    'X-CSRFToken': token
                },
            credentials: 'same-origin'
            
            })
            .then(function (response) {
                return response.json();
            })
            .then(function (jsonResponse) {
    
                self.allposts=jsonResponse.allposts;
                self.message = jsonResponse.message;
                
                console.log('got it');
            })
            .catch(function (error) {
                console.log(error);
            });
        }
    ,
    data:function(){
        return {
            message:"",
            allposts:[],
            error:[],

        }
    },
    methods:{
        viewuser:function(){
            
        },
        
        like:function(postid){
            let self= this;
            let likevalue=document.getElementById('like'+postid).innerHTML;
            likevalue=parseInt(likevalue)+1;
            fetch("/api/posts/"+postid+"/like", { 
                method: 'POST',
                headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token'),
                        'X-CSRFToken': token
                    },
                credentials: 'same-origin'
                
                })
                .then(function (response) {
                    return response.json();
                })
                .then(function (jsonResponse) {
                    if (jsonResponse.response){
                        alert(jsonResponse.response['0']['message']);
                        document.getElementById('like'+postid).innerHTML=likevalue;
                        document.getElementById(postid).disabled=true;
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
            
    }
})

// // const UserPost=Vue.component('Userposts',{
// // template:`<div v-if="usertoken!==''">
// //                 <div v-if="error ===''">
// //                     <div>
// //                         <img style="width:100; height:100px;" v-bind:src="userinfo.photo" />
// //                         <p>{{userinfo.fname}}<span> {{userinfo.lname}}</span></p>
// //                         <p>{{userinfo.location}}</p>
// //                         <p>{{userinfo.joined}}</p>
// //                         <p>{{userinfo.bio}}</p>
// //                     </div>
// //                     <div>
// //                         <p>{{numposts}} </br> Posts</p>
// //                         <p><span id='followers'>{{follows}}</span> </br>Following</p>
// //                         <div v-if="toshow=='Yes'">
// //                             <form method="POST" @submit.prevent="follow">
// //                                 <input  id='userid' type="hidden" :value=userinfo.id >
// //                                 <button id='follow'>Follow</button>
// //                             </form>
// //                         </div>
// //                         <div v-if="isfollowing !==''">
// //                             <p>{{isfollowing}}</p>
// //                         </div>
// //                     </div>
// //                     <div v-if="posts.length > 0">
// //                         <div v-for="photo in posts">
// //                             <img v-bind:src="photo.photo"/>
// //                         </div>
// //                     </div>
// //                     <div v-else><h3>No posts yet</h3></div>
// //                 </div>
// //                 <div v-else><h1>User Doesn't exist</h1></div>
// //             </div>
// //             <div v-else>
// //                 <h3>You are not logged in</h3>
// //             </div>`,
// //         created: function () {
// //             if(localStorage.getItem('token')!==null){
// //                 let self = this;
// //                 self.usertoken=localStorage.getItem('token');
// //                 fetch("/api/users/"+this.$route.params.user_id+"/posts", { 
// //                 method: 'GET',
// //                 headers: {
// //                         'Authorization': 'Bearer ' + localStorage.getItem('token'),
// //                         'X-CSRFToken': token
// //                     },
// //                 credentials: 'same-origin'
                
// //                 })
// //                 .then(function (response) {
// //                     return response.json();
// //                 })
// //                 .then(function (jsonResponse) {
// //                     if (jsonResponse.response){
// //                         self.posts=jsonResponse.response['0']['posts']['0'];
// //                         self.numposts=jsonResponse.response['0']['numposts'];
// //                         self.follows=jsonResponse.response['0']['follows'];
// //                         self.userinfo=jsonResponse.response['0']['userinfo'];
// //                         console.log(self.userinfo);
// //                         if((jsonResponse.response['0']['current']==='No' &&  jsonResponse.response['0']['following']==='No')===true){
// //                             self.toshow='Yes';
// //                         }
// //                         if(jsonResponse.response['0']['current']==='No' && jsonResponse.response['0']['following']==='Yes'){
// //                                 self.isfollowing='You are already following '+self.userinfo['username'];
// //                         }
// //                     }
// //                     else{
// //                         self.error=jsonResponse.error['error'];
// //                     }
// //                 })
// //                 .catch(function (error) {
// //                     console.log(error);
// //                 });
// //             }
            
// //         },
// //         data:function(){
// //             return {
// //                 usertoken:'',
// //                 posts:[],
// //                 follows:0,
// //                 numposts:0,
// //                 userinfo:[],
// //                 isfollowing:'',
// //                 error:'',
// //                 toshow:'',
// //             }
// //         },methods:{
// //             follow:function(){
// //                 let self= this;
// //                 let followid=document.getElementById('userid').value;
// //                 let updatefollows=document.getElementById('followers').innerHTML;
// //                 updatefollows=parseInt(updatefollows)+1;
// //                 fetch("/api/users/"+followid+"/follow", { 
// //                     method: 'POST',
// //                     headers: {
// //                             'Authorization': 'Bearer ' + localStorage.getItem('token'),
// //                             'X-CSRFToken': token
// //                         },
// //                     credentials: 'same-origin'
                    
// //                     })
// //                     .then(function (response) {
// //                         return response.json();
// //                     })
// //                     .then(function (jsonResponse) {
// //                         if (jsonResponse.response){
// //                             alert(jsonResponse.response['message']);
// //                             document.getElementById('followers').innerHTML=updatefollows;
// //                             document.getElementById('follow').disabled=true;
// //                         }
// //                     })
// //                     .catch(function (error) {
// //                         console.log(error);
// //                     });
// //             }
                
// //         }
// // })
// Define Routes
const router = new VueRouter({
    routes: [
        { path: "/", component: Home },
        { path:"/login",component: Login },
        { path:"/posts/new", component:AddPost},
        { path:"/register", component:Register},
    //    { path:"/logout",component:Logout},
        { path:"/explore",component:Explorer},
        //{ path:"/users/:user_id",component:UserPost}
    ]
});

// Instantiate our main Vue Instance
let app = new Vue({
    el: "#app",
    router
});