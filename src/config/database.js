import * as firebase from 'firebase';
import Config from './app';

var FbApp = firebase.initializeApp(Config.firebaseConfig);
module.exports = FbApp; //this doesnt have to be database only
