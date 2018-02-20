import React, {Component} from 'react'
import ReactDOM from 'react-dom';
import {Link, hashHistory } from 'react-router'
import firebase from '../config/database'
import Fields from '../components/fields/Fields.js';
import Input from '../components/fields/Input.js';
import Table from  '../components/tables/Table.js'
import Config from   '../config/app';
import Common from '../common.js';
import Notification from '../components/Notification';
import SkyLight from 'react-skylight';
import INSERT_STRUCTURE from "../config/schema.json";
import FirebasePaginator from "firebase-paginator";
import moment from 'moment';
import submitOneSignal from '../utils/SendPushNotification';

/**
* Main logic to present fields and arrays
*/
class Fireadmin extends Component {

  //Constructor of the component
  constructor(props) {
    super(props);
    this.state = {
      fields:{}, //The editable fields, textboxes, checkbox, img upload etc..
      arrays:{}, //The array of data
      elements:[], //The elements - objects to present
      elementsInArray:[], //The elements put in array
      directValue:"", //Direct access to the value of the current path, when the value is string
      firebasePath:"",
      arrayNames:[],
      currentMenu:{},
      completePath:"",
      lastSub:"",
      isJustArray:false,
      currentInsertStructure:null,
      notifications:[],
      lastPathItem:"",
      pathToDelete:null,
      isItArrayItemToDelete:false,
      page:1,
      isLastPage:false,

      newItemCompletePath: null,
      isCheckedPN: false,
    };
    this.processRecords = this.processRecords.bind(this);
    this.updateAction = this.updateAction.bind(this);
    this.getDataFromFirebase=this.getDataFromFirebase.bind(this);
    this.findFirebasePath=this.findFirebasePath.bind(this);
    this.findCurrentSchema=this.findCurrentSchema.bind(this);
    this.addItemToArray=this.addItemToArray.bind(this);
    this.addNewObject=this.addNewObject.bind(this);
    this.updateModalViewState=this.updateModalViewState.bind(this);
    this.makeTableCardForElementsInArray=this.makeTableCardForElementsInArray.bind(this);
    this.makeDashboardCardForEmementsInArray = this.makeDashboardCardForEmementsInArray.bind(this);
    this.addKey=this.addKey.bind(this);
    this.refreshDataAndHideNotification=this.refreshDataAndHideNotification.bind(this);
    this.resetDataFunction=this.resetDataFunction.bind(this);
    this.cancelDelete=this.cancelDelete.bind(this);
    this.doDelete=this.doDelete.bind(this);
    this.deleteFieldAction=this.deleteFieldAction.bind(this);
    this.firebaseRef=null;
    this.firebasePath=null;
    this.firebasePathIsHead = this.firebasePathIsHead.bind(this);
    this.goNext=this.goNext.bind(this);
    this.goPrevious=this.goPrevious.bind(this);
    this.getLastPathItem=this.getLastPathItem.bind(this);

    this.newItemCreate=this.newItemCreate.bind(this);
    this.newItemRemove=this.newItemRemove.bind(this);
    this.handlePNCheck=this.handlePNCheck.bind(this);
    this.isStartedNewItem=false;
    this.notificationMessage="";
  }

  handlePNCheck() {
    this.setState({isCheckedPN: !this.state.isCheckedPN});
  }

