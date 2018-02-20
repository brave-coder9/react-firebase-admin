
import Config from   '../config/app';
var request = require('superagent');


// function sendCallback(e,r) {
//   console.log(r);
//   console.log(e);
// }

export function submitFirebase(sendCallback, msg) {
  //alert('A push was submitted: ' + this.state.value);

  var url='https://fcm.googleapis.com/fcm/send';
  var json = '{"to":"'+Config.pushSettings.pushTopic+'","notification": {"body":"'+msg+'",},"priority":10,}';
  request.post(url)
      .set('Content-Type', 'application/json')
      .set('Authorization', 'key='+Config.pushSettings.Firebase_AuthorizationPushKey)
      .send(json)
      .end(sendCallback)
}


export default function submitOneSignal(sendCallback, msg, title) {
  //alert('A push was submitted: ' + this.state.value);

  var url='https://onesignal.com/api/v1/notifications';
  var json = {
    "app_id":Config.pushSettings.oneSignal_APP_KEY,
    "included_segments":Config.pushSettings.included_segments,
    "headings":{"en": title},
    "contents":{"en": msg}
  }

  request.post(url)
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Basic '+Config.pushSettings.oneSignal_REST_API_KEY)
      .send(json)
      .end(sendCallback)
}
