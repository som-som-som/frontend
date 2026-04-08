/**
 * 서비스의 사용자 정보를 나타냅니다.
 */
export interface User {
    id: string;
    username: string;
    email: string;
    createdAt: string;
}

/**
 * 인증(로그인/회원가입) 성공 시 서버에서 받는 토큰 및 사용자 정보 응답 형식입니다.
 */
export interface TokenResponse {
    access_token: string;
    token_type: string;
    user: User;
}
