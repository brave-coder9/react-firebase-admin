import React, {Component,PropTypes} from 'react'
import * as FontAwesome from 'react-icons/lib/fa';
import * as MaterialIcons from 'react-icons/lib/md';
import * as Typicons from 'react-icons/lib/ti';
import * as Octicons from 'react-icons/lib/go';


class Icons extends Component {

  constructor(props) {
    super(props);
    this.state = {
      value:props.value,
      options:[],
    };
    this.handleChange=this.handleChange.bind(this);
    this.createOption=this.createOption.bind(this);
    this.createTheIcon=this.createTheIcon.bind(this);
    this.handleClick=this.handleClick.bind(this);
  }

  componentDidMount(){
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
    console.log(event.target.value);
  }

  handleClick(value) {
    console.log('The link was clicked. '+value);
    this.setState({value:value})
    this.props.updateAction(this.props.theKey,value);
  }

  createOption(value){
    //console.log(value);
    var handler=this.getHandler();
    var Element=handler[value+""];
    return (<li><a  onClick={(e)=>{e.preventDefault();this.handleClick(value)}} ><Element color='black' size="20" />{"    "+value+""}</a></li>)
  }

  createTheIcon(){

    var handler=this.getHandler();
    var defaultIcon=this.getDefaultIncon();;
    var icon=this.state.value&&this.state.value.length>2?this.state.value:defaultIcon;

    console.log("Icon is:"+icon);
    var Element=handler[icon];
    return <Element />
  }

  getHandler(){
    var handler=FontAwesome;
    if(this.props.class=="MaterialIcons"){
      handler=MaterialIcons;
    }
    if(this.props.class=="Typicons"){
      handler=Typicons;
    }
    if(this.props.class=="Octicons"){
      handler=Octicons;
    }
    return handler;
  }

  getDefaultIncon(){
    var defaultIcon="FaQuestion";
    if(this.props.class=="MaterialIcons"){
      defaultIcon="MdHelpOutline";
    }
    if(this.props.class=="Typicons"){
      defaultIcon="TiZoomOutline";
    }
    if(this.props.class=="Octicons"){
      defaultIcon="GoEye";
    }
    return defaultIcon;
  }

   renderTheIcons(){
    var handler=this.getHandler();
    return (Object.keys(handler).map((val)=>{
        return this.createOption(val)
      }))

  }

  render() {
    return (
            <div className="form-group label-floating is-empty">
                <label className="control-label"></label>
                <div className="dropdown">
                  <button data-toggle="dropdown" aria-expanded="false" className="btn btn-primary btn-round btn-fab btn-fab">
                    {this.createTheIcon()}
                    <div className="ripple-container"></div>
                  </button>
                  <ul  className="dropdown-menu dropdown-menu-left scrollable-menu">
                      <li className="dropdown-header">Select your icon</li>
                      {this.renderTheIcons()}

                  </ul>
                </div>






            </div>
    )
  }
}
export default Icons;

Icons.propTypes = {
    updateAction:PropTypes.func.isRequired,
    theKey: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    class: PropTypes.string
};