  newItemCreate() {
    if (this.state.isCheckedPN)
    {
      // check push notification
      console.log("Sending push notification...");
      var notificationTitle = Config.adminConfig.pushNotification.notificationTitle;
      var notificationMessage = this.notificationMessage;

      submitOneSignal((err, res) => {
          if (err) {
            console.log("submitOneSignal - error : ", err);
            //Notify
            this.setState({notifications:[{type:"danger",content:`We couldn't send the push notification: ${err.message}`}]});
            this.refreshDataAndHideNotification(false,5000);
          } else {
            console.log("submitOneSignal - result : ", res);
            //Notify
            this.setState({notifications:[{type:"success",content:"The push notification has sent successfully."}]});
            this.refreshDataAndHideNotification(false,3500);
          }
        }, notificationMessage, notificationTitle);

    }

    var completePath = this.state.newItemCompletePath;
    // clear the state - about newItem
    this.isStartedNewItem = false;
    this.setState({newItemCompletePath: null, isCheckedPN: false});
    // navigate to the past URL
    var index = completePath.lastIndexOf("+");
    var prevPath = completePath.substr(0, index);
    prevPath = prevPath.replace(/\//g,"+");
    hashHistory.push("/fireadmin/" + prevPath);
  }

  newItemRemove() {
    if (this.state.newItemCompletePath == null)
      return;

    // delete from firebase-db
    var firebasePathToDelete = this.state.newItemCompletePath;
    if (firebasePathToDelete.indexOf("+") > 0) {
      firebasePathToDelete = firebasePathToDelete.replace(/\+/g,"/");

      firebase.database().ref(firebasePathToDelete).set(null).then((e)=>{
        console.log("Delete res: "+e)
        this.refs.deleteDialog.hide();
        this.resetDataFunction();
      });
    }

    // clear the state - about newItem
    this.isStartedNewItem = false;
    this.setState({newItemCompletePath: null, isCheckedPN: false});

    // navigate to the past URL
    // var index = firebasePathToDelete.lastIndexOf("/");
    // var prevPath = firebasePathToDelete.substr(0, index);
    // if (prevPath == this.state.firebasePath) {
    //   prevPath = prevPath.replace(/\//g,"+");
    //   hashHistory.push("/fireadmin/" + prevPath);
    // }
}

  /**
   * Step 0a
   * Start getting data
   */
  componentDidMount(){
    console.log("lifecycle - DidMount: newItemCompletePath = " + this.state.newItemCompletePath);
    this.findFirebasePath();
  }

  componentWillUnmount() {
    console.log("lifecycle - WillUnmount: newItemCompletePath = " + this.state.newItemCompletePath);
    this.newItemRemove();
  }
  

  /**
  * Step 0b
  * Resets data function
  */
  resetDataFunction(){
    var fields={};
    var arrays={};
    var elements=[];
    var elementsInArray=[];
    var newState={};
    newState.fieldsAsArray=[];
    newState.arrayNames=[];
    newState.fields=fields;
    newState.arrays=arrays;
    newState.elements=elements;
    newState.elementsInArray=elementsInArray;
    //newState.notifications=[];

    newState.page=0;
    newState.isLastPage=false;

    this.setState(newState);
    this.findFirebasePath();
  }

  /**
   * Step 0c
   * componentDidMount event of React, fires when component is mounted and ready to display
   * Start connection to firebase
   */
  componentWillReceiveProps(nextProps, nextState) {
      console.log("Next SUB: "+nextProps.params.sub);
      console.log("Prev SUB : "+this.props.params.sub);
      //if(this.state.lastSub==)
      if(nextProps.params.sub==this.props.params.sub){
          console.log("update now");
          this.resetDataFunction();
      }
  }

  /**
   * Step 1
   * Finds out the firebase path
   * Also creates the path that will be used to access the insert
   */
  findFirebasePath(){
      var pathData={}
      if(this.props.params&&this.props.params.sub){
          pathData.lastSub=this.props.params.sub;
      }

      //Find the firebase path
      var firebasePath=(this.props.route.path.replace("/fireadmin/","").replace(":sub",""))+(this.props.params&&this.props.params.sub?this.props.params.sub:"").replace(/\+/g,"/");
      console.log("firebasePath:"+firebasePath)
      pathData.firebasePath=firebasePath;

      //Find last path
      var subPath=this.props.params&&this.props.params.sub?this.props.params.sub:""
      var items=subPath.split(Config.adminConfig.urlSeparator);
      pathData.lastPathItem=Common.capitalizeFirstLetter(items[items.length-1]);
      pathData.completePath=subPath;

      this.setState(pathData)

      //Go to next step of finding the insert data
      this.findCurrentSchema(firebasePath);
  }

  /**
   * Step 2
   * Cretes the insert schema,could be empty
   * @param firebasePath - real firebase path
   */
  findCurrentSchema(firebasePath){
      console.log("Search for the schema now of "+firebasePath);

      //TODO find the insert schema
      var theInsertSchemaObject=INSERT_STRUCTURE;

      var chunks = firebasePath.split("/");
      console.log("CHUNKS");
      console.log(chunks);
      chunks.map((item,index)=>{
          if(!isNaN(item)){
              item=0;
          }


          //Also make the last object any
          var isLastObject=(index==(chunks.length-1)&&chunks.length>1)

          if(isLastObject&&theInsertSchemaObject!=null){
            theInsertSchemaObject=theInsertSchemaObject[Object.keys(theInsertSchemaObject)[0]];
          }else if(theInsertSchemaObject&&theInsertSchemaObject[item]){
              theInsertSchemaObject=theInsertSchemaObject[item];
          }else if(theInsertSchemaObject){
              theInsertSchemaObject = theInsertSchemaObject[Object.keys(theInsertSchemaObject)[0]];
          }else{
              theInsertSchemaObject=null;
          }

      })
      console.log(theInsertSchemaObject);
      this.setState({currentInsertStructure:theInsertSchemaObject})

      //Go to next step. fetching data
      this.getDataFromFirebase(firebasePath);
  }

  /**
   * Step 3
   * Connect to firebase to get the current item we need
   */
   getDataFromFirebase(firebasePath){
     //The paging options
     var options = Config.adminConfig.paging||{
      pageSize: 20,
      finite: true,
      retainLastPage: false
    };
    var ref=firebase.database().ref(firebasePath);
    var paginator = new FirebasePaginator(ref,options);
    var _this=this;

    // Callback pattern
    paginator.on('value', function() {
      _this.processRecords(paginator.collection)
    });

    paginator.on('isLastPage',function(){
      _this.setState({
        isLastPage:true,
      })
    })
    this.paginator=paginator;
   }

   /**
    * Step 3a
    * Go next in paging the data
    */
    goNext=()=>{
      if(this.state.page>1){
        this.setState({
          page:(this.state.page-1),
          isLastPage:false,
        })
        console.log("Next")
        this.paginator.next();
      }

    }

    firebasePathIsHead() {
      var fireadminPath = this.state.firebasePath;
      var index = fireadminPath.lastIndexOf("/");
      if (index > 0) {
        return false;
      }
      return true;
   }

    /**
     * Step 3a
     * Go previous in paging the data
     */
     goPrevious(e) {
       if (this.firebasePathIsHead() == false) {
         var fireadminPath = this.state.firebasePath;
         var index = fireadminPath.lastIndexOf("/");
         var prevPath = this.state.firebasePath.substr(0, index);
         prevPath = prevPath.replace(/\//g,"+");
         hashHistory.push("/fireadmin/" + prevPath);
         return;
       }
       
       if(!this.state.isLastPage){
         this.setState({
           page:this.state.page+1
         })
         console.log("Previous")
         this.paginator.previous();
       }
     }





  /**
   * Step 4
   * Processes received records from firebase
   * @param {Object} records
   */
  processRecords=(records)=>{
      console.log(records);

      var fields={};
      var arrays={};
      var elements=[];
      var elementsInArray=[];
      var newState={};
      var directValue="";
      newState.fieldsAsArray=fieldsAsArray;
      newState.arrayNames=arrayNames;
      newState.fields=fields;
      newState.arrays=arrays;
      newState.elements=elements;
      newState.directValue=directValue;
      newState.elementsInArray=elementsInArray;

      this.setState(newState);

      //Each display is consisted of
      //Fields   - This are string, numbers, photos, dates etc...
      //Arrays   - Arrays of data, ex items:[0:{},1:{},2:{}...]
      //         - Or object with prefixes that match in array
      //Elements - Object that don't match in any prefix for Join - They are represented as buttons.

      //If record is of type array , then there is no need for parsing, just directly add the record in the arrays list
      if(Common.getClass(records)=="Array"){
          //Get the last name
          console.log("This is array");
          var subPath=this.props.params&&this.props.params.sub?this.props.params.sub:""
          var allPathItems=subPath.split("+");
          console.log(allPathItems)
          if(allPathItems.length>0){
              var lastItem=allPathItems[allPathItems.length-1];
              console.log(lastItem);
              arrays[lastItem]=records;

          }
          //this.setState({"arrays":this.state.arrays.push(records)})
      }else if(Common.getClass(records)=="Object"){
          //Parse the Object record
          for (var key in records){
              if (records.hasOwnProperty(key)) {
                  var currentElementClasss=Common.getClass(records[key]);
                  console.log(key + "'s class is: " + currentElementClasss);

                  //Add the items by their type
                  if(currentElementClasss=="Array"){
                      //Add it in the arrays  list
                      arrays[key]=records[key];
                  }else if(currentElementClasss=="Object"){
                      //Add it in the elements list
                      var isElementMentForTheArray=false; //Do we have to put this object in the array
                      for (var i=0;i<Config.adminConfig.prefixForJoin.length;i++){
                          if(key.indexOf(Config.adminConfig.prefixForJoin[i])>-1){
                              isElementMentForTheArray=true;
                              break;
                          }
                      }

                      var objToInsert=records[key];
                      objToInsert.uidOfFirebase=key;

                      //zzz+
                      if (objToInsert.approved !== undefined) {
                        if (objToInsert.approved == true)
                          objToInsert.approved = "True";
                        else
                          objToInsert.approved = "False";
                      }
                      //zzz-

                      if(isElementMentForTheArray){
                          //Add this to the merged elements
                          elementsInArray.push(objToInsert);
                      }else{
                          //Add just to elements
                          elements.push(objToInsert);
                      }

                  }else if(currentElementClasss!="undefined"&&currentElementClasss!="null"){
                      //This is string, number, or Boolean
                      //Add it to the fields list
                      fields[key]=records[key];
                  }
              }
          }
      }if(Common.getClass(records)=="String"){
        console.log("We have direct value of string");
        directValue=records;
      }

      //Convert fields from object to array
      var fieldsAsArray=[];
      console.log("Add the items now inside fieldsAsArray");
      console.log("Current schema");
      console.log(this.state.currentInsertStructure)
      //currentInsertStructure
      var keysFromFirebase=Object.keys(fields);
      console.log("keysFromFirebase = ", keysFromFirebase);
      var keysFromSchema=Object.keys(this.state.currentInsertStructure);
      console.log("keysFromSchema = ", keysFromSchema);

      keysFromSchema.forEach((key)=>{
        if (fields.hasOwnProperty(key)) {
          fieldsAsArray.push({"theKey":key,"value":fields[key]})
          var indexOfElementInFirebaseObject = keysFromFirebase.indexOf(key);
          if (indexOfElementInFirebaseObject > -1) {
              keysFromFirebase.splice(indexOfElementInFirebaseObject, 1);
          }
        }
      });

      console.log("keysFromFirebase 2 = ", keysFromFirebase);

      keysFromFirebase.forEach((key)=>{
        if (fields.hasOwnProperty(key)) {
          fieldsAsArray.push({"theKey":key,"value":fields[key]})
        }
      });


      //Get all array names
      var arrayNames=[];
      Object.keys(arrays).forEach((key)=>{
          arrayNames.push(key)
      });

      var newState={};
      newState.fieldsAsArray=fieldsAsArray;
      newState.arrayNames=arrayNames;
      newState.fields=fields;
      newState.arrays=arrays;
      newState.isJustArray=Common.getClass(records)=="Array";
      newState.elements=elements;
      newState.elementsInArray=elementsInArray;
      newState.directValue=directValue;

      console.log("THE elements = ", elements);

      this.setState(newState);

      window.additionalInit();

  }


  /**
   *
   *  STATE UPDATE FUNCTONS
   *
   */

  /**
   * Update modeal view state
   * @param modalName
   * @param isShown
   */
  updateModalViewState(modalName,isShown){
      var objToSave={};
      objToSave[modalName+"Shown"]=isShown;
      this.setState(objToSave)
  }


  /**
   *
   * USER ACTIONS
   *
   */

   addNewObject(){
     console.log("Add new object");

     //Find the object to Insert
     var objToInsert=null;
     var usedPrefix="";

     for (var key in this.state.currentInsertStructure) {
       if (this.state.currentInsertStructure.hasOwnProperty(key)) {
         for (var i=0;i<Config.adminConfig.prefixForJoin.length;i++){
             if(key.indexOf(Config.adminConfig.prefixForJoin[i])>-1){
                 objToInsert=this.state.currentInsertStructure[key];
                 usedPrefix=Config.adminConfig.prefixForJoin[i];
                 break;
             }
         }
       }
     }

     console.log("Object to insert");
     console.log(objToInsert);

     if(objToInsert==null){
       //Notify
       this.setState({notifications:[{type:"danger",content:"We couldn't find object to insert. Check your schema settings."}]});
       this.refreshDataAndHideNotification(false,5000);
     }else{
       if(Config.adminConfig.methodOfInsertingNewObjects=="timestamp"){
         console.log("Insert by timesetamp");
         var uuid = Date.now().toString();
         if (objToInsert.uuid !== undefined) {
           objToInsert.uuid = uuid;
         }
         var keyToCreate=usedPrefix+uuid;
         console.log("Key to Create: "+keyToCreate);
         this.updateAction(keyToCreate,objToInsert,true);

         const newItemCompletePath = this.state.firebasePath + "+" + keyToCreate;
         this.setState({newItemCompletePath});
         hashHistory.push("/fireadmin/" + newItemCompletePath);
        }else{
         console.log("Insert by firebase");
         // Get a key for a new Post.
         var firebasePath=(this.props.route.path.replace("/fireadmin/","").replace(":sub",""))+(this.props.params&&this.props.params.sub?this.props.params.sub:"").replace(/\+/g,"/");
         var keyToCreate = firebase.database().ref(firebasePath).push().key;
         console.log("Key: "+keyToCreate);
         this.updateAction(keyToCreate,objToInsert,true);

         this.setState({notifications:[{type:"success",content:"Element added. You can find it in the table bellow."}]});
         this.refreshDataAndHideNotification();
       }
     }

   }


  addItemToArray(name,howLongItIs){
      console.log("Add item to array "+name);
      console.log("Is just array "+this.state.isJustArray);

      console.log("Data ");
      console.log(this.state.currentInsertStructure);

      var dataToInsert=null;
      var correctPathToInsertIn="";
      if(this.state.currentInsertStructure){
          if(this.state.isJustArray){
              dataToInsert=this.state.currentInsertStructure[0];
              correctPathToInsertIn=this.state.firebasePath+"/"+(parseInt(howLongItIs));
          }else{
              dataToInsert=this.state.currentInsertStructure[name];
              dataToInsert=dataToInsert?dataToInsert[0]:null;
              correctPathToInsertIn=this.state.firebasePath+"/"+name+"/"+(parseInt(howLongItIs)+1);
          }
      }

      console.log("Data to insert");
      console.log(dataToInsert);
      ReactDOM.findDOMNode(this).scrollTop = 0
      if(dataToInsert!=null){

          console.log("Save path: "+correctPathToInsertIn);
              firebase.database().ref(correctPathToInsertIn).set(dataToInsert).then(()=>{
                  this.setState({notifications:[{type:"success",content:"Item is inserted."}]});
                  this.refreshDataAndHideNotification();

              });

      }else{
          this.setState({notifications:[{type:"danger",content:"Error 201: We are missing correct insert schema."}]})
      }
  }

  /**
   * Firebase update based on key / value,
   * This function also sets derect name and value
   * @param {String} key
   * @param {String} value
   */
  updateAction(key,value,dorefresh=false){
      //
      // save value for push notification for a news feed
      //
      if (key == "title") {
        this.notificationMessage = value;
      }

      var firebasePath=(this.props.route.path.replace("/fireadmin/","").replace(":sub",""))+(this.props.params&&this.props.params.sub?this.props.params.sub:"").replace(/\+/g,"/");
      console.log("firebasePath from update:"+firebasePath);
      //zzz+
      if (key == "approved") {
        if (value == "true")
          value = true;
        else if (value == "false")
          value = false;
        else
          console.log("##### (Error) ##### approved: ", value);
      }
      //zzz-
      console.log('Update '+key+" into "+value);
      if(key=="DIRECT_VALUE_OF_CURRENT_PATH"){
        console.log("DIRECT_VALUE_OF_CURRENT_PATH")
        firebase.database().ref(firebasePath).set(value);
      }else if(key=="NAME_OF_THE_NEW_KEY"||key=="VALUE_OF_THE_NEW_KEY"){
        console.log("THE_NEW_KEY")
        var updateObj={};
        updateObj[key]=value;
        this.setState(updateObj);
        console.log(updateObj);
      }else{
        console.log("Normal update")
        firebase.database().ref(firebasePath+"/"+key).set(value).then(()=>{
          console.log("Data is updated");
          console.log("Do refresh "+dorefresh);
          if(dorefresh){
            this.resetDataFunction();
          }
        });
      }
  }



  /**
  * addKey
  * Adds key in our list of fields in firebase
  */
  addKey(){
    if(this.state.NAME_OF_THE_NEW_KEY&&this.state.NAME_OF_THE_NEW_KEY.length>0){
      if(this.state.VALUE_OF_THE_NEW_KEY&&this.state.VALUE_OF_THE_NEW_KEY.length>0){
        this.setState({notifications:[{type:"success",content:"New key added."}]});

        this.updateAction(this.state.NAME_OF_THE_NEW_KEY,this.state.VALUE_OF_THE_NEW_KEY);
        this.refs.simpleDialog.hide()
        this.refreshDataAndHideNotification();
      }
    }
  }

  deleteFieldAction(key,isItArrayItem=false){
    console.log("Delete "+key);
    if(isNaN(key)){
      isItArrayItem=false;
    }
    console.log("Is it array: "+isItArrayItem);
    var firebasePathToDelete=(this.props.route.path.replace("/fireadmin/","").replace(":sub",""))+(this.props.params&&this.props.params.sub?this.props.params.sub:"").replace(/\+/g,"/");
    if(key!=null){
      firebasePathToDelete+=("/"+key)
    }

    console.log("firebasePath for delete:"+firebasePathToDelete);
    this.setState({pathToDelete:firebasePathToDelete,isItArrayItemToDelete:isItArrayItem});
    window.scrollTo(0, 0);
    this.refs.deleteDialog.show();

  }


  doDelete(){
    console.log("Do delete ");
    console.log("Is it array "+this.state.isItArrayItemToDelete);
    console.log("Path to delete: "+this.state.pathToDelete)
    firebase.database().ref(this.state.pathToDelete).set(null).then((e)=>{
      console.log("Delete res: "+e)
      this.refs.deleteDialog.hide();
      this.setState({pathToDelete:null,notifications:[{type:"success",content:"Field is deleted."}]});
      this.refreshDataAndHideNotification();

    })
  }

  cancelDelete(){
    console.log("Cancel Delete");
    this.refs.deleteDialog.hide()
  }

  refreshDataAndHideNotification(refreshData=true,time=3000){
    //Refresh data,
    if(refreshData){
      this.resetDataFunction();
    }


    //Hide notifications
    setTimeout(function(){this.setState({notifications:[]})}.bind(this), time);
  }

  /**
   * Open a specific modal
   * @param modalName addItemInArrayModal,
   */
  openModal(modalName){
      this.updateModalViewState(modalName,true);
  }

  /**
   * Closes a specific modeal
   * @param modalName addItemInArrayModal
   */
  closeModal(modalName){
      this.updateModalViewState(modalName,false);
  }


  /**
   *
   * UI GENERATORS
   *
   */

  isReadonlyField(firebasePath, fieldKey) {
    var majorPath = firebasePath.split("/")[0];
    var navigation=Config.navigation;
    for(var i=0; i<navigation.length; i++){
      if(navigation[i].path==majorPath && navigation[i].readonlyFields){
        for(var k=0; k<navigation[i].readonlyFields.length; k++) {
          if (fieldKey == navigation[i].readonlyFields[k]) {
            return true;
          }
        }
      }
    }
    return false;
  }

   /**
   * This function finds the headers for the current menu
   * @param firebasePath - we will use current firebasePath to find the current menu
   */
   findHeadersBasedOnPath(firebasePath){
     var headers=null;

     var itemFound=false;
     var navigation=Config.navigation;
     for(var i=0;i<navigation.length&&!itemFound;i++){
       if(navigation[i].path==firebasePath&&navigation[i].tableFields){
         headers=navigation[i].tableFields;
         itemFound=true;
       }

       //Look into the sub menus
       if(navigation[i].subMenus){
         for(var j=0;j<navigation[i].subMenus.length;j++){
           if(navigation[i].subMenus[j].path==firebasePath&&navigation[i].subMenus[j].tableFields){
             headers=navigation[i].subMenus[j].tableFields;
             itemFound=true;
           }
         }
       }
     }
     return headers;

   }

   /**
    * Creates direct value section
    * @param {String} value, valu of the current path
    */
   makeValueCard(value){
     return (
         <div className="col-md-12" key={name}>
             <div className="card">
                 <div className="card-header card-header-icon" data-background-color="purple">
                     <i className="material-icons">assignment</i>
                 </div>
                 <div className="card-content">
                     <h4 className="card-title">Value</h4>
                     <div className="toolbar">
                     </div>
                     <div>
                     <Input updateAction={this.updateAction} class="" theKey="DIRECT_VALUE_OF_CURRENT_PATH" value={value} />
                     </div>
                 </div>
             </div>
         </div>
     )
   }

  /**
   * Creates single array section
   * @param {String} name, used as key also
   */
  makeArrayCard(name){
      return (
          <div className="col-md-12" key={name}>
              <div className="card">
                  <div className="card-header card-header-icon" data-background-color="purple">
                      <i className="material-icons">assignment</i>
                  </div>
                  <a  onClick={()=>{this.addItemToArray(name,this.state.arrays[name].length)}}><div id="addDiv" className="card-header card-header-icon" data-background-color="purple" style={{float:"right"}}>
                      <i className="material-icons">add</i>
                  </div></a>
                  <div className="card-content">
                      <h4 className="card-title">{Common.capitalizeFirstLetter(name)}</h4>
                      <div className="toolbar">

                      </div>
                      <div className="material-datatables">
                          <Table headers={this.findHeadersBasedOnPath(this.state.firebasePath)} deleteFieldAction={this.deleteFieldAction} fromObjectInArray={false} name={name} routerPath={this.props.route.path} isJustArray={this.state.isJustArray} sub={this.props.params&&this.props.params.sub?this.props.params.sub:""} data={this.state.arrays[name]}/>
                      </div>
                  </div>
              </div>
          </div>
      )
  }

  /**
   * when lastPathItem is Dashboard
   * @param {Object} dashItem : see config/schema.json --> "Dashboard"
   * {
      "dash_label": "Users",
      "dash_icon": "face",
      "dash_color": "pink",
      "dash_value": 120,
      "dash_lastUpdate": "1506536727769"
     }
   */
  makeDashboardCardForEmementsInArray(dashItem) {
    return (
      <div className="col-lg-3 col-md-6 col-sm-6">
        <div className="card card-stats">
            <div className="card-header" data-background-color={dashItem.dash_color}>
                <i className="material-icons">{dashItem.dash_icon}</i>
            </div>
            <div className="card-content">
                <p className="category">{dashItem.dash_label}</p>
                <h3 className="title">{dashItem.dash_value}</h3>
            </div>
            {(dashItem.dash_lastUpdate !== undefined) ? <div className="card-footer">
                <div className="stats">
                    <i className="material-icons">update</i> {moment(Number(dashItem.dash_lastUpdate)).format("ddd, MMM D, YYYY")}
                </div>
            </div> : <div></div>}
        </div>
      </div>
    );
  }

  /**
   * Creates  table section for the elements object
   * @param {String} name, used as key also
   */
  makeTableCardForElementsInArray(){
      if (this.state.lastPathItem != "Dashboard") {
        var name=this.state.lastPathItem;

        var hideNewButton = false;
        for (var key in this.state.currentInsertStructure) {
          if (this.state.currentInsertStructure.hasOwnProperty(key)) {
            for (var i=0;i<Config.adminConfig.hideNewItemButtonForKeys.length;i++){
                if(key.indexOf(Config.adminConfig.hideNewItemButtonForKeys[i])>-1){
                  hideNewButton = true;
                  break;
                }
            }
          }
        }

        return (
          <div className="col-md-12" key={name}>
              <div className="card">
                  <div className="card-header card-header-icon" data-background-color="purple">
                      <i className="material-icons">assignment</i>
                  </div>
                  <a hidden={hideNewButton} onClick={()=>{this.addNewObject()}}><div id="addDiv" className="card-header card-header-icon" data-background-color="purple" style={{float:"right"}}>
                      <i className="material-icons">add</i>
                  </div></a>
                  <div className="card-content">
                      <h4 className="card-title">{Common.capitalizeFirstLetter(name)}</h4>
                      <div className="toolbar">

                      </div>
                      <div className="material-datatables">
                          <Table headers={this.findHeadersBasedOnPath(this.state.firebasePath)} deleteFieldAction={this.deleteFieldAction} fromObjectInArray={true} name={name} routerPath={this.props.route.path} isJustArray={this.state.isJustArray} sub={this.props.params&&this.props.params.sub?this.props.params.sub:""} data={this.state.elementsInArray}/>
                      </div>
                  </div>
              </div>
          </div>
        );
      } else {
        return (
          <div class="row">
          {
            this.state.elementsInArray.map((dashItem)=>{
              return this.makeDashboardCardForEmementsInArray(dashItem);
            })
          }
          </div>
        );
      }
  }

  getLastPathItem(){
    var subPath=this.props.params&&this.props.params.sub?this.props.params.sub:""
    var items=subPath.split(Config.adminConfig.urlSeparator);
    return items[items.length-1];
  }

  checkIfKeyIsArtifical(key){
    var options=Config.adminConfig.optionsForRelation;
    for (var i = 0; options&&i < options.length; i++) {

      //This is if we have found the coorect key
      if(options[i].relationKey==key){
        console.log(key+" is Artifical. Don't show it")
        return true;
      }

    }
    return false
  }


  /**
   * generateBreadCrumb
   * @returns {XML}
   */
  generateBreadCrumb(){
      var subPath=this.props.params&&this.props.params.sub?this.props.params.sub:""
      var items=subPath.split(Config.adminConfig.urlSeparator);
      var path="/fireadmin/"
      return (<div>{items.map((item,index)=>{
        if(index==0){
          path+=item;
        }else{
          path+="+"+item;
        }

        return (<Link key={index} className="navbar-brand" to={path}>{item} <span className="breadcrumbSeparator">{index==items.length-1?"":"/"}</span><div className="ripple-container"></div></Link>)
      })}</div>)
  }

  generateNotifications(item){
      return (
          <div className="col-md-12">
              <Notification type={item.type} >{item.content}</Notification>
          </div>
      )
  }




  /**
  * Main render function
  */
  render() {

    // whether newItem or not?
    var isNewItem = false;
    if (this.state.newItemCompletePath != null) {
      if (this.state.newItemCompletePath == this.state.completePath) {
        isNewItem = true;
        console.log("################ isNewItem = true ##########")
        this.isStartedNewItem = true;
      } else {
        console.log("################# opposite ##################");
        if (this.isStartedNewItem) {
          this.newItemRemove();
        }
      }
    }

    var hidePNSCheckbox = true;
    if (isNewItem) {
      for (var i=0;i<Config.adminConfig.displayPNSCheckboxForKeys.length;i++){
          if(this.state.lastPathItem.indexOf(Config.adminConfig.displayPNSCheckboxForKeys[i]) == 0){
            hidePNSCheckbox = false;
            break;
          }
      }
    }

    return (
      <div>
        <div className="col-md-12 navbar navbar-transparent navbar-absolute fireadminbar">
          <div className="container-fluid">
            <div className="navbar-header">

              {this.generateBreadCrumb()}

            </div>
          </div>
        </div>

        <div className="content" sub={this.state.lastSub}>

          <div className="container-fluid">

          {/* ACtIONS */}
          {(this.state.lastPathItem != "Dashboard") ? 
          (<div className="col-md-12">
            <div className="card">
              <form className="form-horizontal">
                <div className="col-md-12">
                  <div className="col-md-6">
                    {!this.firebasePathIsHead() && <button  style={{opacity:this.state.isLastPage?0.3:1}} onClick={this.goPrevious} className="btn">
                      <span className="btn-label">
                        <i className="material-icons">keyboard_arrow_left</i>
                      </span>
                      Previous
                      <div className="ripple-container"></div>
                    </button>}
                    {/*<button  style={{opacity:this.state.page>1?1:0.3}} onClick={()=>{this.goNext()}} className="btn">
                      Next
                      <span className="btn-label">
                        <i className="material-icons">keyboard_arrow_right</i>
                      </span>
                      <div className="ripple-container"></div>
                    </button>*/}
                  </div>
                  <div className="col-md-3">
                  </div>
                  <div hidden={isNewItem} className="col-md-3">
                    <a onClick={()=>{this.deleteFieldAction(null,false)}} className="btn btn-danger pull-right">Delete Element</a>
                  </div>
                </div>

              </form>
            </div>
          </div>) : (<div></div>)}



              {/* NOTIFICATIONS */}
              {this.state.notifications?this.state.notifications.map((notification)=>{
                  return this.generateNotifications(notification)
              }):""}

              {/* DIRECT VALUE */}
              {this.state.directValue&&this.state.directValue.length>0?this.makeValueCard(this.state.directValue):""}

              {/* FIELDS */}
              {this.state.fieldsAsArray&&this.state.fieldsAsArray.length>0?(<div className="col-md-12">
                <div className="card">
                <a  onClick={()=>{this.refs.simpleDialog.show()}}><div id="addDiv" className="card-header card-header-icon" data-background-color="purple" style={{float:"right"}}>
                    <i className="material-icons">add</i>
                </div></a>
                  <form className="form-horizontal" ref="formFields">
                    <div className="card-header card-header-text" data-background-color="rose">
                      <h4 className="card-title">{Common.capitalizeFirstLetter(Config.adminConfig.fieldBoxName)}</h4>
                    </div>
                    {this.state.fieldsAsArray?this.state.fieldsAsArray.map((item)=>{
                      if(!this.checkIfKeyIsArtifical(item.theKey)){
                        return (<Fields readonly={this.isReadonlyField(this.state.firebasePath, item.theKey)} parentKey={this.getLastPathItem()} key={item.theKey+this.state.lastSub} deleteFieldAction={this.deleteFieldAction} updateAction={this.updateAction}  theKey={item.theKey} value={item.value} />)
                      }

                    }):"" }


                  </form>
                </div>
              </div>):""}

              {/* Create New Item */}
              {isNewItem && (
                <div className="col-md-12">
                  <div className="card" style={{marginTop: 0}}>
                    <form className="form-horizontal">
                      <a onClick={this.newItemCreate} className="btn btn-primary pull-right" style={{marginLeft: 30, marginRight: 30}}>Create</a>
                      {!hidePNSCheckbox && (
                        <div className="checkbox pull-right" style={{marginTop: 10}}>
                          <label style={{color: "black"}}>
                            <input type="checkbox" name="optionsCheckboxes" onChange={this.handlePNCheck} checked={this.state.isCheckedPN} />
                            <span className="checkbox-material">
                              <span className="check"></span>
                            </span>
                            Send as push notification
                          </label>
                        </div>
                      )}
                    </form>
                  </div>
                </div>
              )}


                {/* ARRAYS */}
                {this.state.arrayNames?this.state.arrayNames.map((key)=>{
                  return this.makeArrayCard(key)
                }):""}

                {/* ELEMENTS MERGED IN ARRAY */}
                {this.state.elementsInArray&&this.state.elementsInArray.length>0?( this.makeTableCardForElementsInArray()):""}

                {/* ELEMENTS */}
                {this.state.elements&&this.state.elements.length>0?(<div className="col-md-12">
                  <div className="card">

                      <form method="get" action="/"   className="form-horizontal">
                          <div className="card-header card-header-text" data-background-color="rose">
                              <h4 className="card-title">{this.state.lastPathItem+"' elements"}</h4>
                          </div>
                          <br />
                          <div className="col-md-12">
                              {this.state.elements?this.state.elements.map((item)=>{
                                  var theLink="/fireadmin/"+this.state.completePath+Config.adminConfig.urlSeparator+item.uidOfFirebase;
                                  return ( <Link to={theLink}><a className="btn">{item.uidOfFirebase}<div className="ripple-container"></div></a></Link>)
                              }):"" }
                          </div>


                      </form>
                  </div>
                </div>):""}



            </div>
        </div>
        <SkyLight hideOnOverlayClicked ref="deleteDialog" title="">
          <span><h3  className="center-block">Delete data</h3></span>
          <div className="col-md-12">
              <Notification type="danger" >All data at this location, incuding nested data, will be deleted!</Notification>
          </div>
          <div className="col-md-12">
              Data Location
          </div>
          <div className="col-md-12">
              <b>{this.state.pathToDelete}</b>
          </div>

          <div className="col-sm-12" style={{marginTop:80}}>
            <div className="col-sm-6">
            </div>
            <div className="col-sm-3 center-block">
              <a onClick={this.cancelDelete} className="btn btn-info center-block">Cancel</a>
            </div>
            <div className="col-sm-3 center-block">
              <a onClick={this.doDelete} className="btn btn-danger center-block">Delete</a>
            </div>

          </div>

        </SkyLight>
        <SkyLight hideOnOverlayClicked ref="simpleDialog" title="">
          <span><h3  className="center-block">Add new key</h3></span>
          <br />
          <div  className="card-content">
            <div className="row">
              <label className="col-sm-3 label-on-left">Name of they key</label>
              <div className="col-sm-12">
                <Input updateAction={this.updateAction} class="" theKey="NAME_OF_THE_NEW_KEY" value={"name"} />
              </div>
              <div className="col-sm-1">
              </div>
            </div>
          </div><br /><br />
          <div  className="card-content">
            <div className="row">
              <label className="col-sm-3 label-on-left">Value</label>
              <div className="col-sm-12">
                <Input updateAction={this.updateAction} class="" theKey="VALUE_OF_THE_NEW_KEY" value={"value"} />
              </div>
              <div className="col-sm-1">
              </div>
            </div>
          </div>
          <div className="col-sm-12 ">
            <div className="col-sm-3 ">
            </div>
            <div className="col-sm-6 center-block">
              <a onClick={this.addKey} className="btn btn-rose btn-round center-block"><i className="fa fa-save"></i>   Add key</a>
            </div>
            <div className="col-sm-3 ">
            </div>
          </div>
        </SkyLight>
      </div>

    )
  }
}
export default Fireadmin;
