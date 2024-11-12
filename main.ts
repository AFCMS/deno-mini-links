const kv = await Deno.openKv();

Deno.serve(async (req) => {
  const pathname = new URL(req.url).pathname;

  if (pathname === "/") {
    return new Response("Deno Mini Links");
  }

  const rurl = await kv.get<string>([pathname]);
  if (rurl.value) {
    return Response.redirect(rurl.value);
  }

  return new Response("Not Found", { status: 404 });
});
