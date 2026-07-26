export async function onRequest(context) {
  const { request, next, env } = context;
  const Authorization = request.headers.get('Authorization');

  const USERNAME = env.BASIC_AUTH_USERNAME;
  const PASSWORD = env.BASIC_AUTH_PASSWORD;

  const expectedAuth = 'Basic ' + btoa(`${USERNAME}:${PASSWORD}`);

  if (Authorization === expectedAuth) {
    return await next();
  }

  return new Response('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Access Restricted"',
    },
  });
}
