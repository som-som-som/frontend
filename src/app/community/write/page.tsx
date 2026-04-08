"use client";

// 화면 상태를 기억하기 위한 React 훅을 사용한다.
import { useState } from "react";
// 글 저장 후 이동을 위해 Next 라우터를 사용한다.
import { useRouter } from "next/navigation";
// 백엔드에 새 게시글을 저장하는 API를 사용한다.
import { createPost } from "@/lib/api";

export default function CommunityWritePage() {
  // 등록 완료 후 원하는 화면으로 이동시키기 위한 라우터 객체다.
  const router = useRouter();
  // 레트로 스타일 폰트를 재사용하기 위해 공통 스타일 객체를 만든다.
  const px = { fontFamily: '"Press Start 2P", monospace' } as const;

  // 사용자가 입력한 제목을 저장한다.
  const [title, setTitle] = useState("");
  // 사용자가 입력한 본문 내용을 저장한다.
  const [content, setContent] = useState("");
  // API 호출 중인지 여부를 저장해 중복 클릭·로딩 문구를 제어한다.
  const [submitting, setSubmitting] = useState(false);

  // "등록하기"를 눌렀을 때 입력값 검사, 서버 저장, 이동을 한 번에 처리한다.
  const handleSubmit = async () => {
    // 비어 있는 필드가 있으면 서버까지 가지 않고 즉시 안내한다.
    if (!title.trim() || !content.trim()) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    // 중복 제출을 막고, 버튼 문구를 "작성 중..."으로 바꾸기 위해 상태를 켠다.
    setSubmitting(true);
    try {
      // 서버에 새 글 등록을 요청한다. 실패 시 catch에서 처리된다.
      await createPost({
        title: title.trim(),
        content: content.trim(),
      });
      // 성공하면 목록 화면으로 이동해 방금 작성한 글을 목록에서 확인하게 한다.
      router.push("/community");
    } catch (err) {
      // 네트워크·서버 오류 등으로 저장에 실패했을 때 사용자에게 알린다.
      alert("게시글 작성에 실패했습니다.");
      // 실패 시에만 다시 작성 가능하도록 로딩 상태를 해제한다.
      setSubmitting(false);
    }
  };

  // 버튼 비활성화 조건: 필수 입력값 부족 또는 API 호출 중.
  const isSubmitDisabled =
    submitting || !title.trim() || !content.trim();

  return (
    // 화면 전체 배경과 중앙 정렬을 담당하는 바깥 컨테이너다.
    <div
      style={{
        width: "100%",
        padding: "32px 24px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* 실제 입력 폼의 최대 너비를 제한하는 래퍼다. */}
      <div style={{ width: "100%", maxWidth: "720px" }}>
        {/* 목록으로 돌아가는 뒤로가기 버튼이다. */}
        <button
          type="button"
          /* 취소 의도를 반영해 글 목록 페이지로 이동한다. */
          onClick={() => router.push("/community")}
          style={{
            // 공통 폰트를 적용하고 버튼 텍스트 크기를 지정한다.
            ...px, fontSize: "9px", background: "transparent",
            // 버튼 기본 테두리를 제거해 텍스트 링크처럼 보이게 한다.
            border: "none", cursor: "pointer", color: "#000",
            // 아래 카드와의 간격 및 아이콘 정렬을 맞춘다.
            marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px",
          }}
        >
          ← 목록으로
        </button>

        {/* 게시글 입력 필드를 담는 카드 영역이다. */}
        <div
          style={{
            // 카드 배경을 흰색으로 지정해 입력 영역을 분리한다.
            background: "#fff",
            // 레트로 스타일의 굵은 외곽선.
            border: "3px solid #000",
            // 입체감 있는 그림자.
            boxShadow: "6px 6px 0 #000",
            // 카드 내부 여백.
            padding: "28px",
            // 아래 요소와 간격.
            marginBottom: "32px",
            // 카드 최대 너비 제한.
            maxWidth: "720px",
          }}
        >
          {/* 화면 제목: 사용자가 현재 "글 작성" 단계임을 인지하게 한다. */}
          <h1 style={{ ...px, fontSize: "12px", color: "#000", marginBottom: "24px", letterSpacing: "2px" }}>
            새 글 작성
          </h1>

          {/* 제목 입력 라벨 */}
          <p style={{ ...px, fontSize: "8px", color: "#444", marginBottom: "8px" }}>제목</p>
          <input
            /* 제목 입력값을 상태와 연결한다. */
            value={title}
            /* 제목 변경 시 즉시 상태를 업데이트한다. */
            onChange={(e) => setTitle(e.target.value)}
            /* 제목 입력 안내 문구. */
            placeholder="제목을 입력하세요"
            /* 지나치게 긴 제목을 제한한다. */
            maxLength={100}
            style={{
              ...px,
              width: "100%",
              boxSizing: "border-box",
              fontSize: "8px",
              border: "2px solid #000",
              padding: "12px",
              marginBottom: "16px",
              outline: "none",
            }}
          />

          {/* 본문 입력 라벨 */}
          <p style={{ ...px, fontSize: "8px", color: "#444", marginBottom: "8px" }}>내용</p>
          <textarea
            /* 본문 입력값을 상태와 연결한다. */
            value={content}
            /* 본문 변경 시 즉시 상태를 업데이트한다. */
            onChange={(e) => setContent(e.target.value)}
            /* 본문 입력 안내 문구. */
            placeholder="내용을 입력하세요"
            /* 저장 성능과 가독성을 위해 본문 길이를 제한한다. */
            maxLength={2000}
            /* 초기 표시 줄 수. */
            rows={8}
            style={{
              ...px,
              width: "100%",
              boxSizing: "border-box",
              fontSize: "8px",
              border: "2px solid #000",
              padding: "12px",
              // 필요 시 세로로만 크기 조절을 허용한다.
              resize: "vertical",
              outline: "none",
              // 긴 문장 가독성을 높이는 줄 간격.
              lineHeight: 2,
              // 글자수 표시 영역과의 간격.
              marginBottom: "8px",
            }}
          />
          {/* 현재 입력한 글자 수를 보여줘 제한 초과를 미리 방지한다. */}
          <div style={{ ...px, fontSize: "7px", color: "#888", textAlign: "right", marginBottom: "20px" }}>
            {content.length} / 2000
          </div>

          {/* 실제 등록 액션을 실행하는 버튼 */}
          <button
            type="button"
            /* 클릭 시 검증-저장-이동 로직을 실행한다. */
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            style={{
              ...px,
              fontSize: "8px",
              background: "#93c5fd",
              color: "#000",
              border: "3px solid #000",
              boxShadow: "3px 3px 0 #000",
              padding: "12px 20px",
              cursor: isSubmitDisabled ? "not-allowed" : "pointer",
              transition: "all 0.1s",
              opacity: isSubmitDisabled ? 0.6 : 1,
            }}
            /* 버튼에 마우스를 올렸을 때 눌린 느낌을 주어 상호작용을 명확히 한다. */
            onMouseEnter={(e) => {
              if (isSubmitDisabled) return;
              e.currentTarget.style.boxShadow = "1px 1px 0 #000";
              e.currentTarget.style.transform = "translate(2px,2px)";
            }}
            /* 마우스가 벗어나면 원래 모양으로 복원한다. */
            onMouseLeave={(e) => {
              if (isSubmitDisabled) return;
              e.currentTarget.style.boxShadow = "3px 3px 0 #000";
              e.currentTarget.style.transform = "translate(0,0)";
            }}
          >
            {submitting ? "작성 중..." : "등록하기"}
          </button>
        </div>
      </div>
    </div>
  );
}