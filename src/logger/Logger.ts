import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import { v4 as uuidv4 } from 'uuid';

export interface ILogger {
  /**
   * Returns OperationId.
   * @returns {string}
   */
  getOperationId(): string;

  /**
   * Log a diagnostic scenario such entering or leaving a function.
   * @param {string} message
   * @param {any} [properties]
   */
  trackTrace(message: string, properties?: any): void;

  /**
   * Log an exception that you have caught.
   * @param {Error} error
   * @param {any} [properties]
   */
  trackException(error: Error, properties?: any): void;

  /**
   * Manually trigger an immediate send of all telemetry still in the buffer.
   * @param {boolean} [async=true]
   */
  flush(async?: boolean): void;

  /**
   * Set the authenticated user id and the account id. Used for identifying a specific signed-in user. Parameters must not contain whitespace or ,;=|
   *
   * The method will only set the `authenticatedUserId` and `accountId` in the current page view. To set them for the whole session, you should set `storeInCookie = true`
   * @param {string} authenticatedUserId
   * @param {string} [accountId]
   * @param {boolean} [storeInCookie=false]
   * @memberof Initialization
   */
  setAuthenticatedUserContext(authenticatedUserId: string, accountId?: string, storeInCookie?: boolean): void;
}

export class ApplicationInsightsLoggerConfig {
  instrumentationKey: string;
  appRole: string;
  enableCorsCorrelation: boolean;
  enableRequestHeaderTracking: boolean;
  enableResponseHeaderTracking: boolean;
}

export class ApplicationInsightsLogger implements ILogger {
  private appInsights: ApplicationInsights;

  constructor(loggerConfig: ApplicationInsightsLoggerConfig) {
    this.appInsights = new ApplicationInsights({
      config: {
        instrumentationKey: loggerConfig.instrumentationKey,
        enableCorsCorrelation: loggerConfig.enableCorsCorrelation,
        enableRequestHeaderTracking: loggerConfig.enableRequestHeaderTracking,
        enableResponseHeaderTracking: loggerConfig.enableResponseHeaderTracking
      }
    });
    this.appInsights.loadAppInsights();
    this.appInsights.trackPageView();

    var telemetryInitializer = envelope => {
      envelope.data.appRole = loggerConfig.appRole;
    };

    this.appInsights.addTelemetryInitializer(telemetryInitializer);
  }

  /**
   * Returns OperationId.
   * @returns {string}
   */
  public getOperationId(): string {
    return this.appInsights.context.telemetryTrace.traceID;
  }

  /**
   * Log a diagnostic scenario such entering or leaving a function.
   * @param {string} message
   * @param {any} [properties]
   */
  public trackTrace(message: string, properties?: any): void {
    this.appInsights.trackTrace({ message: message, properties: properties });
  }

  /**
   * Log an exception that you have caught.
   * @param {Error} error
   * @param {any} [properties]
   */
  public trackException(error: Error, properties?: any): void {
    this.appInsights.trackException({ exception: error, properties: properties });
  }

  /**
   * Manually trigger an immediate send of all telemetry still in the buffer.
   * @param {boolean} [async=true]
   */
  public flush(async: boolean = true): void {
    this.appInsights.flush(async);
  }

  /**
   * Set the authenticated user id and the account id. Used for identifying a specific signed-in user. Parameters must not contain whitespace or ,;=|
   *
   * The method will only set the `authenticatedUserId` and `accountId` in the current page view. To set them for the whole session, you should set `storeInCookie = true`
   * @param {string} authenticatedUserId
   * @param {string} [accountId]
   * @param {boolean} [storeInCookie=false]
   * @memberof Initialization
   */
  public setAuthenticatedUserContext(
    authenticatedUserId: string,
    accountId?: string,
    storeInCookie: boolean = false
  ): void {
    this.appInsights.setAuthenticatedUserContext(authenticatedUserId, accountId, storeInCookie);
  }
}

export class LogstashLoggerConfig {
  url: string;
  username: string;
  password: string;
}

export class LogstashLogger implements ILogger {
  private url: string;
  private username: string;
  private password: string;
  private axios = require("axios").default;
  private operationId: string;
  private authenticatedUserId: string;
  private accountId: string;

  constructor(loggerConfig: LogstashLoggerConfig) {
    this.url = loggerConfig.url;
    this.username = loggerConfig.username;
    this.password = loggerConfig.password;
    this.operationId = uuidv4();
  }

  /**
   * Returns OperationId.
   * @returns {string}
   */
  public getOperationId(): string {
    return this.operationId;
  }

  /**
   * Log a diagnostic scenario such entering or leaving a function.
   * @param {string} message
   * @param {any} [fields]
   */
  public trackTrace(message: string, fields?: any): void {
    this.sendRequest({
      message: message,
      operationId: this.getOperationId(),
      authenticatedUserId: this.authenticatedUserId,
      accountId: this.accountId,
      fields: fields
    });
  }

  /**
   * Log an exception that you have caught.
   * @param {Error} error
   * @param {any} [properties]
   */
  public trackException(error: Error, properties?: any): void {
    this.trackTrace(error.name, {
      errorMessage: error.message
    });
  }

  /**
   * Manually trigger an immediate send of all telemetry still in the buffer.
   * @param {boolean} [async=true]
   */
  public flush(async: boolean = true): void {}

  /**
   * Set the authenticated user id and the account id. Used for identifying a specific signed-in user. Parameters must not contain whitespace or ,;=|
   *
   * The method will only set the `authenticatedUserId` and `accountId` in the current page view. To set them for the whole session, you should set `storeInCookie = true`
   * @param {string} authenticatedUserId
   * @param {string} [accountId]
   * @param {boolean} [storeInCookie=false]
   * @memberof Initialization
   */
  public setAuthenticatedUserContext(
    authenticatedUserId: string,
    accountId?: string,
    storeInCookie: boolean = false
  ): void {
    this.authenticatedUserId = authenticatedUserId;
    this.accountId = accountId;
  }

  /**
   * Send data to server.
   * @param {any} requestData
   */
  private sendRequest(requestData: any): void {
    this.axios.post(this.url, requestData, {
      auth: {
        username: this.username,
        password: this.password
      }
    });
  }
}
