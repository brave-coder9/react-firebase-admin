import React, {Component,PropTypes} from 'react'
import firebase from '../../config/database'
import Indicator from '../Indicator'

class Image extends Component {

  constructor(props) {
    super(props);
    this.state = {
      value:props.value,
        isLoading:false,
    };
    this.handleChange=this.handleChange.bind(this);
    this.submitImageToFirebase=this.submitImageToFirebase.bind(this);
    this.saveImageLinkInFirebase=this.saveImageLinkInFirebase.bind(this);
  }

  saveImageLinkInFirebase(link){
    console.log(link);
    this.setState({isLoading:false});
    this.props.updateAction(this.props.theKey,link);
  }

  submitImageToFirebase(value){
    var _this=this;
    // Create a root reference
    var storageRef = firebase.storage().ref();
    var refFile=new Date().getTime()+".jpg"

    // Create a reference to 'mountains.jpg'
    var newImageRef = storageRef.child(refFile);
    var stripedImage=value.substring(value.indexOf('base64')+7, value.length);

    newImageRef.putString(stripedImage, 'base64').then(function(snapshot) {
      console.log('Uploaded a base64 string!');
      _this.saveImageLinkInFirebase(snapshot.downloadURL);
    });
  }

  handleChange(e) {
    this.setState({isLoading:true});
     e.preventDefault();
    console.log("Start processing ....")

    let reader = new FileReader();
    let file = e.target.files[0];

    reader.onloadend = () => {
      console.log("Image is in base 64 now.. Upload it");
      this.setState({
        file: file,
        value: reader.result
      });
      this.submitImageToFirebase(reader.result)

    }

    reader.readAsDataURL(file)

  }

  render() {
    var imgSrc=this.state.value&&this.state.value.length>4?this.state.value:"../../assets/img/image_placeholder.jpg";
    return (

      <div className="fileinput fileinput-new text-center" data-provides="fileinputaa">
        <div className="fileinput-new thumbnail">
            <img src={imgSrc} alt="..." />
        </div>
        <div className="fileinput-preview fileinput-exists thumbnail"></div>
        <div>
            <span className="btn btn-rose btn-round btn-file">
                <span className="fileinput-new">Select image</span>
                <span className="fileinput-exists">Change</span>
                <input type="file" id={this.props.theKey} name={this.props.theKey}  onChange={this.handleChange} />
            </span>
            <Indicator show={this.state.isLoading} />
            <a href="#pablo" className="btn btn-danger btn-round fileinput-exists" data-dismiss="fileinput"><i className="fa fa-times"></i> Remove</a>
        </div>
    </div>
    )
  }
}
export default Image;

Image.propTypes = {
    updateAction:PropTypes.func.isRequired,
    theKey: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    class: PropTypes.string
};
