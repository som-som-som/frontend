import axios from "axios";
import type { Comment, Post, PostListItem } from "@/types/post";
import type { LoginData, RegisterData, TokenResponse, User } from "@/types/auth";

// 백엔드 주소를 코드에 박아두지 않고 환경(개발/배포)마다 바꿀 수 있게 둔다. 네트워크 오류는 호출하는 화면에서 처리한다.
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

// [중요] 모든 API 요청이 나가기 전에 실행되는 인터셉터입니다.
// localStorage에 저장된 토큰이 있다면 요청 헤더에 자동으로 'Authorization: Bearer <토큰>'을 추가합니다.
api.interceptors.request.use((config) => {
  // SSR(서버 사이드 렌더링) 환경에서는 window/localStorage가 없으므로 체크가 필요합니다.
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 게시글 목록을 불러와 메인·목록 화면에 보여준다. 실패 시 목록이 비거나 에러 메시지를 띄우는 쪽은 화면 책임이다.
export const fetchPosts = async (): Promise<PostListItem[]> => {
  const res = await api.get<PostListItem[]>("/posts");
  return res.data;
};

// 한 건의 게시글 상세(본문·댓글 등)를 불러온다. id에 해당 글이 없으면 서버 응답에 따라 화면에서 처리한다.
export const fetchPost = async (id: string): Promise<Post> => {
  const res = await api.get<Post>(`/posts/${id}`);
  return res.data;
};

export type CreatePostData = Omit<Post, "id" | "createdAt" | "likes" | "comments">;

// 사용자가 작성한 새 글을 등록하고, 등록된 글 정보를 돌려준다. 실패 시 글은 저장되지 않으며 화면에서 안내한다.
export const createPost = async (data: CreatePostData): Promise<Post> => {
  const res = await api.post<Post>("/posts", data);
  return res.data;
};

// 지정한 게시글을 삭제한다. 성공 후에는 목록·상세에서 해당 글이 사라져야 한다. 실패 시 삭제가 반영되지 않는다.
export const deletePost = async (id: string): Promise<void> => {
  await api.delete(`/posts/${id}`);
};

// 좋아요를 켜거나 끄는 요청을 보내고, 반영된 좋아요 수·상태가 담긴 글 정보를 돌려준다. 실패 시 화면의 숫자는 바뀌지 않는다.
export const toggleLike = async (id: string): Promise<Post> => {
  const res = await api.patch<Post>(`/posts/${id}/like`);
  return res.data;
};

export type CreateCommentData = Pick<Comment, "content" | "author">;

// 특정 글에 댓글을 달고, 저장된 댓글 정보를 돌려준다. 실패 시 댓글이 보이지 않으며 사용자에게 알린다.
export const createComment = async (
  postId: string,
  data: CreateCommentData
): Promise<Comment> => {
  const res = await api.post<Comment>(`/posts/${postId}/comments`, data);
  return res.data;
};

// 댓글 한 건을 삭제한다. 성공 후 해당 댓글은 목록에서 사라져야 한다. 실패 시 삭제가 유지되지 않는다.
export const deleteComment = async (commentId: string): Promise<void> => {
  await api.delete(`/comments/${commentId}`);
};

/**
 * --- 인증(Auth) 관련 API ---
 */

// 회원가입 요청을 보냅니다. 성공 시 토큰과 가입된 사용자 정보를 반환합니다.
export const register = async (data: RegisterData): Promise<TokenResponse> => {
  const res = await api.post<TokenResponse>("/auth/register", data);
  return res.data;
};

// 로그인 요청을 보냅니다. 성공 시 토큰과 사용자 정보를 반환합니다.
export const login = async (data: LoginData): Promise<TokenResponse> => {
  const res = await api.post<TokenResponse>("/auth/login", data);
  return res.data;
};

// 현재 로그인된 사용자의 정보를 가져옵니다. (인증 토큰 필요)
export const getMe = async (): Promise<User> => {
  const res = await api.get<User>("/auth/me");
  return res.data;
};
