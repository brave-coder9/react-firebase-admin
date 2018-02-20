import React, { Component } from 'react';

import Master from './containers/Master'
import App from './containers/App'
import Fireadmin from './containers/Fireadmin'
import Push from './containers/Push'
import firebase from './config/database'
import Config from './config/app';

import { Router, Route,hashHistory,IndexRoute } from 'react-router'

class Admin extends Component {

  constructor(props) {
    super(props);
    this.hasPermittion = this.hasPermittion.bind(this);
    this.isAllowed = this.isAllowed.bind(this);
    this.handleChangeRoute = this.handleChangeRoute.bind(this);
  }

  //Prints the dynamic routes that we need for menu of type fireadmin
  getFireAdminRoutes(item){
    if(item.link=="fireadmin"){
      return (<Route path={"/fireadmin/"+item.path} component={Fireadmin}/>)
    }else{

    }
  }

  //Prints the dynamic routes that we need for menu of type fireadmin
  getFireAdminSubRoutes(item){
    if(item.link=="fireadmin"){
      return (<Route path={"/fireadmin/"+item.path+"/:sub"} component={Fireadmin}/>)
    }else{

    }
  }


  hasPermittion(accessLevel) {
    var currentUser = firebase.auth().currentUser.email;

    for (var i = 0; i < Config.adminConfig.highlevelUsers.length; i++) {
      if (currentUser === Config.adminConfig.highlevelUsers[i]) {
        return true;
      }
    }

    if (accessLevel === "higher") {
      return false;
    }

    if (accessLevel === "general") {
      for (i = 0; i < Config.adminConfig.allowedUsers.length; i++) {
        if (currentUser === Config.adminConfig.allowedUsers[i]) {
          return true;
        }
      }
    }

    return false;
  }

  // the pathname would be
  // "fireadmin/Users+..."
  // "/fireadmin/Users/..."
  // "push/"
  // "/push/"
  isAllowed(pathname) {
    for (var i = 0; i < Config.navigation.length; i++) {
      var oneNav = Config.navigation[i];
      if (pathname.startsWith("/" + oneNav.link)) { // fireadmin
        var subUri = pathname.substr(oneNav.link.length+1);
        if (subUri == null || subUri === "/" || subUri === "") {
            if (oneNav.path === "") {
              return this.hasPermittion(oneNav.accessLevel);
            } else {
              continue;
            }
        } else {
            if (oneNav.path === "") {
              continue;
            } else { // both subUrl and oneNav.path is exist.
              if (subUri.startsWith("/" + oneNav.path)) {
                return this.hasPermittion(oneNav.accessLevel);
              }
            }
        }
      }
    }
    return true;
  }

  handleChangeRoute(prevState, nextState, replace) {
    console.log("$$$$ handleChangeRoute: nextState = ", nextState.location.pathname);
    if (!this.isAllowed(nextState.location.pathname)) {
      replace({pathname: "/"});
    }
  }

  //Prints the Routes
  /*
  {Config.adminConfig.menu.map(this.getFireAdminRoutes)}
  {Config.adminConfig.menu.map(this.getFireAdminSubRoutes)}
  */
  render() {
    return (
      <Router history={hashHistory}>
          <Route path="/" onChange={this.handleChangeRoute} component={Master}>
            {/* make them children of `Master` */}
            <IndexRoute component={App}></IndexRoute>
            <Route path="/app" component={App}/>
            <Route path="/push" component={Push}/>

            <Route path="/fireadmin" component={Fireadmin}/>
            <Route path="/fireadmin/:sub" component={Fireadmin}/>
          </Route>
      </Router>
    );
  }

}

export default Admin;
