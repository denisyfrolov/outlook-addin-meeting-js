require("dotenv").config();

const devCerts = require("office-addin-dev-certs");
var webpack = require('webpack');
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WebpackAutoInject = require("webpack-auto-inject-version");
const GenerateJsonPlugin = require("generate-json-webpack-plugin");

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
  const ButtonLabel = process.env.BUTTONLABEL;
  const ButtonLabelRu = process.env.BUTTONLABEL_RU;
  const ButtonTooltip = process.env.BUTTONTOOLTIP;
  const ButtonTooltipRu = process.env.BUTTONTOOLTIP_RU;
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
  const config = {
    devtool: "source-map",
    entry: {
      polyfill: "@babel/polyfill",
      commands: "./src/commands/commands.ts",
      commandsLocalizedStrings: "./src/commands/commandsLocalizedStrings.ts"
    },
    node: { 
      fs: 'empty' 
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
        'process.env': {
          "API_URL": API_URL,
          "NotificationIcon": NotificationIcon,
          "EnableTrace": EnableTrace,
          "EnableDiagnosticInfoInTraceAndError": EnableDiagnosticInfoInTraceAndError,
          "EnableNotificationInformationalMessage": EnableNotificationInformationalMessage,
          "EnableNotificationErrorMessage": EnableNotificationErrorMessage,
          "ApplicationInsightsInstrumentationKey": ApplicationInsightsInstrumentationKey,
          "ApplicationInsightsAppRole": ApplicationInsightsAppRole,
          "ApplicationInsightsEnableCorsCorrelation": ApplicationInsightsEnableCorsCorrelation,
          "ApplicationInsightsEableRequestHeaderTracking": ApplicationInsightsEableRequestHeaderTracking,
          "ApplicationInsightsEnableResponseHeaderTracking": ApplicationInsightsEnableResponseHeaderTracking,
          "LogstashUrl": LogstashUrl,
          "LogstashUsername": LogstashUsername,
          "LogstashPassword": LogstashPassword
        }
      }),
      new CopyWebpackPlugin({
        patterns: [
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
                  .replace(
                    /<AppDomain>(?:.*?)<\/AppDomain>/g,
                    "<AppDomain>" + AppDomain + "</AppDomain>"
                  )
                  .replace(
                    /<DisplayName>?(?:.*?)<\/DisplayName>/gms,
                    "<DisplayName DefaultValue=\"" + DisplayName + "\">\r\n" +
                    "		<Override Locale=\"ru-RU\" Value=\"" + DisplayNameRu + "\" />\r\n" +
                    "	</DisplayName>"
                  ).replace(
                    /<Description>?(?:.*?)<\/Description>/gms,
                    "<Description DefaultValue=\"" + Description + "\">\r\n" +
                    "		<Override Locale=\"ru-RU\" Value=\"" + DescriptionRu + "\" />\r\n" +
                    "	</Description>"
                  ).replace(
                    /<SupportUrl>?(?:.*?)<\/SupportUrl>/gms,
                    "<SupportUrl DefaultValue=\"" + SupportUrl + "\">\r\n" +
                    "		<Override Locale=\"ru-RU\" Value=\"" + SupportUrlRu + "\" />\r\n" +
                    "	</SupportUrl>"
                  ).replace(
                    /^\s{16}<bt:String id="Group\.Label">?(?:.*?)^\s{16}<\/bt:String>/gms,
                    new Array(17).join(" ") + "<bt:String id=\"Group.Label\" DefaultValue=\"" + GroupLabel + "\">\r\n" +
                    new Array(21).join(" ") + "<bt:Override Locale=\"ru-RU\" Value=\"" + GroupLabelRu + "\" />\r\n" +
                    new Array(17).join(" ") + "</bt:String>"
                  ).replace(
                    /^\s{20}<bt:String id="Group\.Label">?(?:.*?)^\s{20}<\/bt:String>/gms,
                    new Array(21).join(" ") + "<bt:String id=\"Group.Label\" DefaultValue=\"" + GroupLabel + "\">\r\n" +
                    new Array(25).join(" ") + "<bt:Override Locale=\"ru-RU\" Value=\"" + GroupLabelRu + "\" />\r\n" +
                    new Array(21).join(" ") + "</bt:String>"
                  ).replace(
                    /^\s{16}<bt:String id="Button\.Label">?(?:.*?)^\s{16}<\/bt:String>/gms,
                    new Array(17).join(" ") + "<bt:String id=\"Button.Label\" DefaultValue=\"" + ButtonLabel + "\">\r\n" +
                    new Array(21).join(" ") + "<bt:Override Locale=\"ru-RU\" Value=\"" + ButtonLabelRu + "\" />\r\n" +
                    new Array(17).join(" ") + "</bt:String>"
                  ).replace(
                    /^\s{20}<bt:String id="Button\.Label">?(?:.*?)^\s{20}<\/bt:String>/gms,
                    new Array(21).join(" ") + "<bt:String id=\"Button.Label\" DefaultValue=\"" + ButtonLabel + "\">\r\n" +
                    new Array(25).join(" ") + "<bt:Override Locale=\"ru-RU\" Value=\"" + ButtonLabelRu + "\" />\r\n" +
                    new Array(21).join(" ") + "</bt:String>"
                  ).replace(
                    /^\s{16}<bt:String id="Button\.Tooltip">?(?:.*?)^\s{16}<\/bt:String>/gms,
                    new Array(17).join(" ") + "<bt:String id=\"Button.Tooltip\" DefaultValue=\"" + ButtonTooltip + "\">\r\n" +
                    new Array(21).join(" ") + "<bt:Override Locale=\"ru-RU\" Value=\"" + ButtonTooltipRu + "\" />\r\n" +
                    new Array(17).join(" ") + "</bt:String>"
                  ).replace(
                    /^\s{20}<bt:String id="Button\.Tooltip">?(?:.*?)^\s{20}<\/bt:String>/gms,
                    new Array(21).join(" ") + "<bt:String id=\"Button.Tooltip\" DefaultValue=\"" + ButtonTooltip + "\">\r\n" +
                    new Array(25).join(" ") + "<bt:Override Locale=\"ru-RU\" Value=\"" + ButtonTooltipRu + "\" />\r\n" +
                    new Array(21).join(" ") + "</bt:String>"
                  );
              }
              return newContent;
            }
          }
        ]
      }),
      new WebpackAutoInject(),
      new HtmlWebpackPlugin({
        filename: "commands.html",
        template: "./src/commands/commands.html",
        chunks: ["polyfill", "commands", "commandsLocalizedStrings"]
      }),
      new HtmlWebpackPlugin({
        hash: true,
        filename: "index.html"
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
