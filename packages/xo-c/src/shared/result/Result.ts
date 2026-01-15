export class Result<T, E = string> {
  private constructor(
    readonly isSuccess: boolean,
    readonly value: T | null,
    readonly error: E | null
  ) {}
  static success<T, E = string>(value: T): Result<T, E> {
    return new Result(true, value, null) as Result<T, E>
  }
  static fail<T, E = string>(error: E): Result<T, E> {
    return new Result(false, null, error) as Result<T, E>
  }
  get isFailure(): boolean {
    return !this.isSuccess
  }
}
