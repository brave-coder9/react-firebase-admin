import React, {Component,PropTypes} from 'react'
import firebase from '../../config/database'

class Relation extends Component {

  constructor(props) {
    super(props);

    this.state = {
      value:props.value,
      options:[]
    };
    this.handleChange=this.handleChange.bind(this);
    this.createOption=this.createOption.bind(this);
    this.findFirebaseRelatedData=this.findFirebaseRelatedData.bind(this);
  }

  /**
   * Step 0a
   * Start getting data
   */
  componentDidMount(){
      this.findFirebaseRelatedData();
  }

  findFirebaseRelatedData(){
    //console.log("findFirebaseRelatedData");
    //console.log(this.props.options);
    var _this=this;
    var ref=firebase.database().ref(this.props.options.path);
    ref.once('value').then(function(snapshot) {
      var data=snapshot.val();
      //console.log(data);
      var optionsFromFirebse=[];
      for (var key in data) {
        if (data.hasOwnProperty(key)) {
          var currentItem=data[key];

          var newOption={
            value:_this.props.options.isValuePath?_this.props.options.path+"/"+key:currentItem[_this.props.options.value],
            name:currentItem[_this.props.options.display],
          }
          //console.log(newOption);
          optionsFromFirebse.push(newOption);
        }
      }//End loop

      _this.setState({options:optionsFromFirebse})


    });
  }


  capitalizeFirstLetter(string) {
    string=string+"";
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
    //console.log(event.target.value);
    this.props.updateAction(this.props.theKey,event.target.value);

    //Next, check if we have relaton field
    var optionsForTheSelector=this.props.options;
    if(optionsForTheSelector.produceRelationKey){
      var joinFiledName=optionsForTheSelector.relationKey;
      var joinFieldValue=event.target.value+optionsForTheSelector.relationJoiner+this.props.parentKey;
      //console.log("Produce field:"+joinFiledName);
      //console.log("Produce value:"+joinFieldValue);
      this.props.updateAction(joinFiledName,joinFieldValue);
    }
  }

  createOption(value){
    return (<option value={value.value}>{this.capitalizeFirstLetter(value.name)}</option>)
  }

  render() {
    return (
            <div className="form-group label-floating is-empty">
                <label className="control-label"></label>
                <select className={this.props.class+" form-control"} value={this.state.value} onChange={this.handleChange}>
                  {this.state.options.map((val)=>{
                    return this.createOption(val)
                  })}
                </select>
            </div>
    )
  }
}
export default Relation;

Relation.propTypes = {
    updateAction:PropTypes.func.isRequired,
    theKey: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    parentKey: PropTypes.any.isRequired,
    class: PropTypes.string
};
