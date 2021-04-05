require("dotenv").config();

const devCerts = require("office-addin-dev-certs");
const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WebpackAutoInject = require("webpack-auto-inject-version");
const GenerateJsonPlugin = require("generate-json-webpack-plugin");
const HtmlWebpackTagsPlugin = require("html-webpack-tags-plugin");

const urlDev = "https://localhost:3000/";

const mockedApiData = {
  url: "https://meeting.contoso.com/meeting/1",
  text: "Подключиться к собранию…"
};

const mockedErrorData = {
  error: {
    code: 406,
    message: "validation errors",
    validation_errors: [
      {
        property_path: "email",
        message: "email"
      }
    ]
  }
};

const routesData = {
  routes: []
};

module.exports = async (env, options) => {
  const dev = options.mode === "development";
  const buildType = dev ? "dev" : "prod";
  const urlProd = process.env.PROD_URL;
  const ProviderName = process.env.PROVIDERNAME;
  const DisplayName = process.env.DISPLAYNAME;
  const DisplayNameRu = process.env.DISPLAYNAME_RU;
  const Description = process.env.DESCRIPTION;
  const DescriptionRu = process.env.DESCRIPTION_RU;
  const SupportUrl = process.env.SUPPORTURL;
  const SupportUrlRu = process.env.SUPPORTURL_RU;
  const AppDomain = process.env.APPDOMAIN;
  const GroupLabel = process.env.GROUPLABEL;
  const GroupLabelRu = process.env.GROUPLABEL_RU;
  const CommandsButtonLabel = process.env.COMMANDSBUTTONLABEL;
  const CommandsButtonLabelRu = process.env.COMMANDSBUTTONLABEL_RU;
  const CommandsButtonTooltip = process.env.COMMANDSBUTTONTOOLTIP;
  const CommandsButtonTooltipRu = process.env.COMMANDSBUTTONTOOLTIP_RU;
  const CommandsMobileButtonLabel = process.env.COMMANDSMOBILEBUTTONLABEL;
  const CommandsMobileButtonLabelRu = process.env.COMMANDSMOBILEBUTTONLABEL_RU;
  const TaskpaneButtonLabel = process.env.TASKPANEBUTTONLABEL;
  const TaskpaneButtonLabelRu = process.env.TASKPANEBUTTONLABEL_RU;
  const TaskpaneButtonTooltip = process.env.TASKPANEBUTTONTOOLTIP;
  const TaskpaneButtonTooltipRu = process.env.TASKPANEBUTTONTOOLTIP_RU;
  const API_URL = JSON.stringify(process.env.API_URL);
  const NotificationIcon = JSON.stringify(process.env.NOTIFICATIONICON);
  const EnableTrace = process.env.ENABLETRACE;
  const EnableDiagnosticInfoInTraceAndError = process.env.ENABLEDIAGNOSTICINFOINTRACEANDERROR;
  const EnableNotificationInformationalMessage = process.env.ENABLENOTIFICATIONINFORMATIONALMESSAGE;
  const EnableNotificationErrorMessage = process.env.ENABLENOTIFICATIONERRORMESSAGE;
  const ApplicationInsightsInstrumentationKey = JSON.stringify(process.env.APPINSIGHTS_INSTRUMENTATIONKEY);
  const ApplicationInsightsAppRole = JSON.stringify(process.env.APPLICATIONINSIGHTSAPPROLE);
  const ApplicationInsightsEnableCorsCorrelation = process.env.APPLICATIONINSIGHTSENABLECORSCORRELATION;
  const ApplicationInsightsEableRequestHeaderTracking = process.env.APPLICATIONINSIGHTSEABLEREQUESTHEADERTRACKING;
  const ApplicationInsightsEnableResponseHeaderTracking = process.env.APPLICATIONINSIGHTSENABLERESPONSEHEADERTRACKING;
  const LogstashUrl = JSON.stringify(process.env.LOGSTASHURL);
  const LogstashUsername = JSON.stringify(process.env.LOGSTASHUSERNAME);
  const LogstashPassword = JSON.stringify(process.env.LOGSTASHPASSWORD);
  const TASKPANE_PAGE_TITLE = process.env.TASKPANE_PAGE_TITLE;
  const TASKPANE_PAGE_TITLE_RU = process.env.TASKPANE_PAGE_TITLE_RU;
  const TASKPANE_FORM_TITLE = process.env.TASKPANE_FORM_TITLE;
  const TASKPANE_FORM_TITLE_RU = process.env.TASKPANE_FORM_TITLE_RU;
  const TASKPANE_FORM_MEETINGNAME_LABEL = process.env.TASKPANE_FORM_MEETINGNAME_LABEL;
  const TASKPANE_FORM_MEETINGNAME_LABEL_RU = process.env.TASKPANE_FORM_MEETINGNAME_LABEL_RU;
  const TASKPANE_FORM_ALLOWGUESTS_LABEL = process.env.TASKPANE_FORM_ALLOWGUESTS_LABEL;
  const TASKPANE_FORM_ALLOWGUESTS_LABEL_RU = process.env.TASKPANE_FORM_ALLOWGUESTS_LABEL_RU;
  const TASKPANE_FORM_POLICY_WARN_1 = process.env.TASKPANE_FORM_POLICY_WARN_1;
  const TASKPANE_FORM_POLICY_WARN_1_RU = process.env.TASKPANE_FORM_POLICY_WARN_1_RU;
  const TASKPANE_FORM_POLICY_WARN_2 = process.env.TASKPANE_FORM_POLICY_WARN_2;
  const TASKPANE_FORM_POLICY_WARN_2_RU = process.env.TASKPANE_FORM_POLICY_WARN_2_RU;
  const TASKPANE_FORM_POLICY_WARN_URL = process.env.TASKPANE_FORM_POLICY_WARN_URL;
  const TASKPANE_FORM_POLICY_WARN_URL_RU = process.env.TASKPANE_FORM_POLICY_WARN_URL_RU;
  const TASKPANE_FORM_BUTTON_CREATE_LABEL_1 = process.env.TASKPANE_FORM_BUTTON_CREATE_LABEL_1;
  const TASKPANE_FORM_BUTTON_CREATE_LABEL_1_RU = process.env.TASKPANE_FORM_BUTTON_CREATE_LABEL_1_RU;
  const TASKPANE_FORM_BUTTON_CREATE_LABEL_2 = process.env.TASKPANE_FORM_BUTTON_CREATE_LABEL_2;
  const TASKPANE_FORM_BUTTON_CREATE_LABEL_2_RU = process.env.TASKPANE_FORM_BUTTON_CREATE_LABEL_2_RU;
  const TASKPANE_FORM_BUTTON_CANCEL_LABEL = process.env.TASKPANE_FORM_BUTTON_CANCEL_LABEL;
  const TASKPANE_FORM_BUTTON_CANCEL_LABEL_RU = process.env.TASKPANE_FORM_BUTTON_CANCEL_LABEL_RU;
  const config = {
    devtool: "source-map",
    entry: {
      polyfill: "@babel/polyfill",
      taskpane: "./src/taskpane/taskpane.ts",
      commands: "./src/commands/commands.ts"
    },
    node: {
      fs: "empty"
    },
    resolve: {
      extensions: [".ts", ".tsx", ".html", ".js"]
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"]
            }
          }
        },
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: "ts-loader"
        },
        {
          test: /\.html$/,
          exclude: /node_modules/,
          use: "html-loader"
        },
        {
          test: /\.(png|jpg|jpeg|gif)$/,
          loader: "file-loader",
          options: {
            name: "[path][name].[ext]"
          }
        }
      ]
    },
    plugins: [
      new CleanWebpackPlugin(),
      new webpack.DefinePlugin({
        "process.env": {
          API_URL: API_URL,
          NotificationIcon: NotificationIcon,
          EnableTrace: EnableTrace,
          EnableDiagnosticInfoInTraceAndError: EnableDiagnosticInfoInTraceAndError,
          EnableNotificationInformationalMessage: EnableNotificationInformationalMessage,
          EnableNotificationErrorMessage: EnableNotificationErrorMessage,
          ApplicationInsightsInstrumentationKey: ApplicationInsightsInstrumentationKey,
          ApplicationInsightsAppRole: ApplicationInsightsAppRole,
          ApplicationInsightsEnableCorsCorrelation: ApplicationInsightsEnableCorsCorrelation,
          ApplicationInsightsEableRequestHeaderTracking: ApplicationInsightsEableRequestHeaderTracking,
          ApplicationInsightsEnableResponseHeaderTracking: ApplicationInsightsEnableResponseHeaderTracking,
          LogstashUrl: LogstashUrl,
          LogstashUsername: LogstashUsername,
          LogstashPassword: LogstashPassword
        }
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            to: "taskpane.css",
            from: "./src/taskpane/taskpane.css"
          },
          {
            to: "bootstrap.min.css",
            from: "node_modules/bootstrap/dist/css/bootstrap.min.css"
          },
          {
            to: "bootstrap.min.css.map",
            from: "node_modules/bootstrap/dist/css/bootstrap.min.css.map"
          },
          {
            to: "[name]." + buildType + ".[ext]",
            from: "manifest*.xml",
            transform(content) {
              var newContent = content
                .toString()
                .replace(/<Version>(?:\d\.?)+<\/Version>/g, "<Version>[AIV]{version}[/AIV]</Version>");
              if (!dev) {
                newContent = newContent
                  .replace(new RegExp(urlDev, "g"), urlProd)
                  .replace(
                    /<ProviderName>(?:.*?)<\/ProviderName>/g,
                    "<ProviderName>" + ProviderName + "</ProviderName>"
                  )
                  .replace(/<AppDomain>(?:.*?)<\/AppDomain>/g, "<AppDomain>" + AppDomain + "</AppDomain>")
                  .replace(
                    /<DisplayName>?(?:.*?)<\/DisplayName>/gms,
                    '<DisplayName DefaultValue="' +
                      DisplayName +
                      '">\r\n' +
                      '		<Override Locale="ru-RU" Value="' +
                      DisplayNameRu +
                      '" />\r\n' +
                      "	</DisplayName>"
                  )
                  .replace(
                    /<Description>?(?:.*?)<\/Description>/gms,
                    '<Description DefaultValue="' +
                      Description +
                      '">\r\n' +
                      '		<Override Locale="ru-RU" Value="' +
                      DescriptionRu +
                      '" />\r\n' +
                      "	</Description>"
                  )
                  .replace(
                    /<SupportUrl>?(?:.*?)<\/SupportUrl>/gms,
                    '<SupportUrl DefaultValue="' +
                      SupportUrl +
                      '">\r\n' +
                      '		<Override Locale="ru-RU" Value="' +
                      SupportUrlRu +
                      '" />\r\n' +
                      "	</SupportUrl>"
                  )
                  .replace(
                    /^\s{16}<bt:String id="Group\.Label">?(?:.*?)^\s{16}<\/bt:String>/gms,
                    new Array(17).join(" ") +
                      '<bt:String id="Group.Label" DefaultValue="' +
                      GroupLabel +
                      '">\r\n' +
                      new Array(21).join(" ") +
                      '<bt:Override Locale="ru-RU" Value="' +
                      GroupLabelRu +
                      '" />\r\n' +
                      new Array(17).join(" ") +
                      "</bt:String>"
                  )
                  .replace(
                    /^\s{20}<bt:String id="Group\.Label">?(?:.*?)^\s{20}<\/bt:String>/gms,
                    new Array(21).join(" ") +
                      '<bt:String id="Group.Label" DefaultValue="' +
                      GroupLabel +
                      '">\r\n' +
                      new Array(25).join(" ") +
                      '<bt:Override Locale="ru-RU" Value="' +
                      GroupLabelRu +
                      '" />\r\n' +
                      new Array(21).join(" ") +
                      "</bt:String>"
                  )
                  .replace(
                    /^\s{16}<bt:String id="CommandsButton\.Label">?(?:.*?)^\s{16}<\/bt:String>/gms,
                    new Array(17).join(" ") +
                      '<bt:String id="CommandsButton.Label" DefaultValue="' +
                      CommandsButtonLabel +
                      '">\r\n' +
                      new Array(21).join(" ") +
                      '<bt:Override Locale="ru-RU" Value="' +
                      CommandsButtonLabelRu +
                      '" />\r\n' +
                      new Array(17).join(" ") +
                      "</bt:String>"
                  )
                  .replace(
                    /^\s{20}<bt:String id="CommandsButton\.Label">?(?:.*?)^\s{20}<\/bt:String>/gms,
                    new Array(21).join(" ") +
                      '<bt:String id="CommandsButton.Label" DefaultValue="' +
                      CommandsButtonLabel +
                      '">\r\n' +
                      new Array(25).join(" ") +
                      '<bt:Override Locale="ru-RU" Value="' +
                      CommandsButtonLabelRu +
                      '" />\r\n' +
                      new Array(21).join(" ") +
                      "</bt:String>"
                  )
                  .replace(
                    /^\s{16}<bt:String id="CommandsButton\.Tooltip">?(?:.*?)^\s{16}<\/bt:String>/gms,
                    new Array(17).join(" ") +
                      '<bt:String id="CommandsButton.Tooltip" DefaultValue="' +
                      CommandsButtonTooltip +
                      '">\r\n' +
                      new Array(21).join(" ") +
                      '<bt:Override Locale="ru-RU" Value="' +
                      CommandsButtonTooltipRu +
                      '" />\r\n' +
                      new Array(17).join(" ") +
                      "</bt:String>"
                  )
                  .replace(
                    /^\s{20}<bt:String id="CommandsButton\.Tooltip">?(?:.*?)^\s{20}<\/bt:String>/gms,
                    new Array(21).join(" ") +
                      '<bt:String id="CommandsButton.Tooltip" DefaultValue="' +
                      CommandsButtonTooltip +
                      '">\r\n' +
                      new Array(25).join(" ") +
                      '<bt:Override Locale="ru-RU" Value="' +
                      CommandsButtonTooltipRu +
                      '" />\r\n' +
                      new Array(21).join(" ") +
                      "</bt:String>"
                  )
                  .replace(
                    /^\s{20}<bt:String id="CommandsMobileButton\.Label">?(?:.*?)^\s{20}<\/bt:String>/gms,
                    new Array(21).join(" ") +
                      '<bt:String id="CommandsMobileButton.Label" DefaultValue="' +
                      CommandsMobileButtonLabel +
                      '">\r\n' +
                      new Array(25).join(" ") +
                      '<bt:Override Locale="ru-RU" Value="' +
                      CommandsMobileButtonLabelRu +
                      '" />\r\n' +
                      new Array(21).join(" ") +
                      "</bt:String>"
                  )
                  .replace(
                    /^\s{16}<bt:String id="TaskpaneButton\.Label">?(?:.*?)^\s{16}<\/bt:String>/gms,
                    new Array(17).join(" ") +
                      '<bt:String id="TaskpaneButton.Label" DefaultValue="' +
                      TaskpaneButtonLabel +
                      '">\r\n' +
                      new Array(21).join(" ") +
                      '<bt:Override Locale="ru-RU" Value="' +
                      TaskpaneButtonLabelRu +
                      '" />\r\n' +
                      new Array(17).join(" ") +
                      "</bt:String>"
                  )
                  .replace(
                    /^\s{20}<bt:String id="TaskpaneButton\.Label">?(?:.*?)^\s{20}<\/bt:String>/gms,
                    new Array(21).join(" ") +
                      '<bt:String id="TaskpaneButton.Label" DefaultValue="' +
                      TaskpaneButtonLabel +
                      '">\r\n' +
                      new Array(25).join(" ") +
                      '<bt:Override Locale="ru-RU" Value="' +
                      TaskpaneButtonLabelRu +
                      '" />\r\n' +
                      new Array(21).join(" ") +
                      "</bt:String>"
                  )
                  .replace(
                    /^\s{16}<bt:String id="TaskpaneButton\.Tooltip">?(?:.*?)^\s{16}<\/bt:String>/gms,
                    new Array(17).join(" ") +
                      '<bt:String id="TaskpaneButton.Tooltip" DefaultValue="' +
                      TaskpaneButtonTooltip +
                      '">\r\n' +
                      new Array(21).join(" ") +
                      '<bt:Override Locale="ru-RU" Value="' +
                      TaskpaneButtonTooltipRu +
                      '" />\r\n' +
                      new Array(17).join(" ") +
                      "</bt:String>"
                  )
                  .replace(
                    /^\s{20}<bt:String id="TaskpaneButton\.Tooltip">?(?:.*?)^\s{20}<\/bt:String>/gms,
                    new Array(21).join(" ") +
                      '<bt:String id="TaskpaneButton.Tooltip" DefaultValue="' +
                      TaskpaneButtonTooltip +
                      '">\r\n' +
                      new Array(25).join(" ") +
                      '<bt:Override Locale="ru-RU" Value="' +
                      TaskpaneButtonTooltipRu +
                      '" />\r\n' +
                      new Array(21).join(" ") +
                      "</bt:String>"
                  );
              }
              return newContent;
            }
          }
        ]
      }),
      new WebpackAutoInject(),
      new HtmlWebpackPlugin({
        filename: "taskpane.html",
        template: "./src/taskpane/taskpane.ejs",
        chunks: ["polyfill", "taskpane"],
        templateParameters: {
          TASKPANE_PAGE_TITLE: TASKPANE_PAGE_TITLE,
          TASKPANE_FORM_TITLE: TASKPANE_FORM_TITLE,
          TASKPANE_FORM_MEETINGNAME_LABEL: TASKPANE_FORM_MEETINGNAME_LABEL,
          TASKPANE_FORM_ALLOWGUESTS_LABEL: TASKPANE_FORM_ALLOWGUESTS_LABEL,
          TASKPANE_FORM_POLICY_WARN_1: TASKPANE_FORM_POLICY_WARN_1,
          TASKPANE_FORM_POLICY_WARN_2: TASKPANE_FORM_POLICY_WARN_2,
          TASKPANE_FORM_POLICY_WARN_URL: TASKPANE_FORM_POLICY_WARN_URL,
          TASKPANE_FORM_BUTTON_CREATE_LABEL_1: TASKPANE_FORM_BUTTON_CREATE_LABEL_1,
          TASKPANE_FORM_BUTTON_CREATE_LABEL_2: TASKPANE_FORM_BUTTON_CREATE_LABEL_2,
          TASKPANE_FORM_BUTTON_CANCEL_LABEL: TASKPANE_FORM_BUTTON_CANCEL_LABEL
        }
      }),
      new HtmlWebpackPlugin({
        filename: "taskpane-ru.html",
        template: "./src/taskpane/taskpane.ejs",
        chunks: ["polyfill", "taskpane"],
        templateParameters: {
          TASKPANE_PAGE_TITLE: TASKPANE_PAGE_TITLE_RU,
          TASKPANE_FORM_TITLE: TASKPANE_FORM_TITLE_RU,
          TASKPANE_FORM_MEETINGNAME_LABEL: TASKPANE_FORM_MEETINGNAME_LABEL_RU,
          TASKPANE_FORM_ALLOWGUESTS_LABEL: TASKPANE_FORM_ALLOWGUESTS_LABEL_RU,
          TASKPANE_FORM_POLICY_WARN_1: TASKPANE_FORM_POLICY_WARN_1_RU,
          TASKPANE_FORM_POLICY_WARN_2: TASKPANE_FORM_POLICY_WARN_2_RU,
          TASKPANE_FORM_POLICY_WARN_URL: TASKPANE_FORM_POLICY_WARN_URL_RU,
          TASKPANE_FORM_BUTTON_CREATE_LABEL_1: TASKPANE_FORM_BUTTON_CREATE_LABEL_1_RU,
          TASKPANE_FORM_BUTTON_CREATE_LABEL_2: TASKPANE_FORM_BUTTON_CREATE_LABEL_2_RU,
          TASKPANE_FORM_BUTTON_CANCEL_LABEL: TASKPANE_FORM_BUTTON_CANCEL_LABEL_RU
        }
      }),
      new HtmlWebpackTagsPlugin({
        files: ["taskpane.html", "taskpane-ru.html"],
        tags: ["taskpane.css", "bootstrap.min.css"],
        append: false
      }),
      new HtmlWebpackPlugin({
        filename: "commands.html",
        template: "./src/commands/commands.html",
        chunks: ["polyfill", "commands"]
      }),
      new HtmlWebpackPlugin({
        hash: true,
        filename: "index.html",
        title: "outlook-addin-meeting-js",
        chunks: []
      }),
      new GenerateJsonPlugin("routes.json", routesData)
    ],
    devServer: {
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      https: options.https !== undefined ? options.https : await devCerts.getHttpsServerOptions(),
      port: process.env.npm_package_config_dev_server_port || 3000,
      proxy: {
        api: {
          bypass: (req, res) => {
            var body = "";
            var url = req.url;
            if (req.method == "POST") {
              req.on("readable", function() {
                var chunk = req.read();
                if (chunk) body += chunk;
              });
              req.on("end", function() {
                console.log(req.method, url, req.headers, body);
              });
            }
            switch (url) {
              case "/api/event":
              case "/api/event/":
                res.send(mockedApiData);
                break;
              case "/api/log":
              case "/api/log/":
                res.send("ok");
                break;
              default:
                if (url.startsWith("/api/4")) {
                  var httpCodeFromRegEx = url.match(/\/api\/4(\d{2})\/?/);
                  if (httpCodeFromRegEx) {
                    res.statusCode = "4" + httpCodeFromRegEx[1];
                    res.statusMessage = "Reason 4" + httpCodeFromRegEx[1];
                    res.send(mockedErrorData);
                  }
                }
                break;
            }
            return true;
          }
        }
      }
    }
  };

  return config;
};
