import React, {Component,PropTypes} from 'react'
import {Input,DateTime,Tags,Radio,CheckBox,TextArea,Select,Image,HTML,File,Color,Relation,Icons} from './index'
import Config from   '../../config/app';
import Common from '../../common.js'

class Fields extends Component {

  constructor(props) {
    super(props);
    this.state = {
      fields:{},
      arrays:{},
      elements:{}
    };
    this.displayFields=this.displayFields.bind(this);
  }


  getOptions(key){
    //Look Into the static options
    var options=Config.adminConfig.optionsForSelect;
    for (var i = 0; i < options.length; i++) {
      if(options[i].key==key){
        return options[i].options;
      }
    }

    //Look into relations
    var options=Config.adminConfig.optionsForRelation;
    for (var i = 0; options&&i < options.length; i++) {

      //This is if we have found the coorect key
      if(options[i].key==key){
        console.log(options[i])
        return options[i];
      }

    }

    return [];
  }

  displayFields(){
    var ft=Config.adminConfig.fieldsTypes; //Our field types
    var currentElementName=this.props.theKey; //Current key, the current element name, example, name, desciption, created_at
    var options=this.getOptions(this.props.theKey) //Options for current key
    var elementClass="";

    //By Default our new element will be Text Input
    var Element=Input;

    //Now go over our fieldsTypes to check if current key belongs to some special field type
    for (var key in ft) {
        // skip loop if the property is from prototype
        if (!ft.hasOwnProperty(key)) continue;


        var obj = ft[key];
        if(obj.indexOf(currentElementName)!=-1){

          //Get the field type by they key used
          switch (key) {
              case "iconmd":
                {
                  Element = Icons;
                  elementClass="MaterialIcons"
                }
                break;
                case "iconfa":
                  {
                    Element = Icons;
                    elementClass="FontAwesome"
                  }
                  break;
                case "iconti":
                  {
                    Element = Icons;
                    elementClass="Typicons"
                  }
                  break;
                case "icongo":
                  {
                    Element = Icons;
                    elementClass="Octicons"
                  }
                  break;
              case "relation":
                {
                  Element = Relation;
                }
                break;
              case "rgbaColor":
                  {
                    Element = Color;
                    elementClass="rgba"
                  }
                  break;
              case "hexColor":
                  {
                    Element = Color;
                    elementClass=""
                  }
                  break;
              case "file":
                Element = File;
                break;
              case "photo":
                  Element = Image;
                  break;
              case "maps":
                  Element = Input;
                  break;
              case "textarea":
                  Element = TextArea;
                  break;
              case "html":
                  Element = HTML;
                  break;
              case "radio":
                  Element = Radio;
                  break;
              case "checkbox":
                  Element = CheckBox;
                  break;
              case "dropdowns":
                  Element = Select;
                  break;
              case "bools":
                  Element = Select;
                  break;
              case "dateTime":
                  {
                    Element = DateTime;
                    elementClass="datetimepicker"
                  }
                  break;
              case "date":
                  {
                    Element = DateTime;
                    elementClass="datepicker"
                  }
                  break;
              case "time":
                  {
                    Element = DateTime;
                    elementClass="timepicker"
                  }
                  break;
          }
        }
    }

    //Now produce the element
    return <Element readonly={this.props.readonly} parentKey={this.props.parentKey} options={options} updateAction={this.props.updateAction} class={elementClass} theKey={this.props.theKey} value={this.props.value} />
  }

  render() {
    return (
      <div key={this.props.theKey} className="card-content">
        <div className="row">
          <label className="col-sm-3 label-on-left">{Common.capitalizeFirstLetter(this.props.theKey)}</label>
          <div className="col-sm-8">
          {this.displayFields()}
          </div>
          {!this.props.readonly && 
          <div className="col-sm-1">
            <a onClick={()=>{this.props.deleteFieldAction(this.props.theKey)}} ><span className="btn btn-simple  btn-icon edit label-on-left"><i className="material-icons">remove_circle_outline</i></span></a>
          </div>
          }
        </div>
      </div>
    )
  }
}
export default Fields;
