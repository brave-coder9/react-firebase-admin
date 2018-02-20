import React, {Component,PropTypes} from 'react';
import Config from   '../../config/app';
import Common from '../../common.js';
import { Link, IndexLink, withRouter } from 'react-router';

const $ = require('jquery');
$.DataTable = require('datatables.net');

class Table extends Component {

  constructor(props) {
    super(props);
    this.state = {
      headers:this.props.headers
    };
    this.createTableRow=this.createTableRow.bind(this);
    this.deleteAction=this.deleteAction.bind(this);
  }

  /**
  * componentDidMount event of React, fires when component is mounted and ready to display
  * Start connection to firebase
  */
  componentDidMount() {
    console.log(this.props);

    if(this.props.headers&&this.props.headers.length>0){
      //We already know who are our headers,preset
    }else{
      //Loop throught all items ( in data ) to find our headers
      var headers=[]
      var headersCounter={};
      for (var i = 0; i < this.props.data.length; i++) {

        //The type of our array items
        var parrentType=Common.getClass(this.props.data);
        var type=Common.getClass(this.props.data[i]);
        console.log("parrentType type is "+parrentType);
        console.log("Inside type is "+type);

        //OBJECTS INSIDE
        if(type=="Object"){

          //In CASE we have OBJECT as array items
          for (var key in this.props.data[i]) {
              // skip loop if the property is from prototype
              if (!this.props.data[i].hasOwnProperty(key)) continue;

              var obj = this.props.data[i][key];
              var objType = Common.getClass(obj);

              //Consider onyl String, Bool, Number
              if((objType==="String"||objType==="Boolean"||objType==="Number")&&key!="uidOfFirebase"){
                if(headersCounter[key]){
                  headersCounter[key]++
                }else{
                  headersCounter[key]=1;
                }
              }
          }
        }

        //STRING INSIDE
        else if(type=="String"){
          headers=["Value"];
          headersCounter["Value"]=1;
          break;
        }
      }

      console.log("headersCounter")
      console.log(headersCounter)
      //END looking for headers

     var numHeadersCounter=0;
     for (var key in headersCounter) {
       numHeadersCounter++;
     }

     console.log("numHeadersCounter "+numHeadersCounter);

     //ARRAYS INSIDE
     if(numHeadersCounter==0){
       console.log("Make it ArtificialArray");
       headers=["Items"];
       headersCounter["Items"]=1;
       type="ArtificialArray"; //Artificial
     }

      //Now we have the headers, with their number of occurences
      //Convert object to array
      var headersCounterAsArray=[];
      for (var key in headersCounter) {
        headersCounterAsArray.push({key:key,counter:headersCounter[key]})
      }


      headersCounterAsArray.sort(function(b, a) {
        return parseFloat(a.counter) - parseFloat(b.counter);
      });

      console.log("headersCounterAsArray length "+headersCounterAsArray.length)
      console.log(headersCounterAsArray)


      //Pick headers based on their number of appereances 2
      headers=[];
      for (var k = 0; k < headersCounterAsArray.length && k<Config.adminConfig.maxNumberOfTableHeaders; k++) {
        console.log("Is it ok "+(k < headersCounterAsArray.length && k<Config.adminConfig.maxNumberOfTableHeaders))
        headers.push(headersCounterAsArray[k].key)
      }

      //Update the state
      console.log(headers);
      this.setState({headers:headers,type:type});

    }

    //
    // response proc with datatable which is id=myTable
    //
    // var self = this;
    // $.noConflict();
    $('#myTable').DataTable({
      "pagingType": "full_numbers",
      responsive: true,
      language: {
          search: "_INPUT_",
          searchPlaceholder: "Search records",
      }
      // "fnDrawCallback": function() {		  		
      //   self.forceUpdate();        	
      // }
    });
  }

  componentDidUpdate() {
    // response proc with myTable which is id=myTable
    // $('#myTable').DataTable({
    //   "bAutoWidth": false,
    //   "bDestroy": true,	
    // });
  }

  deleteAction(index){
    console.log(index);
    this.props.deleteFieldAction(index,true);
  }



  createTableRow(item,index){
    var theLink=this.props.routerPath.replace(":sub","")+this.props.sub;
    if(this.props.fromObjectInArray){
        theLink+=Config.adminConfig.urlSeparator+item.uidOfFirebase;
    }else{
        if(this.props.isJustArray){
            theLink+=Config.adminConfig.urlSeparator+index;
        }else{
            theLink+=Config.adminConfig.urlSeparator+this.props.name+"+"+index;
        }
    }

    //theLink="/fireadmin/Categories/items+0+"+this.props.name+"+"+index;
    //theLink="/"
    //console.log(theLink);
    return (
      <tr >
        {this.state.headers ? 
          this.state.headers.map((key,subindex)=>{
            if(Config.adminConfig.fieldsTypes.photo.indexOf(key)>-1){
              //This is photo
              return (<td ><div className="tableImageDiv" ><Link to={theLink}><img className="tableImage"  src={item[key]}  width={"200px"} /></Link></div></td>)
            }else{
              //Normal value
              //But can be string
              if(this.state.type=="String"){
                  return subindex==0?(<td><Link to={theLink}>{item}</Link></td>):(<td>{item}</td>)
              }
              if(this.state.type=="ArtificialArray"){
                  return subindex==0?(<td><Link to={theLink}>{"Item "+(index+1)}</Link></td>):(<td>{"Item "+(index+1)}</td>)
              }else{
                  return subindex==0?(<td ><Link to={theLink}>{item[key]}</Link></td>):(<td key={subindex}>{item[key]}</td>)
              }
            }
          })
          :
          <td></td>
        }
        <td className="text-right">
          <div>
            <Link to={theLink}>
              <span className="btn btn-simple btn-warning btn-icon edit"><i className="material-icons">mode edit</i></span>
            </Link>
            <a onClick={()=>{ this.deleteAction(this.props.fromObjectInArray?item.uidOfFirebase:index)}}><span className="btn btn-simple btn-danger btn-icon delete"><i className="material-icons">delete</i></span></a>
          </div>
        </td>
      </tr>
    )
  }

  render() {
    return (

      <table id="myTable" className="table datatable table-striped table-no-bordered table-hover">
        {/*JSON.stringify(this.props.data)*/}
                                                  <thead>
                                                      <tr>
                                                      {this.state.headers?this.state.headers.map((akey, index)=>{
                                                        return (<th key={index}>{Common.capitalizeFirstLetter(akey)}</th>)
                                                      }):""}
                                                          <th className="disabled-sorting text-right">Actions</th>
                                                      </tr>
                                                  </thead>
                                                  <tfoot>
                                                      <tr>
                                                      {this.state.headers?this.state.headers.map((key, index)=>{
                                                        return (<th key={index}>{Common.capitalizeFirstLetter(key)}</th>)
                                                      }):""}
                                                          <th className="disabled-sorting text-right">Actions</th>
                                                      </tr>
                                                  </tfoot>
                                                  <tbody>
                                                      {this.props.data?this.props.data.map((item,index)=>{
                                                        return this.createTableRow(item,index);
                                                      }):""}
                                                  </tbody>
                                              </table>
    )
  }
}
export default Table;

Table.propTypes = {
    data:PropTypes.array.isRequired,
    headers: PropTypes.array.isRequired,
    routerPath: PropTypes.string.isRequired,
    isJustArray: PropTypes.bool.isRequired,
    sub:PropTypes.string,
    fromObjectInArray:PropTypes.bool.isRequired,
    deleteFieldAction:PropTypes.func.isRequired,
};
