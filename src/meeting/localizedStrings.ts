export var localizedStrings = (function() {
  "use strict";

  var localizedStrings: any = {};

  // JSON object for English strings
  localizedStrings.EN = {
    MessageBody: '<br><a href="%(url)s" target="_blank">%(text)s</a>',
    Success: "Success",
    Error: "Error",
    Errors: {
      FailedToGetIdentityToken: "Failed to get User Identity Token",
      FailedToGetSubject: "Failed to get subject",
      FailedToSetLocation: "Failed to set location",
      FailedToGetHTMLBody: "Failed to get HTML body",
      FailedToSetHTMLBody: "Failed to set HTML body",
      ServerRequestFailed: "Server Request Failed",
      ServerRequestFailedMessage: "%(status)s %(statusText)s"
    },
    Trace: {
      SuccessToGetIdentityToken: "Success to get User Identity Token",
      SuccessToGetSubject: "Success to get subject",
      SuccessToSetLocation: "Success to set location",
      SuccessToGetBody: "Success to get body",
      SuccessToSetBody: "Success to set body",
      ProcessApiRequestStarted: "Api Request Initiated",
      ProcessApiRequestCompleted: "Api Request Completed",
      ProcessApiResponseStarted: "Processing Api Response Initiated",
      ProcessApiResponseCompleted: "Processing Api Response Completed",
      EventStarted: "Event Processing STARTED",
      EventCompleted: "Event Processing COMPLETED",
      EventStopped: "Event Processing STOPPED"
    }
  };

  // JSON object for Spanish strings
  localizedStrings.RU = {
    MessageBody: '<br><a href="%(url)s" target="_blank">%(text)s</a>',
    Success: "Успешно",
    Error: "Ошибка",
    Errors: {
      FailedToGetIdentityToken: "Не удалось получить User Identity Token",
      SetBodyAllowingCompleted: "Не удалось получить тему сообщения",
      FailedToSetLocation: "Не удалось изменить место встречи",
      FailedToGetHTMLBody: "Не удалось получить тело сообщения",
      FailedToSetHTMLBody: "Не удалось изменить тело сообщения",
      ServerRequestFailed: "Не удалось получить данные от сервера",
      ServerRequestFailedMessage: "%(status)s %(statusText)s"
    },
    Trace: {
      SuccessToGetIdentityToken: "Успешно получен User Identity Token",
      SuccessToGetSubject: "Успешно получена тема сообщения",
      SuccessToSetLocation: "Успешно установлено место встречи",
      SuccessToGetBody: "Успешно получено тело сообщения",
      SuccessToSetBody: "Успешно установлено тело сообщения",
      ProcessApiRequestStarted: "Запрос данных API инициирован",
      ProcessApiRequestCompleted: "Запрос данных API выполнен",
      ProcessApiResponseStarted: "Обработка данных API инициирована",
      ProcessApiResponseCompleted: "Обработка данных API выполнена",
      EventStarted: "Обработка события ЗАПУЩЕНА",
      EventCompleted: "Обработка события ОКОНЧЕНА",
      EventStopped: "Обработка события ОСТАНОВЛЕНА"
    }
  };

  localizedStrings.getLocaleStrings = function(locale) {
    var text;

    // Get the resource strings that match the language.
    switch (locale) {
      case "en-US":
        text = localizedStrings.EN;
        break;
      case "ru-RU":
        text = localizedStrings.RU;
        break;
      default:
        text = localizedStrings.EN;
        break;
    }

    return text;
  };

  return localizedStrings;
})();
