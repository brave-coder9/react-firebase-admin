import React, {Component} from 'react'
import NavItem from '../components/NavItem'
import NavBar from '../components/NavBar'
import Config from   '../config/app';
import { getShadowRgbString } from '../utils/ConvertColors';
import firebase from './../config/database'
var md5 = require('md5');
const $ = require('jquery');


class Master extends Component {

  constructor(props) {
    super(props);
    this.state = {
      user: {},
      avatar: Config.adminConfig.userAvatar
    };
    this.handleLogout = this.handleLogout.bind(this);
    this.authListener = this.authListener.bind(this);
    this.printMenuItem= this.printMenuItem.bind(this);
  }

  componentDidMount() {
    this.authListener();
  }

  componentDidUpdate() {
    //
    // processing data-background-color
    //
    $('.sidebar[data-background-color="black"], .off-canvas-sidebar[data-background-color="black"]').css({
      "background-color": "#191919"
    });
    $('.sidebar[data-background-color="black"] .nav li > a, .off-canvas-sidebar[data-background-color="black"] .nav li > a').css({
      "color": "#FFFFFF"
    });
    $('.sidebar[data-background-color="black"] .nav li i, .off-canvas-sidebar[data-background-color="black"] .nav li i').css({
      "color": "rgba(255, 255, 255, 0.8)"
    });
    $('.sidebar[data-background-color="black"] .nav li.active > [data-toggle="collapse"], .sidebar[data-background-color="black"] .nav li:hover > [data-toggle="collapse"], .off-canvas-sidebar[data-background-color="black"] .nav li.active > [data-toggle="collapse"], .off-canvas-sidebar[data-background-color="black"] .nav li:hover > [data-toggle="collapse"]').css({
      "color": "#FFFFFF"
    });
    $('.sidebar[data-background-color="black"] .nav li.active > [data-toggle="collapse"] i, .sidebar[data-background-color="black"] .nav li:hover > [data-toggle="collapse"] i, .off-canvas-sidebar[data-background-color="black"] .nav li.active > [data-toggle="collapse"] i, .off-canvas-sidebar[data-background-color="black"] .nav li:hover > [data-toggle="collapse"] i').css({
      "color": "rgba(255, 255, 255, 0.8)"
    });
    $('.sidebar[data-background-color="black"] .user a, .off-canvas-sidebar[data-background-color="black"] .user a').css({
      "color": "#FFFFFF"
    });
    $('.sidebar[data-background-color="black"] .simple-text, .off-canvas-sidebar[data-background-color="black"] .simple-text').css({
      "color": "#FFFFFF"
    });
    $('.sidebar[data-background-color="black"] .sidebar-background:after, .off-canvas-sidebar[data-background-color="black"] .sidebar-background:after').css({
      "background": "#000",
      "opacity": ".8"
    });
    $('.card [data-background-color]').css({
      "box-shadow": "0 10px 30px -12px rgba(0, 0, 0, 0.42), 0 4px 25px 0px rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(0, 0, 0, 0.2)",
      "margin": "-20px 15px 0",
      "border-radius": "3px",
      "padding": "15px",
      "background-color": "#999999",
      "position": "relative"
    });
    $('.card [data-background-color] .card-title').css({
      "color": "#FFFFFF"
    });
    $('.card [data-background-color] .category').css({
      "margin-bottom": "0",
      "color": "rgba(255, 255, 255, 0.62)"
    });
    $('.card [data-background-color] .ct-label').css({
      "color": "rgba(255, 255, 255, 0.7)"
    });
    $('.card [data-background-color] .ct-grid').css({
      "stroke": "rgba(255, 255, 255, 0.2)"
    });
    $('.card [data-background-color] .ct-series-a .ct-point, .card [data-background-color] .ct-series-a .ct-line, .card [data-background-color] .ct-series-a .ct-bar, .card [data-background-color] .ct-series-a .ct-slice-donut').css({
      "stroke": "rgba(255, 255, 255, 0.8)"
    });
    $('.card [data-background-color] .ct-series-a .ct-slice-pie, .card [data-background-color] .ct-series-a .ct-area').css({
      "fill": "rgba(255, 255, 255, 0.4)"
    });
    $('.card [data-background-color]').css({
      "color": "#FFFFFF"
    });
    $('.card [data-background-color] a').css({
      "color": "#FFFFFF"
    });

    $('.off-canvas-sidebar .nav > li > a, .off-canvas-sidebar .nav > li > a:hover').css({
      "color": "#FFFFFF"
    });
    $('.off-canvas-sidebar .nav > li > a:focus').css({
      "background": "rgba(200, 200, 200, 0.2)"
    });

    //
    // processing data-active-color
    //
    var active_color = Config.adminConfig.design.dataActiveColor;
    var shadow_box = "0 4px 20px 0px rgba(0, 0, 0, 0.14), 0 7px 10px -5px "+getShadowRgbString(active_color);

    $('.sidebar[data-active-color] li > a, .off-canvas-sidebar[data-active-color] li > a').css({
      "background-color": "transparent",
      "box-shadow": ""
    });
    $('.sidebar[data-active-color] li.active > a, .off-canvas-sidebar[data-active-color] li.active > a').css({
      "background-color": active_color,
      "box-shadow": shadow_box
    });

  }
  

