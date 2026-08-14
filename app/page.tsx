"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Message {
  id: number;
  content: string;
  created_at: string;
}

// 四种浅色便利贴底色：便签黄 / 草绿 / 湖蓝 / 金，循环轮换
const NOTE_BG = ["#FBE8A6", "#DCEFE0", "#E2EEF4", "#FBF0CE"];

// 由 id 生成稳定的轻微倾斜角度（-1.2deg ~ +1.5deg），刷新后不乱跳
function tiltFor(id: number): number {
  const x = Math.sin(id * 99.137) * 10000;
  const frac = x - Math.floor(x); // 0 ~ 1
  return -1.2 + frac * 2.7;
}

// 相对时间：刚刚 / x 分钟前 / x 小时前 / x 天前 …
function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - then);
  const min = Math.floor(diff / 60000);
  if (min < 1) return "刚刚";
  if (min < 60) return `${min} 分钟前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} 小时前`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} 天前`;
  const month = Math.floor(day / 30);
  if (month < 12) return `${month} 个月前`;
  return `${Math.floor(month / 12)} 年前`;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // 打开页面时拉取全部留言，按时间倒序（最新在最上）
  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (!active) return;
      if (error) {
        setError("读取留言失败，请稍后刷新重试");
      } else {
        setMessages((data as Message[]) ?? []);
      }
      setLoaded(true);
    })();
    return () => {
      active = false;
    };
  }, []);

  // Realtime 订阅：任何人对 messages 表 INSERT，所有打开页面的人即时收到新便签
  useEffect(() => {
    const channel = supabase
      .channel("messages-wall")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const row = payload.new as Message;
          setMessages((prev) =>
            prev.some((m) => m.id === row.id) ? prev : [row, ...prev],
          );
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function handleSubmit() {
    const content = input.trim();
    if (!content || submitting) return;
    setSubmitting(true);
    setError(null);
    const { data, error } = await supabase
      .from("messages")
      .insert({ content })
      .select();
    setSubmitting(false);
    if (error) {
      setError("贴上墙失败了，再试一次吧");
      return;
    }
    // 写入成功后：新留言置顶 + 清空输入框（去重，避免和实时回播重复）
    if (data && data[0]) {
      const row = data[0] as Message;
      setMessages((prev) =>
        prev.some((m) => m.id === row.id) ? prev : [row, ...prev],
      );
    }
    setInput("");
  }

  const canSubmit = input.trim().length > 0 && !submitting;

  return (
    <main className="mx-auto max-w-5xl px-4 pb-20 pt-10 sm:px-6">
      {/* 标题区 */}
      <header className="mb-8 text-center">
        <h1 className="font-zh-title text-[34px] leading-tight text-ink sm:text-[44px]">
          LPT 匿名留言墙
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-[15px] text-ink-soft sm:text-[16px]">
          不用真名，随便写——对新学期的期待、想对自己说的话、想对战友说的话
        </p>
      </header>

      {/* 输入区：一张待填写的空白便签 */}
      <section
        className="note mx-auto mb-10 max-w-xl"
        style={{ ["--tilt" as string]: "-1deg", background: "#FBE8A6" } as React.CSSProperties}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleSubmit();
          }}
          rows={3}
          maxLength={500}
          placeholder="写点什么贴上墙吧……"
          className="w-full resize-none rounded-xl border-1.5 border-ink bg-[#FFFDF6] p-3 text-[16px] leading-relaxed text-ink outline-none placeholder:text-ink-soft/70"
          style={{ borderWidth: "1.5px" }}
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-[13px] text-ink-soft">
            {input.trim().length}/500 · 匿名发布
          </span>
          <button
            type="button"
            className="btn"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            {submitting ? "贴上去…" : "贴上墙"}
          </button>
        </div>
      </section>

      {error && (
        <p className="mb-6 text-center text-[14px] text-accent">{error}</p>
      )}

      {/* 留言墙：便利贴错落排列 */}
      {loaded && messages.length === 0 ? (
        <p className="text-center text-[16px] text-ink-soft">
          还没有留言，来当第一个吧～
        </p>
      ) : (
        <section className="columns-1 gap-5 sm:columns-2 lg:columns-3">
          {messages.map((m, i) => (
            <div
              key={m.id}
              className="note mb-5"
              style={
                {
                  ["--tilt" as string]: `${tiltFor(m.id)}deg`,
                  background: NOTE_BG[i % NOTE_BG.length],
                } as React.CSSProperties
              }
            >
              <div className="pop">
                <p className="whitespace-pre-wrap break-words text-[16px] leading-relaxed text-ink">
                  {m.content}
                </p>
                <div className="mt-3 flex justify-end">
                  <span className="badge">{relativeTime(m.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
