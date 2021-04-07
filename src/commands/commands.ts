import { insertMeeting } from "../meeting/meeting";

/**
 * Shows a notification when the add-in command is executed.
 * @param {Office.AddinCommands.Event} event
 */
function commandsAction(event: Office.AddinCommands.Event): void {
  insertMeeting(null, false, (allowEvent): void => { event.completed({ allowEvent: allowEvent }); });
}

function getGlobal() {
  return typeof self !== "undefined"
    ? self
    : typeof window !== "undefined"
    ? window
    : typeof global !== "undefined"
    ? global
    : undefined;
}

const g = getGlobal() as any;

g.commandsAction = commandsAction;