  authListener(){
    const setUser=(user)=>{
      this.setState({user:user, avatar: Config.adminConfig.userAvatar})
    }
    const setAvatar=(avatar)=>{
      this.setState({avatar: avatar})
    }
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        setUser(user);

        var collection = "Users"
        firebase.database().ref(collection).orderByChild("email").equalTo(user.email).on(
          "child_added", function(snap){
            var obj = snap.val();
            console.log("avatar-url : " + obj.avatar);
            if (obj.avatar != undefined)
              setAvatar(obj.avatar);
          }.bind(this)
        );

        // User is signed in.
        console.log("User has Logged  in Master");
        console.log(user.email);
      } else {
        // No user is signed in.
        console.log("User has logged out Master");
      }
    }.bind(this));
  }





  handleLogout(e) {
    e.preventDefault();

    console.log('The link was clicked.');
    firebase.auth().signOut();
  }

  printMenuItem(menu){
    var menuPath=menu.path.replace(/\//g, Config.adminConfig.urlSeparator);
    if(menu.subMenus&&menu.subMenus.length>0){
      return (
        <li>
                        <a data-toggle="collapse" href={"#"+menuPath} className="collapsed" aria-expanded="false">
                            <i className="material-icons">{menu.icon}</i>
                            <p>{menu.name}
                                <b className="caret"></b>
                            </p>
                        </a>
                        <div className="collapse" id={menuPath} aria-expanded="false">

                            <ul className="nav">
                            {menu.subMenus.map(this.printMenuItem)}
                            </ul>
                        </div>
                    </li>
        )
    }else{
      return (<NavItem key={menu.name} index={menu.isIndex} onlyActiveOnIndex={menu.isIndex}  to={menu.link+"/"+menuPath}>
          <i className="material-icons">{menu.icon}</i>
          <p>{menu.name}</p>
        </NavItem>)
    }

  }


  render() {

    var bgStyle = {
      backgroundImage: 'url(/assets/img/'+Config.adminConfig.design.sidebarBg+')',
    };


    return (
      <div className="wrapper">

        <div  id="theSideBar" className="sidebar" data-active-color={Config.adminConfig.design.dataActiveColor} data-background-color={Config.adminConfig.design.dataBackgroundColor}>
          <div className="sidebar-wrapper">
            <div className="user">

              <div className="photo">
                  <img src={this.state.avatar} width="120px" align="middle" />
              </div>
              <div className="info">
                <a data-toggle="collapse" href="#collapseExample" className="collapsed">{this.state.user.email}<b className="caret"></b></a>
                <div className="collapse" id="collapseExample">
                    <ul className="nav">
                        <li>
                            <a onClick={this.handleLogout} >Logout</a>
                        </li>
                    </ul>
                </div>
              </div>

            </div>
            <ul className="nav">
              {Config.navigation.map(this.printMenuItem)}
            </ul>
          </div>
       
       
          <div className="sidebar-background"  style={bgStyle}></div>


        </div>


        <div className="main-panel">
            <NavBar />
            <div className="content">
                {this.props.children}
            </div>
            <footer className="footer">
                <div className="container-fluid">
                    <nav className="pull-left">
                        <ul>

                        </ul>
                    </nav>
                    <p className="copyright pull-right">
                        &copy;
                        <script>
                            document.write(new Date().getFullYear())
                        </script>
                        <a href="#">{Config.adminConfig.appName}</a>, {Config.adminConfig.slogan}.
                    </p>
                </div>
            </footer>
        </div>

      </div>











      /*<div><h1><FormattedMessage id={'Login.password'} defaultMessage={'Password'} /></h1>
        <ul role="nav">
        <li><NavLink to="/" onlyActiveOnIndex={true}>Home</NavLink></li>
        <li><NavLink to="/about">About</NavLink></li>
        <li><NavLink to="/repos">Repos</NavLink></li>
        </ul>


      </div>*/)
  }
}


export default Master;
