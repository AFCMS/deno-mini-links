import * as kvOauth from "jsr:@deno/kv-oauth";

const mainURL = Deno.env.get("DML_MAIN_URL");

const ghConfig = kvOauth.createGitHubOAuthConfig({
  redirectUri: `${mainURL}/oauth/github`,
});

const ghHelpers = kvOauth.createHelpers(ghConfig);

const kv = await Deno.openKv();

Deno.serve(async (req) => {
  const pathname = new URL(req.url).pathname;

  switch (pathname) {
    case "/": {
      return new Response("Deno Mini Links");
    }
    case "/oauth/signin": {
      return await ghHelpers.signIn(req);
    }
    case "/oauth/callback": {
      const { response } = await ghHelpers.handleCallback(req);
      return response;
    }
    case "/oauth/signout": {
      return await ghHelpers.signOut(req);
    }
    case "/protected-route": {
      return (await ghHelpers.getSessionId(req)) === undefined
        ? new Response("Unauthorized", { status: 401 })
        : new Response("You are allowed");
    }
    default: {
      const rurl = await kv.get<string>([pathname]);
      if (rurl.value) {
        return Response.redirect(rurl.value);
      }
      return new Response("Not Found", { status: 404 });
    }
  }
});
