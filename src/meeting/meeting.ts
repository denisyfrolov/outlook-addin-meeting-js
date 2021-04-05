// images references in the manifest
import "../../assets/icon-16.png";
import "../../assets/icon-25.png";
import "../../assets/icon-32.png";
import "../../assets/icon-48.png";
import "../../assets/icon-64.png";
import "../../assets/icon-80.png";
import "../../assets/icon-128.png";
import { localizedStrings } from "./localizedStrings";
import { sprintf } from "sprintf-js";
// eslint-disable-next-line no-unused-vars
import { ApplicationInsightsLogger, ApplicationInsightsLoggerConfig, LogstashLogger, LogstashLoggerConfig } from "../logger/Logger";

const axios = require("axios").default;
const notificationIcon = process.env.NotificationIcon;
const API_URL: string = process.env.API_URL;
const enableTrace: boolean = (process.env.EnableTrace as unknown) as boolean;
const enableDiagnosticInfoInTraceAndError: boolean = (process.env
  .EnableDiagnosticInfoInTraceAndError as unknown) as boolean;
const enableNotificationInformationalMessage: boolean = (process.env
  .EnableNotificationInformationalMessage as unknown) as boolean;
const enableNotificationErrorMessage: boolean = (process.env.EnableNotificationErrorMessage as unknown) as boolean;

const loggerAIConfig: ApplicationInsightsLoggerConfig = {
  instrumentationKey: process.env.ApplicationInsightsInstrumentationKey,
  appRole: process.env.ApplicationInsightsAppRole,
  enableCorsCorrelation: (process.env.ApplicationInsightsEnableCorsCorrelation as unknown) as boolean,
  enableRequestHeaderTracking: (process.env.ApplicationInsightsEableRequestHeaderTracking as unknown) as boolean,
  enableResponseHeaderTracking: (process.env.ApplicationInsightsEnableResponseHeaderTracking as unknown) as boolean
};
const loggerAI: ApplicationInsightsLogger = new ApplicationInsightsLogger(loggerAIConfig);

const loggerConfig: LogstashLoggerConfig = {
  url: process.env.LogstashUrl,
  username: process.env.LogstashUsername,
  password: process.env.LogstashPassword
};
const logger: LogstashLogger = new LogstashLogger(loggerConfig);

var newBody: string;
var mailbox: Office.Mailbox;
var mailboxItem: Office.AppointmentCompose;
var userIdentityToken: string;
var userProfile: Office.UserProfile;
var emailAddress: string;
var displayName: string;
var displayLanguage: string;
var contentLanguage: string;
var UILocalizedText: any;
var LoggingLocalizedText: any;
var contentLocalizedText: any;
var contextInfo: Office.ContextInformation;
var operationId: string;
var hostName: string;
var origin: string;
var pathname: string;

/* global Office */

Office.onReady(() => {
  // If needed, Office.js is ready to be called
  mailbox = Office.context.mailbox;
  displayLanguage = Office.context.displayLanguage;
  contentLanguage = Office.context.contentLanguage;
  contextInfo = Office.context.diagnostics;
  hostName = window.location.hostname;
  origin = window.location.origin;
  pathname = window.location.pathname;
  UILocalizedText = localizedStrings.getLocaleStrings(displayLanguage);
  LoggingLocalizedText = localizedStrings.getLocaleStrings();
  contentLocalizedText = localizedStrings.getLocaleStrings(contentLanguage);
  mailboxItem = mailbox.item;
  userProfile = mailbox.userProfile;
  emailAddress = userProfile.emailAddress;
  displayName = userProfile.displayName;
  operationId = logger.getOperationId();
  logger.setAuthenticatedUserContext(emailAddress);
  loggerAI.setAuthenticatedUserContext(emailAddress);
});

/**
 * Shows a notification when the add-in command is executed.
 * @param {Office.AddinCommands.Event} event
 * @param {string | null} meetingname
 * @param {boolean} [isguestsallowed=false]
 */
