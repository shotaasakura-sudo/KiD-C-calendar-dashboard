import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const basicAuth = req.headers.get('authorization')
  
  // Basic認証の設定（必要なければスキップするパスなどをここで設定できます）
  // .env.local に設定したユーザー名とパスワードを読み込む
  const user = process.env.BASIC_AUTH_USER
  const password = process.env.BASIC_AUTH_PASSWORD

  // 認証情報が設定されていない場合や、開発環境などで認証を無効にしたい場合の対応
  if (!user || !password) {
    // もし環境変数が設定されていない場合は、アクセスを許可（または拒否）する
    // 今回は安全のため、環境変数がなければ拒否（または開発中はスルーなど）します
    // ここでは開発用にログを出して、スルーしない（またはする）設定が可能です
    // 一旦、設定がなければ制限をかけないこととします
    return NextResponse.next()
  }

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1]
    const [reqUser, reqPassword] = atob(authValue).split(':')

    if (reqUser === user && reqPassword === password) {
      return NextResponse.next()
    }
  }

  const url = req.nextUrl
  url.pathname = '/api/basicauth'

  return new NextResponse('Authentication Required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  })
}

// 適用するパスを指定
export const config = {
  matcher: [
    /*
     * 以下のパスを除くすべてのリクエストパスにマッチします：
     * - api (API routes) ※APIルートで認証が必要な場合は外します
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
