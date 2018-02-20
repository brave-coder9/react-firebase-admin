/**
* EXPERIMENTAL, Not in production
*/
import React, {Component,PropTypes} from 'react'

class Tags extends Component {

  constructor(props) {
    super(props);
    this.state = {
      value:props.value,
    };
    this.handleChange=this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
    console.log(event.target.value);
    //this.props.updateAction(this.props.theKey,event.target.value);
  }

  render() {
    return (
            <div className="form-group label-floating is-empty">
                <label className="control-label"></label>
                <input type="text" data-role="tagsinput" data-color="rose" value={this.state.value} onBlur={this.handleChange}  />
            </div>
    )
  }
}
export default Tags;