export var insertMeeting = function(event?: Office.AddinCommands.Event, meetingname?: string, isguestsallowed: boolean = false): void {
  processTrace(LoggingLocalizedText.Trace.EventStarted);
  mailbox.getUserIdentityTokenAsync(function(getUserIdentityTokenAsyncResult) {
    if (getUserIdentityTokenAsyncResult.status !== Office.AsyncResultStatus.Succeeded) {
      processError({
        name: LoggingLocalizedText.Errors.FailedToGetIdentityToken,
        message: getUserIdentityTokenAsyncResult.error.message
      });
      completeEvent(event, false);
    } else {
      userIdentityToken = getUserIdentityTokenAsyncResult.value;
      processTrace(LoggingLocalizedText.Trace.SuccessToGetIdentityToken, { userIdentityToken: userIdentityToken });
      mailboxItem.subject.getAsync({ asyncContext: event }, function(getSubjectAsyncResult) {
        if (getSubjectAsyncResult.status !== Office.AsyncResultStatus.Succeeded) {
          processError({
            name: LoggingLocalizedText.Errors.FailedToGetSubject,
            message: getSubjectAsyncResult.error.message
          });
          completeEvent(getSubjectAsyncResult.asyncContext, false);
        } else {
          processTrace(LoggingLocalizedText.Trace.SuccessToGetSubject, { subject: getSubjectAsyncResult.value });
          if(!meetingname)
            meetingname = getSubjectAsyncResult.value;
          processApiRequest(
            displayName,
            emailAddress,
            meetingname,
            isguestsallowed,
            displayLanguage,
            contentLanguage,
            userIdentityToken,
            operationId,
            event
          );
        }
      });
    }
  });
};

/**
 * Process Api Request.
 * @param {string} displayName
 * @param {string} emailAddress
 * @param {string} meetingname
 * @param {boolean} isguestsallowed
 * @param {string} displayLanguage
 * @param {string} contentLanguage
 * @param {string} userIdentityToken
 * @param {string} operationId
 * @param {Office.AddinCommands.Event | null} event
 */
function processApiRequest(
  displayName: string,
  emailAddress: string,
  meetingname: string,
  isguestsallowed: boolean,
  displayLanguage: string,
  contentLanguage: string,
  userIdentityToken: string,
  operationId: string,
  event?: Office.AddinCommands.Event
): void {
  var apiRequestData = {
    owner_email: emailAddress,
    title: meetingname,
    isguestsallowed: isguestsallowed
  };
  var apiRequestHeaders = {
    Authorization: "Bearer " + userIdentityToken,
    "Display-Language": displayLanguage,
    "Content-Language": contentLanguage,
    "Operation-Id": operationId
  };
  processTrace(LoggingLocalizedText.Trace.ProcessApiRequestStarted, {
    apiUrl: API_URL,
    apiRequestHeaders: apiRequestHeaders,
    apiRequestData: apiRequestData
  });
  axios
    .post(API_URL, apiRequestData, {
      headers: apiRequestHeaders
    })
    .then(function(apiResponse) {
      processTrace(LoggingLocalizedText.Trace.ProcessApiRequestCompleted, {
        apiUrl: API_URL,
        apiResponseStatus: apiResponse.status,
        apiResponseStatusText: apiResponse.statusText,
        apiResponseData: apiResponse.data
      });
      processApiResponse(apiResponse.data["url"], apiResponse.data["text"]);
    })
    .catch(apiRequestResult => {
      processError(
        {
          name: LoggingLocalizedText.Errors.ServerRequestFailed,
          message: sprintf(LoggingLocalizedText.Errors.ServerRequestFailedMessage, {
            status: apiRequestResult.response.status,
            statusText: apiRequestResult.response.statusText
          })
        },
        {
          apiUrl: API_URL,
          apiResponseStatus: apiRequestResult.response.status,
          apiResponseStatusText: apiRequestResult.response.statusText,
          apiResponseData: apiRequestResult.response.data
        }
      );
      completeEvent(event, false);
    });
}

/**
 * Process Api Response.
 * @param {string} meetingUrl
 * @param {string} meetingText
 * @param {Office.AddinCommands.Event | null} event
 */
function processApiResponse(meetingUrl: string, meetingText: string, event?: Office.AddinCommands.Event): void {
  processTrace(LoggingLocalizedText.Trace.ProcessApiResponseStarted);
  mailboxItem.location.setAsync(meetingUrl, { asyncContext: event }, function(setLocationAsyncResult) {
    if (setLocationAsyncResult.status !== Office.AsyncResultStatus.Succeeded) {
      processError({
        name: LoggingLocalizedText.Errors.FailedToSetLocation,
        message: setLocationAsyncResult.error.message
      });
      completeEvent(setLocationAsyncResult.asyncContext, false);
    } else {
      processTrace(LoggingLocalizedText.Trace.SuccessToSetLocation);
      mailboxItem.body.getAsync("html", { asyncContext: event }, function(getBodyAsyncResult) {
        if (getBodyAsyncResult.status !== Office.AsyncResultStatus.Succeeded) {
          processError({
            name: LoggingLocalizedText.Errors.FailedToGetHTMLBody,
            message: getBodyAsyncResult.error.message
          });
          completeEvent(getBodyAsyncResult.asyncContext, false);
        } else {
          processTrace(LoggingLocalizedText.Trace.SuccessToGetBody);
          newBody = sprintf(contentLocalizedText.MessageBody, {
            url: meetingUrl,
            text: meetingText
          });
          updateBody(getBodyAsyncResult.value, getBodyAsyncResult.asyncContext);
        }
      });
      processTrace(LoggingLocalizedText.Trace.ProcessApiResponseCompleted);
    }
  });
}

