import React, {Component,PropTypes} from 'react'

class Select extends Component {

  constructor(props) {
    super(props);
    this.state = {
      value:props.value,
    };
    this.handleChange=this.handleChange.bind(this);
    this.createOption=this.createOption.bind(this);
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
    console.log(event.target.value);
    this.props.updateAction(this.props.theKey,event.target.value);
  }

  createOption(value){
    return (<option value={value}>{this.capitalizeFirstLetter(value)}</option>)
  }

  render() {
    return (
            <div className="form-group label-floating is-empty">
                <label className="control-label"></label>
                <select className={this.props.class+" form-control"} value={this.state.value} onChange={this.handleChange}>
                  {this.props.options.map((val)=>{
                    return this.createOption(val)
                  })}
                </select>
            </div>
    )
  }
}
export default Select;

Select.propTypes = {
    updateAction:PropTypes.func.isRequired,
    theKey: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    class: PropTypes.string
};
