import { ConfigService } from '@nestjs/config'
export class JwtConfigHelper {
  static getValidatedSecret(configService: ConfigService, strategyName: string): string {
    const secret = configService.get<string>('JWT_SECRET')
    if (!secret) {
      throw new Error(
        `[JWT_SECRET] environment variable is required for ${strategyName}. ` +
          'Please set JWT_SECRET in your .env file or environment variables.'
      )
    }
    return secret
  }
}
