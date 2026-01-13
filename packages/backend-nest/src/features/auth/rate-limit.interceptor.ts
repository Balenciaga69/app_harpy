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
/**
 * ??????
 * ?冽???IP ??嗅?????抒?隢?甈⊥
 */
@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  constructor(@Inject(InjectionTokens.RedisClient) private readonly redis: Redis) {}
  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const ip = (request.ip || request.connection?.remoteAddress || '127.0.0.1') as string
    // ???嗅?蝡舫??瘜?????key ???典?
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const method = (request.method ?? 'UNKNOWN') as string
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const path = (request.path ?? '/') as string
    const key = `rate-limit:${method}:${path}:${ip}`
    // 瑼Ｘ閮??
    const count = await this.redis.incr(key)
    // 擐活隢??身蝵桅?????
    if (count === 1) {
      await this.redis.expire(key, 60) // 1 ????
    }
    // ?嚗??? 5 甈∟?瘙?
    if (count > 5) {
      throw new HttpException('Too many requests. Maximum 5 requests per minute.', HttpStatus.TOO_MANY_REQUESTS)
    }
    return next.handle()
  }
}
/**
 * ?餃蝡舫?撠??????
 * ?游?潛??嚗? 5 ?? 3 甈?
 */
@Injectable()
export class LoginRateLimitInterceptor implements NestInterceptor {
  constructor(@Inject(InjectionTokens.RedisClient) private readonly redis: Redis) {}
  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const ip = (request.ip || request.connection?.remoteAddress || '127.0.0.1') as string
    const key = `rate-limit:login:${ip}`
    // 瑼Ｘ閮??
    const count = await this.redis.incr(key)
    // 擐活隢??身蝵桅?????
    if (count === 1) {
      await this.redis.expire(key, 5 * 60) // 5 ????
    }
    // ?嚗? 5 ?? 3 甈∠?亙?閰?
    if (count > 3) {
      throw new HttpException(
        'Too many login attempts. Maximum 3 attempts per 5 minutes.',
        HttpStatus.TOO_MANY_REQUESTS
      )
    }
    return next.handle()
  }
}
