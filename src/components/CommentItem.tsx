"use client";

import { useState } from "react";
import { deleteComment } from "@/lib/api";
import { Comment } from "@/types/post";
import { useAuthStore } from "@/store/authStore";

// 상세 화면에서 댓글 한 건을 보여주기 위한 입력 형식입니다.
interface CommentItemProps {
  comment: Comment;
  onDeleted: (commentId: string) => void;
}

export default function CommentItem({ comment, onDeleted }: CommentItemProps) {
  const { user, isLoggedIn } = useAuthStore();
  const isAuthor = isLoggedIn && user?.username === comment.author;

  // 댓글은 "누가 어떤 의견을 남겼는지"를 보여주는 신뢰 정보입니다.
  // 작성자/시간 표시가 없으면 대화 맥락이 약해져 커뮤니티 경험이 떨어질 수 있습니다.
  const formattedCreatedAt = new Date(comment.createdAt).toLocaleString("ko-KR");
  // 같은 댓글에서 연타 삭제를 막아, 서버/화면 상태가 어긋나는 것을 줄입니다.
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (deleting) return;

    // 사용자가 실수로 댓글을 지우는 상황을 줄이기 위한 1차 안전장치입니다.
    const ok = confirm("정말 댓글을 삭제하시겠습니까?");
    if (!ok) return;

    setDeleting(true);
    try {
      await deleteComment(comment.id);
      // 삭제가 성공하면, 부모 상태를 즉시 갱신해서 목록에서 사라지게 합니다.
      onDeleted(comment.id);
    } catch {
      alert("댓글 삭제에 실패했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "baseline" }}>
        <div>
          <strong>{comment.author}</strong>
          <span> · {formattedCreatedAt}</span>
        </div>
        {isAuthor && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            style={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: "7px",
              background: "#fecaca",
              color: "#000",
              border: "2px solid #000",
              padding: "6px 10px",
              boxShadow: "2px 2px 0 #000",
              cursor: deleting ? "not-allowed" : "pointer",
              opacity: deleting ? 0.7 : 1,
            }}
          >
            {deleting ? "삭제 중..." : "삭제"}
          </button>
        )}
      </div>
      <p style={{ margin: "8px 0 0" }}>{comment.content}</p>
    </div>
  );
}
