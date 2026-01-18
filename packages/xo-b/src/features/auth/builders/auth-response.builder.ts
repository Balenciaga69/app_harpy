import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Response } from 'express'
import { CookieOptions } from 'express'
import { JWT_CONFIG } from '../auth.config'
import { LoginResponseDto, RefreshResponseDto } from '../dto/auth.dto'

/**
 * 認證響應構建器
 * 統一管理 Cookie 設置、Token 過期時間計算等響應相關邏輯
 * 讓 Controller 專注於請求解析與結果回傳
 */
@Injectable()
export class AuthResponseBuilder {
  constructor(private readonly configService: ConfigService) {}

  /**
   * 獲取 Cookie 基本配置
   * @private
   * @returns Cookie 選項
   */
  private getCookieOptions(): Omit<CookieOptions, 'maxAge'> {
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production'
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
    }
  }

  /**
   * 構建登入響應，包含 Cookie 設置信息
   * @param accessToken Access Token
   * @param refreshToken Refresh Token
   * @param userId 使用者 ID
   * @param username 使用者名稱
   * @returns 登入響應 DTO 與 Cookie 設置陣列
   */
  buildLoginResponse(
    accessToken: string,
    refreshToken: string,
    userId: string,
    username: string
  ): {
    response: LoginResponseDto
    cookies: Array<{ name: string; value: string; options: CookieOptions }>
  } {
    const baseOptions = this.getCookieOptions()
    const accessTtl =
      this.configService.get<number>('ACCESS_TOKEN_EXPIRY_SECONDS') ?? JWT_CONFIG.ACCESS_TOKEN_EXPIRY_SECONDS
    const refreshTtl =
      this.configService.get<number>('REFRESH_TOKEN_EXPIRY_SECONDS') ?? JWT_CONFIG.REFRESH_TOKEN_EXPIRY_SECONDS

    const response: LoginResponseDto = {
      accessToken,
      refreshToken,
      expiresIn: accessTtl,
      user: {
        userId,
        username,
      },
    }

    const cookies = [
      {
        name: 'accessToken',
        value: accessToken,
        options: {
          ...baseOptions,
          maxAge: accessTtl * 1000,
        } as CookieOptions,
      },
      {
        name: 'refreshToken',
        value: refreshToken,
        options: {
          ...baseOptions,
          maxAge: refreshTtl * 1000,
        } as CookieOptions,
      },
    ]

    return { response, cookies }
  }

  /**
   * 構建刷新 Token 響應，包含 Cookie 設置信息
   * @param accessToken 新的 Access Token
   * @param refreshToken 新的 Refresh Token（Token Rotation）
   * @returns 刷新響應 DTO 與 Cookie 設置陣列
   */
  buildRefreshResponse(
    accessToken: string,
    refreshToken: string
  ): {
    response: RefreshResponseDto
    cookies: Array<{ name: string; value: string; options: CookieOptions }>
  } {
    const baseOptions = this.getCookieOptions()
    const accessTtl =
      this.configService.get<number>('ACCESS_TOKEN_EXPIRY_SECONDS') ?? JWT_CONFIG.ACCESS_TOKEN_EXPIRY_SECONDS
    const refreshTtl =
      this.configService.get<number>('REFRESH_TOKEN_EXPIRY_SECONDS') ?? JWT_CONFIG.REFRESH_TOKEN_EXPIRY_SECONDS

    const response: RefreshResponseDto = {
      accessToken,
      refreshToken,
      expiresIn: accessTtl,
    }

    const cookies = [
      {
        name: 'accessToken',
        value: accessToken,
        options: {
          ...baseOptions,
          maxAge: accessTtl * 1000,
        } as CookieOptions,
      },
      {
        name: 'refreshToken',
        value: refreshToken,
        options: {
          ...baseOptions,
          maxAge: refreshTtl * 1000,
        } as CookieOptions,
      },
    ]

    return { response, cookies }
  }

  /**
   * 在 Response 上設置所有 Cookie
   * @param res Express Response 對象
   * @param cookies Cookie 設置陣列
   */
  setCookies(res: Response, cookies: Array<{ name: string; value: string; options: CookieOptions }>): void {
    cookies.forEach(({ name, value, options }) => {
      res.cookie(name, value, options)
    })
  }

  /**
   * 在 Response 上清除認證相關 Cookie
   * @param res Express Response 對象
   */
  clearAuthCookies(res: Response): void {
    res.clearCookie('refreshToken', { path: '/' })
    res.clearCookie('accessToken', { path: '/' })
  }
}
