"use client";

// 이 파일은 브라우저에서만 동작하는 커뮤니티 게시글 상세 페이지입니다.
// 사용자는 여기서 글 내용을 읽고, 좋아요를 누르고, 댓글을 작성할 수 있습니다.
import { useEffect, useState } from "react";
// 현재 URL의 게시글 id를 읽고, 다른 페이지로 이동할 때 사용합니다.
import { useParams, useRouter } from "next/navigation";
// 댓글 하나를 보기 좋게 표시해 주는 재사용 컴포넌트입니다.
import CommentItem from "@/components/CommentItem";
// 게시글 조회/삭제, 좋아요, 댓글 등록을 위한 서버 API입니다.
import { createComment, deletePost, fetchPost, toggleLike } from "@/lib/api";
// 게시글 데이터 구조(타입)를 가져와 상태를 안전하게 다룹니다.
import { Post } from "@/types/post";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";

// 픽셀 폰트 스타일을 여러 곳에서 재사용하기 위해 묶어 둡니다.
const px = { fontFamily: '"Press Start 2P", monospace' } as const;

// 댓글 입력 글자 수 제한(너무 긴 댓글 방지)입니다.
const MAX_COMMENT_LENGTH = 500;

// 게시글 상세 페이지의 메인 컴포넌트입니다.
export default function PostDetailPage() {
  // 뒤로가기/목록 이동 같은 화면 전환에 사용합니다.
  const router = useRouter();
  // URL에서 게시글 id 파라미터를 가져옵니다.
  const params = useParams<{ id: string }>();
  // id가 배열로 들어올 수도 있어 첫 값을 안전하게 사용합니다.
  const postId = Array.isArray(params.id) ? params.id[0] : params.id;

  // 현재 보고 있는 게시글 정보를 상태로 보관합니다.
  const [post, setPost] = useState<Post | null>(null);
  // 게시글 상세를 불러오는 동안 화면을 고정하기 위한 상태입니다.
  const [loading, setLoading] = useState(true);
  // API 호출 실패(예: 존재하지 않는 게시글) 시 사용자에게 안내합니다.
  const [error, setError] = useState<string | null>(null);
  // 좋아요 요청 중에는 중복 클릭을 막아 서버/화면이 엇갈리지 않게 합니다.
  const [liking, setLiking] = useState(false);
  // 삭제 요청 중에는 중복 클릭을 막고, 사용자가 결과를 기다릴 수 있게 합니다.
  const [deleting, setDeleting] = useState(false);
  // 댓글 입력창의 현재 텍스트 상태입니다.
  const [commentInput, setCommentInput] = useState("");
  // 댓글 저장 요청이 진행 중인지 여부입니다(중복 클릭 방지).
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Zustand 스토어에서 로그인 정보를 가져옵니다.
  const { user, isLoggedIn } = useAuthStore();

  // 페이지 진입 시(또는 게시글 id 변경 시) 게시글 상세를 불러옵니다.
  useEffect(() => {
    const loadPost = async () => {
      setLoading(true);
      setError(null);
      setPost(null);

      try {
        const selectedPost = await fetchPost(postId);

        setPost(selectedPost);
      } catch (err) {
        // axios 응답 구조를 바탕으로, 서버 에러 코드가 있을 때만 상태값을 추출합니다.
        const status = (err as { response?: { status?: number } }).response?.status;
        if (status === 404) {
          setError("존재하지 않는 게시글입니다.");
        } else {
          setError("게시글을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [postId]);

  // 좋아요 버튼 클릭 시 서버에 토글(추가/취소) 요청을 보냅니다.
  const handleLike = async () => {
    if (!post) return;
    if (liking) return;

    setLiking(true);

    // [주의] 현재 데이터 구조에 'isLiked' 여부가 없으므로 
    // 낙관적 업데이트(+1)를 하면 취소 시 숫자가 튀는 현상이 발생할 수 있습니다.
    // 서버 응답 속도가 빠르다면 낙관적 업데이트를 제거하고 결과만 반영하거나,
    // 백엔드에 isLiked 필드 추가를 요청하는 것이 좋습니다.

    try {
      const updated = await toggleLike(post.id);
      // 서버에서 계산된 정확한 값을 받아 화면을 갱신합니다.
      setPost(updated);
    } catch {
      alert("좋아요 반영에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLiking(false);
    }
  };


  // 게시글 삭제 버튼 클릭 시, 사용자 확인 후 서버에 삭제 요청을 보냅니다.
  const handleDelete = async () => {
    if (!post) return;
    if (deleting) return;

    // 실수로 글을 지우는 일을 줄이기 위해, 삭제 전에 한 번 더 확인합니다.
    const ok = confirm("정말 삭제하시겠습니까?");
    if (!ok) return;

    setDeleting(true);
    try {
      await deletePost(post.id);
      router.push("/community");
    } catch {
      alert("삭제에 실패했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setDeleting(false);
    }
  };

  // 댓글 등록 버튼 클릭 시 서버에 새 댓글 저장을 요청하고, 응답 결과를 화면 목록에 바로 반영합니다.
  const handleComment = async () => {
    // 게시글이 없거나 내용이 공백이면 전송하지 않습니다.
    if (!post || !commentInput.trim()) {
      alert("댓글 내용을 입력해 주세요.");
      return;
    }
    if (commentSubmitting) return;

    setCommentSubmitting(true);

    try {
      // 서버에 댓글 작성을 요청하고, 저장된 최종 댓글 정보를 응답으로 받습니다.
      const newComment = await createComment(post.id, {
        content: commentInput.trim(),
      });

      // 응답으로 받은 댓글을 현재 댓글 목록 끝에 붙여서 즉시 화면에 보여 줍니다.
      setPost((prev) => prev ? ({
        ...prev,
        comments: [...prev.comments, newComment],
      }) : prev);

      // 입력 값을 초기화해 다음 댓글을 바로 작성할 수 있게 합니다.
      setCommentInput("");
    } catch {
      // 네트워크/서버 오류 등으로 실패하면 사용자에게 안내합니다.
      alert("댓글을 등록하지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setCommentSubmitting(false);
    }
  };

  // 댓글 삭제가 성공하면, 서버와 동일하게 목록에서 해당 댓글을 즉시 제거합니다.
  const handleCommentDeleted = (commentId: string) => {
    setPost((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        comments: prev.comments.filter((c) => c.id !== commentId),
      };
    });
  };

  // 게시글 불러오는 동안 사용자에게 진행 상황을 보여줍니다.
  if (loading) {
    return (
      <div style={styles.pageWrapper}>
        <div style={styles.card}>
          <p style={{ ...px, fontSize: "8px", color: "#555" }}>로딩 중...</p>
        </div>
      </div>
    );
  }

  // 게시글을 찾지 못한 경우 안내 메시지와 목록 이동 버튼을 보여줍니다.
  if (error || !post) {
    // 없는 게시글 접근(또는 API 실패) 시의 예외 화면 UI입니다.
    return (
      <div style={styles.pageWrapper}>
        <div style={styles.card}>
          <p style={{ ...px, fontSize: "8px", color: "#dc2626" }}>{error ?? "게시글을 찾을 수 없습니다."}</p>
          <button type="button" onClick={() => router.push("/community")} style={styles.blueBtn}>
            ← 목록으로
          </button>
        </div>
      </div>
    );
  }

  // 작성일을 한국어 로케일 형식으로 보기 쉽게 변환합니다.
  const formattedDate = new Date(post.createdAt).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const isPostAuthor = isLoggedIn && user?.username === post.author;

  // 게시글 상세 본문 UI를 렌더링합니다.
  return (
    /* 페이지 전체 래퍼(배경색/기본 폰트/여백)입니다. */
    <div style={styles.pageWrapper}>
      {/* 콘텐츠 최대 너비를 제한해 가독성을 높입니다. */}
      <div style={{ width: "100%", maxWidth: "720px", margin: "0 auto" }}>

        {/* 목록 화면으로 돌아가는 버튼입니다. */}
        <button
          type="button"
          onClick={() => router.push("/community")}
          style={styles.backBtn}
        >
          ← 목록으로
        </button>

        {/* 게시글 본문을 담는 카드 영역입니다. */}
        <div style={styles.card}>
          {/* 게시글 제목 텍스트입니다. */}
          <h1 style={{ ...px, fontSize: "13px", color: "#000", margin: "0 0 12px", lineHeight: 1.6 }}>
            {post.title}
          </h1>

          {/* 작성자와 작성일을 한 줄에 나란히 보여줍니다. */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <span style={{ ...px, fontSize: "7px", color: "#2563eb" }}>{post.author}</span>
            <span style={{ ...px, fontSize: "7px", color: "#555" }}>{formattedDate}</span>
          </div>

          {/* 본문 구역을 나누는 점선 구분선입니다. */}
          <div style={styles.dashedDivider} />

          {/* 게시글 본문 내용입니다(줄바꿈 유지). */}
          <p style={{ ...px, fontSize: "8px", color: "#222", lineHeight: 2, whiteSpace: "pre-wrap", margin: "20px 0" }}>
            {post.content}
          </p>

          {/* 반응 영역(좋아요/댓글 수) 앞의 구분선입니다. */}
          <div style={styles.dashedDivider} />

          {/* 좋아요 버튼과 댓글 개수 요약 영역입니다. */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px", marginTop: "20px", flexWrap: "wrap" }}>
            {/* 사용자가 좋아요를 누르거나 취소하는 버튼입니다. */}
            <button
              type="button"
              onClick={handleLike}
              disabled={liking}
              style={{
                ...styles.likeBtn,
                background: "#ef4444",
                opacity: liking ? 0.7 : 1,
                cursor: liking ? "not-allowed" : "pointer",
              }}
            >
              <span style={{ marginRight: "6px" }}>♥</span>
              <span style={{ ...px, fontSize: "8px" }}>
                좋아요 {post.likes}
              </span>
            </button>

            {/* 댓글 아이콘과 댓글 수를 표시합니다. */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "14px", color: "#555" }}>💬</span>
              <span style={{ ...px, fontSize: "8px", color: "#444" }}>댓글 {post.comments.length}</span>
            </div>

            {/* 게시글 삭제 버튼입니다. (본인인 경우에만 표시) */}
            {isPostAuthor && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  ...styles.deleteBtn,
                  opacity: deleting ? 0.7 : 1,
                  cursor: deleting ? "not-allowed" : "pointer",
                }}
              >
                {deleting ? "삭제 중..." : "삭제"}
              </button>
            )}
          </div>
        </div>

        {/* 댓글 섹션 제목입니다. */}
        <h2 style={{ ...px, fontSize: "10px", color: "#000", margin: "28px 0 14px" }}>
          댓글 〈{post.comments.length}〉
        </h2>

        {/* 댓글이 하나 이상일 때 목록을 렌더링합니다. */}
        {post.comments.length > 0 && (
          <div style={{ display: "grid", gap: "12px", marginTop: "12px" }}>
            {/* 각 댓글을 CommentItem으로 순회 렌더링합니다. */}
            {post.comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} onDeleted={handleCommentDeleted} />
            ))}
          </div>
        )}

        {/* 댓글이 없을 때는 빈 상태 안내 문구를 보여줍니다. */}
        {post.comments.length === 0 && (
          <p style={{ ...px, fontSize: "8px", color: "#666", marginTop: "12px" }}>
            아직 댓글이 없습니다.
          </p>
        )}

        {/* 새 댓글을 입력하고 등록하는 카드입니다. */}
        <div style={styles.card}>
          {isLoggedIn ? (
            <>
              {/* 댓글 본문 입력창입니다. */}
              <textarea
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value.slice(0, MAX_COMMENT_LENGTH))}
                placeholder="댓글을 입력하세요"
                rows={4}
                style={styles.textarea}
              />
              {/* 현재 입력 글자 수와 최대 제한을 함께 표시합니다. */}
              <div style={{ ...px, fontSize: "7px", color: "#888", textAlign: "right", marginBottom: "12px" }}>
                {commentInput.length} / {MAX_COMMENT_LENGTH}
              </div>
              {/* 댓글 등록 실행 버튼입니다. */}
              <button
                type="button"
                onClick={handleComment}
                disabled={commentSubmitting || !commentInput.trim()}
                style={{
                  ...styles.blueBtn,
                  opacity: commentSubmitting || !commentInput.trim() ? 0.6 : 1,
                  cursor: commentSubmitting || !commentInput.trim() ? "not-allowed" : "pointer",
                }}
              >
                {commentSubmitting ? "등록 중..." : "댓글 달기"}
              </button>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "10px 0" }}>
              <p style={{ ...px, fontSize: "8px", color: "#666", marginBottom: "16px" }}>
                로그인 후 댓글을 작성할 수 있습니다.
              </p>
              <Link href="/login" style={{
                ...styles.blueBtn,
                fontSize: "10px",
                textDecoration: "none",
                display: "inline-block"
              }}>
                로그인하러 가기
              </Link>
            </div>
          )}
        </div>


      </div>
    </div>
  );
}

