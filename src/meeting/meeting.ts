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
var completionCallback: Function;

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
 * @param {string | null} meetingname
 * @param {boolean} [isguestsallowed=false]
 */
export var insertMeeting = function(meetingname?: string, isguestsallowed: boolean = false, callback: Function = null): void {
  completionCallback = callback;
  processTrace(LoggingLocalizedText.Trace.Started);
  mailbox.getUserIdentityTokenAsync(function(getUserIdentityTokenAsyncResult) {
    if (getUserIdentityTokenAsyncResult.status !== Office.AsyncResultStatus.Succeeded) {
      processError({
        name: LoggingLocalizedText.Errors.FailedToGetIdentityToken,
        message: getUserIdentityTokenAsyncResult.error.message
      });
      complete(false);
    } else {
      userIdentityToken = getUserIdentityTokenAsyncResult.value;
      processTrace(LoggingLocalizedText.Trace.SuccessToGetIdentityToken, { userIdentityToken: userIdentityToken });
      mailboxItem.subject.getAsync(function(getSubjectAsyncResult) {
        if (getSubjectAsyncResult.status !== Office.AsyncResultStatus.Succeeded) {
          processError({
            name: LoggingLocalizedText.Errors.FailedToGetSubject,
            message: getSubjectAsyncResult.error.message
          });
          complete(false);
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
            operationId
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
 */
function processApiRequest(
  displayName: string,
  emailAddress: string,
  meetingname: string,
  isguestsallowed: boolean,
  displayLanguage: string,
  contentLanguage: string,
  userIdentityToken: string,
  operationId: string
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
      complete(false);
    });
}

/**
 * Process Api Response.
 * @param {string} meetingUrl
 * @param {string} meetingText
 */
function processApiResponse(meetingUrl: string, meetingText: string): void {
  processTrace(LoggingLocalizedText.Trace.ProcessApiResponseStarted);
  mailboxItem.location.setAsync(meetingUrl, function(setLocationAsyncResult) {
    if (setLocationAsyncResult.status !== Office.AsyncResultStatus.Succeeded) {
      processError({
        name: LoggingLocalizedText.Errors.FailedToSetLocation,
        message: setLocationAsyncResult.error.message
      });
      complete(false);
    } else {
      processTrace(LoggingLocalizedText.Trace.SuccessToSetLocation);
      mailboxItem.body.getAsync("html", function(getBodyAsyncResult) {
        if (getBodyAsyncResult.status !== Office.AsyncResultStatus.Succeeded) {
          processError({
            name: LoggingLocalizedText.Errors.FailedToGetHTMLBody,
            message: getBodyAsyncResult.error.message
          });
          complete(false);
        } else {
          processTrace(LoggingLocalizedText.Trace.SuccessToGetBody);
          newBody = sprintf(contentLocalizedText.MessageBody, {
            url: meetingUrl,
            text: meetingText
          });
          updateBody(getBodyAsyncResult.value);
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
 */
function updateBody(existingBody: string): void {
  mailboxItem.body.setAsync(existingBody + newBody, { coercionType: "html" }, function(
    setBodyAsyncResult
  ) {
    if (setBodyAsyncResult.status !== Office.AsyncResultStatus.Succeeded) {
      processError({
        name: LoggingLocalizedText.Errors.FailedToSetHTMLBody,
        message: setBodyAsyncResult.error.message
      });
      complete(false);
    } else {
      processTrace(LoggingLocalizedText.Trace.SuccessToSetBody);
      complete(true);
    }
  });
}

/**
 * Complete.
 * @param {boolean} [success=true]
 */
function complete(success: boolean = true) {
  if (success) {
    processTrace(LoggingLocalizedText.Trace.Completed);
    showNotificationInformationalMessage(sprintf(UILocalizedText.Success));
  } else {
    processTrace(LoggingLocalizedText.Trace.Stopped);
  }
  loggerAI.flush();
  if(completionCallback)
    completionCallback(success);
}
