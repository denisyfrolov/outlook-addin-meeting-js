module.exports = async function(context, req) {
  const mockedApiData = {
    url: "https://meeting.contoso.com/meeting/1",
    text: "Подключиться к собранию…"
  };

  context.res = {
    body: mockedApiData
  };

  context.log(req.method, req.url, req.headers, req.body);
};