// 아래는 화면에서 재사용하는 스타일 모음입니다.
const styles = {
  // 페이지 전체 배경과 기본 여백을 정의합니다.
  pageWrapper: {
    width: "100%",
    padding: "32px 24px",
  } as React.CSSProperties,

  // 흰색 카드(본문/입력창)에 공통으로 쓰는 스타일입니다.
  card: {
    background: "#fff",
    border: "3px solid #000",
    boxShadow: "6px 6px 0 #000",
    padding: "28px",
    marginBottom: "12px",
  } as React.CSSProperties,

  // "목록으로" 텍스트 버튼 스타일입니다.
  backBtn: {
    fontFamily: '"Press Start 2P", monospace',
    fontSize: "9px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#000",
    marginBottom: "20px",
    padding: 0,
  } as React.CSSProperties,

  // 콘텐츠 블록 사이를 나누는 점선 스타일입니다.
  dashedDivider: {
    borderTop: "2px dashed #ccc",
    margin: "0",
  } as React.CSSProperties,

  // 좋아요 버튼의 기본 외형 스타일입니다.
  likeBtn: {
    fontFamily: '"Press Start 2P", monospace',
    display: "flex",
    alignItems: "center",
    background: "#ef4444",
    color: "#fff",
    border: "3px solid #000",
    boxShadow: "3px 3px 0 #000",
    padding: "10px 16px",
    cursor: "pointer",
    fontSize: "13px",
  } as React.CSSProperties,

  // 기본 파란색 액션 버튼 스타일입니다(목록 이동/댓글 등록 등).
  blueBtn: {
    fontFamily: '"Press Start 2P", monospace',
    fontSize: "8px",
    background: "#93c5fd",
    color: "#000",
    border: "3px solid #000",
    boxShadow: "3px 3px 0 #000",
    padding: "10px 16px",
    cursor: "pointer",
  } as React.CSSProperties,

  // 위험 동작(삭제) 버튼 스타일입니다. 실수 클릭을 줄이기 위해 색을 강하게 구분합니다.
  deleteBtn: {
    fontFamily: '"Press Start 2P", monospace',
    fontSize: "8px",
    background: "#fecaca",
    color: "#000",
    border: "3px solid #000",
    boxShadow: "3px 3px 0 #000",
    padding: "10px 16px",
  } as React.CSSProperties,

  // 댓글 입력 textarea의 공통 스타일입니다.
  textarea: {
    fontFamily: '"Press Start 2P", monospace',
    width: "100%",
    fontSize: "8px",
    border: "2px solid #000",
    padding: "12px",
    outline: "none",
    resize: "vertical" as const,
    marginBottom: "8px",
    boxSizing: "border-box" as const,
    lineHeight: 1.8,
  } as React.CSSProperties,

  // 댓글 작성자 이름 input 스타일입니다.
  authorInput: {
    fontFamily: '"Press Start 2P", monospace',
    width: "100%",
    fontSize: "8px",
    border: "2px solid #000",
    padding: "8px 10px",
    outline: "none",
    boxSizing: "border-box" as const,
  } as React.CSSProperties,
};