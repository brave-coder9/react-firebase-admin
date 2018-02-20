
//FireBase
exports.firebaseConfig = {
  apiKey: "AIzaSyBTxBWHyvghkNaOmcwFpqAE7KDFdEAslfE",
  authDomain: "fitfast-2bcb5.firebaseapp.com",
  databaseURL: "https://fitfast-2bcb5.firebaseio.com",
  projectId: "fitfast-2bcb5",
  storageBucket: "fitfast-2bcb5.appspot.com",
  messagingSenderId: "589733320455"
};


//App setup
exports.adminConfig={
  "appName": "FitFast",
  "slogan":"flexible dieting.",
  "userAvatar":"https://cdn1.iconfinder.com/data/icons/unique-round-blue/93/user-512.png",

  // config of push notification preview
  "pushNotification":{
    "notificationTitle": "NEW MESSAGE BY TEAM FITFAST",
    "notificationLogo": "assets/img/favicon.png",
    "notificationTimeText": "now",  // time-text of push notification
    "backgroundColor": "lightblue", // - ex1: https://www.w3schools.com/colors/colors_names.asp
                                    // - ex2: "#00ff00"
                                    // - ex3: "rgb(255,0,255)"
  },

  "design":{
    "sidebarBg":"sidebar-1.jpg", //sidebar-1, sidebar-2, sidebar-3
    "dataActiveColor":"rgb(255,0,255)", // - ex0: "purple | blue | green | orange | red | rose"
                                        // - ex1: https://www.w3schools.com/colors/colors_names.asp
                                        // - ex2: "#00ff00"
                                        // - ex3: "rgb(255,0,255)"
    "dataBackgroundColor":"black", // "white | black"
  },

  "codeversion": "1.0",
  "allowedUsers": ["david@davidseek.com", "adala0814@gmail.com"], //If null, allow all users, else it should be array of allowd users
  "highlevelUsers": ["david@davidseek.com"],
  "fieldBoxName": "Fields",
  "maxNumberOfTableHeaders":5,
  "prefixForJoin":["-dash", "-user", "-item", "-place", "-news"],
  "methodOfInsertingNewObjects":"timestamp", //timestamp (key+time) | push - use firebase keys
  "urlSeparator":"+",
  "hideNewItemButtonForKeys":["-user"], // will hide <+> button
  "displayPNSCheckboxForKeys":["-news"],          // will display checkbox


  "fieldsTypes":{
    "photo":["photo","image"],
    "dateTime":["datetime","start"],
    "date":["date","created"],
    "time":["time"],
    "maps":["map","latlng"],
    "textarea":["description"],
    "html":["content"],
    "radio":["radio"],
    "checkbox":["checkbox"],
    "dropdowns":["status","dropdowns", "category", "approved"],
    "file":["video"],
    "rgbaColor":['rgba'],
    "hexColor":['color'],
    "relation":['type'],
  },
  "optionsForSelect":[
      {"key":"dropdowns","options":["new","processing","rejected","completed"]},
      {"key":"checkbox","options":["Skopje","Belgrade","New York"]},
      {"key":"status","options":["just_created","confirmed","canceled"]},
      {"key":"radio","options":["no","maybe","yes"]},
      {"key":"category","options":["Main dish", "Side dish", "Dessert", "Drink", "Other"]},
      {"key":"approved","options":["true", "false"]},
  ],
  "optionsForRelation":[
      {"key":"type","path":"/static/genres/items","value":"name","display":"name","isValuePath":false,"produceRelationKey":true,"relationKey":"type_eventid","relationJoiner":"-"},
  ],

  "paging":{
    "pageSize": 10000000000,
    "finite": true,
    "retainLastPage": false
  }
}

//Navigation
// can add "subMenus":[{"link": ...},]
exports.navigation=[
    // {
    //   "link": "/",
    //   "name": "Dashboard",
    //   "schema": null,
    //   "icon": "home",
    //   isIndex: true,
    //   "path": "",
    //   "readonlyFields": [],
    //   "accessLevel": "general",    // "general" or "higher"
    // },
    {
      "link": "fireadmin",
      "path": "Dashboard",
      "name": "Dashboard",
      "icon": "home",
      // isIndex:true,
      "tableFields": ["dash_label","dash_value"],
      "readonlyFields": [],
      "accessLevel": "general"
    },
    {
      "link": "fireadmin",
      "path": "Users",      // subpath in database of firebase
      "name": "Users",
      "icon": "people",
      "tableFields": ["email","givenName","familyName","uuid"],
      "readonlyFields": ["uuid"],
      "accessLevel": "higher"
    },
    {
      "link": "fireadmin",
      "path": "News",
      "name": "News",
      "icon": "fiber_new",
      "tableFields": ["title","body"],
      "readonlyFields": ["uuid"],
      "accessLevel": "general"
    },
    {
      "link": "fireadmin",
      "path": "FoodPlaces",
      "name": "Food Places",
      "icon": "domain",
      "tableFields": ["image","name"],
      "readonlyFields": [],
      "accessLevel": "general"
    },
    {
      "link": "fireadmin",
      "path": "Food",
      "name": "Food Items",
      "icon": "room_service",
      "tableFields": ["name"],
      "readonlyFields": ["uuid", "secret", "ndbno"],
      "accessLevel": "general",
      "subMenus":[{
        "link": "fireadmin",
        "path": "Food/Items",
        "name": "Food Items",
        "icon": "room_service",
        "tableFields": ["name"],
      }]
    },
    {
      "link": "push",
      "path": "",
      "name": "Push notification",
      "icon": "speaker_notes",
      "tableFields": [],
      "readonlyFields": [],
      "accessLevel": "general"
    }
  ];

exports.pushSettings={
  "pushType":"onesignal", //firebase or onesignal
  "Firebase_AuthorizationPushKey":"", //Firebase push authorization ket
  "pushTopic":"news", //Only for firebase push
  "oneSignal_REST_API_KEY":"ODE1ZjgxMmUtY2Y2NS00MjIyLThkNWEtMWQ5Y2FkMTgxYmU3",
  "oneSignal_APP_KEY":"86145b53-5739-4929-9659-19d9b372fe7a",
  "included_segments":"All", //Only for onesignal push
}

exports.userDetails={

}
