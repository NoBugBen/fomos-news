// ============================================================
// FOMOS NEWS — Subscribe Modal
// Design: Neural Cyberpunk — terminal-style email subscription
// ============================================================

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribeEmail } from "@/lib/api";
import { toast } from "sonner";
import { Mail, CheckCircle, Terminal } from "lucide-react";

interface SubscribeModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SubscribeModal({ open, onClose }: SubscribeModalProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("请输入有效的邮箱地址");
      return;
    }
    setLoading(true);
    try {
      const response = await subscribeEmail(email);
      setEmail(response.email);
      setSubmitMessage(
        response.alreadySubscribed
          ? "该邮箱已在订阅列表中，我们会继续发送最新简报。"
          : "明天早 8 点，第一份简报将发送至您的邮箱。",
      );
      setSubmitted(true);
      toast.success(
        response.alreadySubscribed
          ? "该邮箱已订阅，无需重复提交"
          : "订阅成功！每日简报将发送至您的邮箱",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "订阅失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setSubmitted(false);
      setSubmitMessage("");
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-[var(--terminal-bg)] border border-[var(--panel-border)] max-w-md p-0 gap-0 overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--panel-border)] bg-[var(--panel-bg)]">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--cyber-red)]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--cyber-orange)]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--neon)]" />
          </div>
          <DialogTitle className="terminal-text text-xs text-[var(--muted-foreground)] flex items-center gap-1.5 ml-2">
            <Terminal size={11} />
            SUBSCRIBE_TERMINAL v1.0
          </DialogTitle>
        </div>

        <div className="p-6">
          {!submitted ? (
            <>
              <div className="mb-6">
                <div className="terminal-text text-xs text-[var(--neon)] mb-2">
                  // FOMOS_DAILY_BRIEFING
                </div>
                <h2 className="font-['JetBrains_Mono'] text-lg font-bold text-[var(--foreground)] mb-2">
                  订阅每日 AI & Crypto 简报
                </h2>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  每天早 8 点，获取最新 AI 产品洞察、加密市场信号、Agent 排行榜更新。
                </p>
              </div>

              <div className="space-y-2 mb-6">
                {[
                  "💡 产品洞察日报（精选 10+ 条）",
                  "📈 TradingAgent 融资与动态",
                  "🎯 多空概率与恐慌指数",
                  "🏆 AI 模型 & Agent 排行榜",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 terminal-text text-xs text-[var(--muted-foreground)]">
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-8 bg-[var(--panel-bg)] border-[var(--panel-border)] terminal-text text-sm focus:border-[var(--neon)] focus:ring-[var(--neon-glow)] h-9"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-9 bg-[var(--neon)] text-[var(--terminal-bg)] hover:bg-[var(--neon-dim)] terminal-text text-xs font-bold tracking-wider"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                      CONNECTING...
                    </span>
                  ) : (
                    "SUBSCRIBE_NOW"
                  )}
                </Button>
                <p className="text-xs text-[var(--muted-foreground)] text-center terminal-text">
                  随时可取消订阅 · 不发垃圾邮件
                </p>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <CheckCircle size={40} className="mx-auto mb-4 text-[var(--neon)]" />
              <div className="terminal-text text-xs text-[var(--neon)] mb-2">// SUBSCRIPTION_CONFIRMED</div>
              <h3 className="font-['JetBrains_Mono'] font-bold text-lg mb-2">订阅成功！</h3>
              <p className="text-sm text-[var(--muted-foreground)] mb-4">
                {submitMessage}<br />
                <span className="text-[var(--neon)] terminal-text">{email}</span>
              </p>
              <Button
                onClick={handleClose}
                variant="outline"
                className="border-[var(--neon)] text-[var(--neon)] hover:bg-[var(--neon-glow)] terminal-text text-xs"
              >
                CLOSE_TERMINAL
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
