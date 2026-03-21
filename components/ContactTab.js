"use client";

import { Card, SectionTitle } from "./ui";

export default function ContactTab() {
  return (
    <div className="animate-fadeIn">
      <SectionTitle icon={<span style={{ fontSize: 20 }}>💬</span>}>Help & Support</SectionTitle>

      <Card className="mb-4">
        <h3 style={{ margin: "0 0 16px", fontSize: 17, fontWeight: 600 }}>Contact Us</h3>
        <p style={{ margin: "0 0 20px", fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>
          Facing any issues or have suggestions to improve UPSC Saathi? Reach out to us — we&apos;d love to hear from you.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* WhatsApp */}
          <a
            href="https://wa.me/918107890381?text=Hi%2C%20I%20need%20help%20with%20UPSC%20Saathi%20app"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "14px 18px", borderRadius: 10,
              background: "rgba(37,211,102,0.08)", border: "1px solid rgba(37,211,102,0.3)",
              textDecoration: "none", color: "var(--text-primary)", transition: "all 0.2s",
            }}
          >
            <div style={{
              width: 42, height: 42, borderRadius: 10, background: "#25D366",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>WhatsApp</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>+91 81078 90381</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Tap to chat directly</div>
            </div>
          </a>

          {/* Email */}
          <a
            href="mailto:mukeshbackup366@gmail.com?subject=UPSC%20Saathi%20-%20Support%20Request"
            style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "14px 18px", borderRadius: 10,
              background: "var(--accent-dim)", border: "1px solid var(--accent)",
              textDecoration: "none", color: "var(--text-primary)", transition: "all 0.2s",
            }}
          >
            <div style={{
              width: 42, height: 42, borderRadius: 10, background: "var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>Email</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>mukeshbackup366@gmail.com</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>We usually respond within 24 hours</div>
            </div>
          </a>
        </div>
      </Card>

      {/* FAQ */}
      <Card className="mb-4">
        <h3 style={{ margin: "0 0 16px", fontSize: 17, fontWeight: 600 }}>Frequently Asked Questions</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <FAQ q="Is my data safe?" a="Yes. If you've signed up with email & password, your data is stored securely in the cloud and syncs across all your devices. Guest mode data is stored only on your device." />
          <FAQ q="I forgot my password. What do I do?" a="On the login page, click 'Forgot password?' and enter your email. You'll receive a reset link. Note: there's a limit of 4 password reset emails per hour." />
          <FAQ q="Can I use this on multiple devices?" a="Yes! Sign up with email & password and log in on any device — your data syncs automatically. Guest mode doesn't sync across devices." />
          <FAQ q="Is UPSC Saathi free?" a="Yes, completely free. No hidden charges, no ads, no premium plans." />
          <FAQ q="Will clearing my browser cache delete my data?" a="If you're logged in with an account — no, your data is safe in the cloud. If you're using Guest mode — yes, clearing cache will delete all guest data." />
          <FAQ q="How do I switch from Guest mode to an account?" a="Exit Guest mode from the user menu (top right), then sign up with email & password. Note: guest data won't transfer to the new account — you'll start fresh." />
        </div>
      </Card>

      {/* About */}
      <Card>
        <h3 style={{ margin: "0 0 12px", fontSize: 17, fontWeight: 600 }}>About UPSC Saathi</h3>
        <p style={{ margin: 0, fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>
          UPSC Saathi is built for serious UPSC aspirants who want to stay disciplined and track every aspect of their preparation.
          Track your timetable, practice PYQs, write mains answers, manage your booklist, and build daily discipline — all in one place.
        </p>
        <p style={{ margin: "12px 0 0", fontSize: 12, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>
          Version 2.0.0 · Made with ❤️ for aspirants
        </p>
      </Card>
    </div>
  );
}

function FAQ({ q, a }) {
  return (
    <div>
      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{q}</div>
      <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{a}</div>
    </div>
  );
}
