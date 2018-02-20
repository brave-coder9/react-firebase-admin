import React, {Component} from 'react'
import Config from   '../config/app';
import submitOneSignal, { submitFirebase } from '../utils/SendPushNotification';
import Notification from '../components/Notification';

class App extends Component {

	constructor(props) {
	    super(props);
	    this.state = {value: '',status:[],title:''};

	    this.handleChange = this.handleChange.bind(this);
        this.handleChangeTitle = this.handleChangeTitle.bind(this);
	    this.handleSubmitFirebase = this.handleSubmitFirebase.bind(this);
        this.handleSubmitOneSignal = this.handleSubmitOneSignal.bind(this);
	    this.sendCallback = this.sendCallback.bind(this);
        this.displayTitle=this.displayTitle.bind(this);

        this.callbackCloseNotification = this.callbackCloseNotification.bind(this);
     }


	handleChange(event) {
		this.setState({value: event.target.value});
	}

    handleChangeTitle(event) {
        this.setState({title: event.target.value});
    }

	sendCallback(e,r){
		console.log(r);
        console.log(e);
        var amountList = this.state.status;
        amountList.push(r.body.recipients);
		this.setState({
            title:"",
			value:"",
			status: amountList
		})
    }
    
    callbackCloseNotification(index) {
        var amountList = this.state.status;
        amountList.slice(index, 1);
        this.setState({
            status: amountList
        });
    }

	handleSubmitFirebase(event) {
		//alert('A push was submitted: ' + this.state.value);
		event.preventDefault();

        submitFirebase(this.sendCallback, this.state.value);
	}


    handleSubmitOneSignal(event) {
        //alert('A push was submitted: ' + this.state.value);
        event.preventDefault();

        submitOneSignal(this.sendCallback, this.state.value, this.state.title);

    }

    displayTitle(){
        if(Config.pushSettings.pushType!="firebase"){
                            return (<div className="form-group label-floating is-empty">
                                <label className="control-label">Message title</label>
                                <input type="text" className="form-control" value={this.state.title} onChange={this.handleChangeTitle} />
                            <span className="material-input"></span></div>)}else{ return (<div></div>)}
    }


  render() {
    return (
    <div>
        {/* NOTIFICATIONS */}
        {this.state.status.map((value, index)=>{
            return (
            <div className="col-md-12">
                <Notification closeCallback={this.callbackCloseNotification} closeCallbackParam={index} type="success">The notification has been sent to {value} devices.</Notification>
            </div>
            )
        })}


      <div className="row">
      	<div className="col-md-6">
            <div className="card">
                <div className="card-header card-header-icon" data-background-color="rose">
                    <i className="material-icons">mail_outline</i>
                </div>
                <div className="card-content">
                    <h4 className="card-title">Send push notification with {Config.pushSettings.pushType=="firebase"?"Firebse":"OneSignal"}</h4>
                    <form onSubmit={Config.pushSettings.pushType=="firebase"?this.handleSubmitFirebase:this.handleSubmitOneSignal}>
                        {this.displayTitle()}
                        <div className="form-group label-floating is-empty">
                            <label className="control-label">Message text</label>
                            <input type="text" className="form-control" value={this.state.value} onChange={this.handleChange} />
                        <span className="material-input"></span></div>

                        <button type="submit" className="btn btn-fill btn-rose">Submit</button>
                    </form>
                </div>
            </div>
        </div>
        <div className="col-md-6">
            <div className="card" style={{backgroundColor: Config.adminConfig.pushNotification.backgroundColor}}>
                <div className="card-header card-header-icon" data-background-color="rose">
                    <i className="material-icons">smartphone</i>
                </div>
                <div className="card-content">
                    <h4 className="card-title">Preview</h4>
                    <div className="card" style={{minHeight:141}}>
                        <div className="row" style={{marginLeft:0, marginTop:10}}>
                            <div className="col-xs-2">
                                <img src={Config.adminConfig.pushNotification.notificationLogo} style={{width:20}} />
                            </div>
                            <div className="col-xs-2" style={{padding:0}}>
                                <span style={{fontSize:16, fontWeight:"bold"}}>{Config.adminConfig.appName}</span>
                            </div>
                            <div className="col-xs-2" style={{float: "right", marginRight:10}}>
                                <span style={{fontSize:10, fontWeight:"bold"}}>{Config.adminConfig.pushNotification.notificationTimeText}</span>
                            </div>
                        </div>
                        <hr style={{marginTop:10}} />
                        <div className="row" style={{marginLeft:30}}>
                            <span style={{fontSize:16}}>{this.state.title}  {Config.pushSettings.pushType=="firebase"?"":<br />}</span>
                            <span style={{fontSize:16}}>{this.state.value}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
      </div>
    )
  }
}
export default App;