/**
 * Process Error.
 * @param {Error} error
 */
function processError(error: Error, properties?: any): void {
  if (enableDiagnosticInfoInTraceAndError) properties = addDiagnosticInfo(properties);
  logger.trackException(error, properties);
  loggerAI.trackException(error, properties);
  showNotificationErrorMessage(error.name);
}

/**
 * Process Trace.
 * @param {string} message
 */
function processTrace(message: string, properties?: any): void {
  if (!enableTrace) return;
  if (enableDiagnosticInfoInTraceAndError) properties = addDiagnosticInfo(properties);
  logger.trackTrace(message, properties);
  loggerAI.trackTrace(message, properties);
}

/**
 * Add DiagnosticInfo.
 * @param {any} properties
 * @returns {any}
 */
function addDiagnosticInfo(properties?: any): any {
  if (properties) {
    properties = {
      properties,
      contextInfo,
      hostName,
      origin,
      pathname,
      displayLanguage,
      contentLanguage,
      emailAddress,
      displayName
    };
  } else {
    properties = {
      contextInfo,
      hostName,
      origin,
      pathname,
      displayLanguage,
      contentLanguage,
      emailAddress,
      displayName
    };
  }
  return properties;
}

/**
 * Show Notification Informational Message.
 * @param {string} message
 * @param {boolean} [persistent=false]
 */
function showNotificationInformationalMessage(message: string, persistent: boolean = false): void {
  if (!enableNotificationInformationalMessage) return;
  var notificationMessages: Office.NotificationMessageDetails = {
    type: Office.MailboxEnums.ItemNotificationMessageType.InformationalMessage,
    message: message,
    icon: notificationIcon,
    persistent: persistent
  };
  mailboxItem.notificationMessages.replaceAsync("insertMeeting", notificationMessages);
}

/**
 * Show Notification Error Message.
 * @param {string} message
 */
function showNotificationErrorMessage(message: string): void {
  if (!enableNotificationErrorMessage) return;
  var notificationMessages: Office.NotificationMessageDetails = {
    type: Office.MailboxEnums.ItemNotificationMessageType.ErrorMessage,
    message: message
  };
  mailboxItem.notificationMessages.replaceAsync("insertMeetingError", notificationMessages);
}

/**
 * Update Body.
 * @param {string} existingBody
 * @param {Office.AddinCommands.Event | null} event
 */
function updateBody(existingBody: string, event?: Office.AddinCommands.Event): void {
  mailboxItem.body.setAsync(existingBody + newBody, { asyncContext: event, coercionType: "html" }, function(
    setBodyAsyncResult
  ) {
    if (setBodyAsyncResult.status !== Office.AsyncResultStatus.Succeeded) {
      processError({
        name: LoggingLocalizedText.Errors.FailedToSetHTMLBody,
        message: setBodyAsyncResult.error.message
      });
      completeEvent(setBodyAsyncResult.asyncContext, false);
    } else {
      processTrace(LoggingLocalizedText.Trace.SuccessToSetBody);
      completeEvent(setBodyAsyncResult.asyncContext, true);
    }
  });
}

/**
 * Complete Event.
 * @param {Office.AddinCommands.Event | null} event
 * @param {boolean} [allowEvent=true]
 */
function completeEvent(event?: Office.AddinCommands.Event, allowEvent: boolean = true) {
  if (allowEvent) {
    processTrace(LoggingLocalizedText.Trace.EventCompleted);
    showNotificationInformationalMessage(sprintf(UILocalizedText.Success));
  } else {
    processTrace(LoggingLocalizedText.Trace.EventStopped);
  }
  loggerAI.flush();
  if(event)
    event.completed({ allowEvent: allowEvent });
}
