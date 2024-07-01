export async function onRequest(context) {
    let response = await context.next();
    response.headers.append('Access-Control-Allow-Origin', ["https://query.rs", "http://localhost:8080"]);
    return response;
}