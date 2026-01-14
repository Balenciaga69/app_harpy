/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common'
import Redis from 'ioredis'
import { Observable } from 'rxjs'
import { InjectionTokens } from '../shared/providers/injection-tokens'
@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  constructor(@Inject(InjectionTokens.RedisClient) private readonly redis: Redis) {}
  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest()
    const ip = (request.ip || request.connection?.remoteAddress || '127.0.0.1') as string
    const method = (request.method ?? 'UNKNOWN') as string
    const path = (request.path ?? '/') as string
    const key = `rate-limit:${method}:${path}:${ip}`
    const count = await this.redis.incr(key)
    if (count === 1) {
      await this.redis.expire(key, 60)
    }
    if (count > 5) {
      throw new HttpException('Too many requests. Maximum 5 requests per minute.', HttpStatus.TOO_MANY_REQUESTS)
    }
    return next.handle()
  }
}
@Injectable()
export class LoginRateLimitInterceptor implements NestInterceptor {
  constructor(@Inject(InjectionTokens.RedisClient) private readonly redis: Redis) {}
  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest()
    const ip = (request.ip || request.connection?.remoteAddress || '127.0.0.1') as string
    const key = `rate-limit:login:${ip}`
    const count = await this.redis.incr(key)
    if (count === 1) {
      await this.redis.expire(key, 5 * 60)
    }
    if (count > 3) {
      throw new HttpException(
        'Too many login attempts. Maximum 3 attempts per 5 minutes.',
        HttpStatus.TOO_MANY_REQUESTS
      )
    }
    return next.handle()
  }
}
