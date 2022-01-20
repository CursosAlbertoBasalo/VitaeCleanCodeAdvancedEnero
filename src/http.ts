export class HTTP {
  static request(url: string, options: unknown): unknown {
    console.log(url, options);
    return { url, status: 200, body: { data: {} } };
  }
}
