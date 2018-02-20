import React, {Component,PropTypes} from 'react'
class Indicator extends Component {
  constructor(props){
    super(props)
  }


  render() {
    if(this.props.show){
      return (<img style={{width:20,height:20}} src="http://www.ajaxload.info/cache/FF/FF/FF/00/00/00/5-1.gif" />)
    }else{
      return (<div></div>)
    }
  }
}
export default Indicator;
