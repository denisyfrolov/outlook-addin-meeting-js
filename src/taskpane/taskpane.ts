import { insertMeeting } from "../meeting/meeting";

// images references in the manifest
import "../../assets/logo-taskpane.png";

/* global Office */
Office.onReady((info) => {
  if (info.host === Office.HostType.Outlook) {
    document.getElementById("create").onclick = function() { 
      var meetingname: string = (<HTMLTextAreaElement> document.getElementById("meetingname")).value;
      var isguestsallowed: boolean = (<HTMLInputElement> document.getElementById("isguestsallowed")).checked;
      insertMeeting(meetingname, isguestsallowed, (): void => { Office.context.ui.closeContainer(); }); 
    };
    document.getElementById("cancel").onclick = function() { Office.context.ui.closeContainer(); };
  }
});