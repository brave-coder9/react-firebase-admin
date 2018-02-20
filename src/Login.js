import React, { Component } from 'react';
import firebase from './config/database'
import Config from   './config/app';

class Login extends Component {

  constructor(props) {

    super(props);
    this.state = {
      username: '',
      password: '',
      error:'',
    };

    this.handleChangeUsername = this.handleChangeUsername.bind(this);
    this.handleChangePassword = this.handleChangePassword.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.authenticate = this.authenticate.bind(this);
  }



  handleChangeUsername(event) {
    this.setState({username: event.target.value});
  }

  handleChangePassword(event) {
   this.setState({password: event.target.value});
  }

  handleSubmit(event) {
    //alert('Username: ' + this.state.username+ " Password: "+this.state.password);
    this.authenticate(this.state.username,this.state.password);
    event.preventDefault();
  }




  authenticate(username,password) {
     const displayError=(error)=>{
        this.setState({error:error});
     }

     if ((Config.adminConfig.allowedUsers!=null&&Config.adminConfig.allowedUsers.indexOf(username)==-1) ||
         (Config.adminConfig.highlevelUsers!=null&&Config.adminConfig.highlevelUsers.indexOf(username)==-1))
     {
       //Error, this user is not allowed anyway
       displayError("This user doens't have access to this admin panel!");
     } else {
       firebase.auth().signInWithEmailAndPassword(username,password)
       .then(
         function(data) {
           console.log("Yes, user is logged in");
         }
       )
       .catch(function(error) {
         // Handle Errors here.
         var errorCode = error.code;
         var errorMessage = error.message;
         console.log(error.message);
         displayError(error.message);

       });
     }


  }

  render() {


    return (

      <div>


      <nav className="navbar navbar-primary navbar-transparent navbar-absolute">
          <div className="container">
              <div className="navbar-header">
                  <button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#navigation-example-2">
                      <span className="sr-only">Toggle navigation</span>
                      <span className="icon-bar"></span>
                      <span className="icon-bar"></span>
                      <span className="icon-bar"></span>
                  </button>
                  <a className="navbar-brand" href="#">
                    {Config.adminConfig.appName}
                </a>
              </div>
              <div className="collapse navbar-collapse">
                  <ul className="nav navbar-nav navbar-right">


                      <li className=" active ">
                          <a>
                              <i className="material-icons">fingerprint</i>Login
                          </a>
                      </li>

                  </ul>
              </div>
          </div>
      </nav>
      <div className="wrapper wrapper-full-page">
          <div className="full-page login-page"  data-image="assets/img/lock.jpeg">
              <div className="content">
                  <div className="container">
                      <div className="row">
                          <div className="col-md-4 col-sm-6 col-md-offset-4 col-sm-offset-3">
                              <form onSubmit={this.handleSubmit}>
                                  <div className="card card-login card-hidden">
                                      <div className="card-header text-center" data-background-color="rose">
                                          <h4 className="card-title">Login</h4>

                                      </div>

                                      <div className="card-content">
                                        <h4>{this.state.error}</h4>
                                          <div className="input-group">
                                              <span className="input-group-addon">
                                                  <i className="material-icons">email</i>
                                              </span>
                                              <div className="form-group label-floating">
                                                  <label className="control-label">Email address</label>
                                                  <input type="email" value={this.state.username} onChange={this.handleChangeUsername} className="form-control" />
                                              </div>
                                          </div>
                                          <div className="input-group">
                                              <span className="input-group-addon">
                                                  <i className="material-icons">lock_outline</i>
                                              </span>
                                              <div className="form-group label-floating">
                                                  <label className="control-label">Password</label>
                                                  <input type="password" value={this.state.password} onChange={this.handleChangePassword} className="form-control" />
                                              </div>
                                          </div>
                                      </div>
                                      <div className="footer text-center">
                                      <input type="submit" className="btn btn-rose btn-simple btn-wd btn-lg" value={this.state.login} />

                                      </div>
                                  </div>
                              </form>
                          </div>
                      </div>
                  </div>
              </div>
              <footer className="footer">
                  <div className="container">
                      <nav className="pull-left">
                          <ul>

                          </ul>
                      </nav>
                      <p className="copyright pull-right">

                          &copy;
                          <script>
                              document.write(new Date().getFullYear())
                          </script>
                          {Config.adminConfig.appName}


                      </p>
                  </div>
              </footer>
          </div>
      </div>
      </div>







    );
  }
}

export default Login;
