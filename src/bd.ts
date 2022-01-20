export class DB {
  public static select(query: string): unknown {
    console.log(query);
    return undefined;
  }
  public static insert(dao: unknown): string {
    console.log(dao);
    return Date.now().toString();
  }
  public static update(dao: unknown): number {
    console.log(dao);
    return 1;
  }
}
