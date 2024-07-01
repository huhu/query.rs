export async function onRequest(context) {
    let response = await context.next();
    let host = context.request.headers.get('host');
    if (host in ["query.rs", "localhost:8080"]) {
        response.headers.append('Access-Control-Allow-Origin', host);
    }
    return response;
}