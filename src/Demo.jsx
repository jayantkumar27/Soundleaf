import React, { useEffect, useState } from "react";
import {
  Mic,
  FileText,
  Users,
  Sparkles,
  Settings,
  Plus,
  Search,
  PanelLeft,
  Copy,
  RefreshCw,
  Check,
  Play,
  Video,
  Phone,
  Volume2,
  Monitor,
  ChevronDown,
} from "lucide-react";
import { stages, participants, transcript, summary } from "./data/config";
const icons = [Mic, FileText, Users, Sparkles];
export default function Demo({ openDialog }) {
  const [stage, setStage] = useState(0),
    [tick, setTick] = useState(0),
    [manual, setManual] = useState(false),
    [copied, setCopied] = useState(false),
    [names, setNames] = useState({});
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  useEffect(() => {
    if (reduced) return;
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, [stage, reduced]);
  useEffect(() => {
    if (!manual && !reduced && tick >= 14) {
      setStage((s) => (s + 1) % 4);
      setTick(0);
    }
  }, [tick, manual, reduced]);
  const select = (i) => {
    setStage(i);
    setTick(0);
    setManual(true);
    setCopied(false);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
    } catch {
      const field = document.createElement("textarea");
      field.value = summary;
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.append(field);
      field.select();
      const success = document.execCommand("copy");
      field.remove();
      setCopied(success);
    }
  };
  return (
    <section
      className="showcase"
      aria-label="Interactive product demonstration"
    >
      <div className="scene">
        <div className="scene-heading">
          <h2>The full meeting workflow, 100% local</h2>
          <div
            className="workflow-tabs"
            role="tablist"
            aria-label="Meeting workflow"
          >
            {stages.map((name, i) => {
              const Icon = icons[i];
              return (
                <button
                  key={name}
                  role="tab"
                  id={`stage-tab-${i}`}
                  aria-selected={stage === i}
                  aria-controls="demo-panel"
                  aria-label={`Show ${name}`}
                  tabIndex={stage === i ? 0 : -1}
                  onKeyDown={(e) => {
                    if (["ArrowRight", "ArrowLeft"].includes(e.key)) {
                      e.preventDefault();
                      const next = (i + (e.key === "ArrowRight" ? 1 : 3)) % 4;
                      select(next);
                      document.getElementById(`stage-tab-${next}`).focus();
                    }
                  }}
                  onClick={() => select(i)}
                >
                  <Icon size={16} />
                  <span>{name}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="demo-layout">
          <div
            className="app-window"
            role="tabpanel"
            id="demo-panel"
            aria-labelledby={`stage-tab-${stage}`}
          >
            <div className="window-top">
              <div className="traffic">
                <i />
                <i />
                <i />
              </div>
              <span>Meetily Pro</span>
            </div>
            <div className="app-inner">
              <aside className="app-sidebar" aria-hidden="true">
                <PanelLeft />
                <Plus />
                <Search />
                <span className="sidebar-record">
                  <Mic />
                </span>
                <div className="sidebar-bottom">
                  <Settings />
                  <Users />
                </div>
              </aside>
              <div className="app-content">
                <div className="app-tabs">
                  {stage > 0 && (
                    <>
                      <button
                        className={stage === 3 ? "active" : ""}
                        onClick={() => select(3)}
                      >
                        <Sparkles size={12} /> AI Summary
                      </button>
                      <button
                        className={stage === 1 ? "active" : ""}
                        onClick={() => select(1)}
                      >
                        <FileText size={12} /> Transcript
                      </button>
                    </>
                  )}
                  {stage < 2 && tick > 1 && (
                    <span className="record-label">
                      <i /> Recording{" "}
                      <span>0:{String(tick).padStart(2, "0")}</span>
                    </span>
                  )}
                </div>
                {stage === 0 && (
                  <div className="recording-view">
                    <div>
                      <h3>Welcome to Meetily Pro!</h3>
                      <p>Click the mic to start live transcription</p>
                    </div>
                    {tick > 3 && (
                      <div className="listening">
                        <div className="waveform">
                          {Array.from({ length: 23 }, (_, i) => (
                            <i
                              key={i}
                              style={{
                                "--bar": `${12 + ((i * 13) % 27)}px`,
                                "--delay": `${i * 0.07}s`,
                              }}
                            />
                          ))}
                        </div>
                        <p>Listening for speech...</p>
                      </div>
                    )}
                    <button
                      className="mic-button"
                      aria-label="Start demo transcription"
                      onClick={() => select(1)}
                    >
                      <Mic size={22} />
                    </button>
                  </div>
                )}
                {stage === 1 && (
                  <div className="transcript-view">
                    <h3>Q3 Review</h3>
                    <p className="demo-muted">
                      Live transcription · processed on your device
                    </p>
                    {transcript
                      .slice(
                        0,
                        reduced ? 6 : Math.min(6, Math.floor(tick / 2) + 1),
                      )
                      .map((line) => (
                        <div className="transcript-line" key={line.time}>
                          <span className="speaker-dot">{line.speaker[0]}</span>
                          <div>
                            <strong>{line.speaker}</strong>
                            <time>{line.time}</time>
                            <p>{line.text}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
                {stage === 2 && (
                  <div className="people-view">
                    <h3>Name your speakers</h3>
                    <p className="demo-muted">
                      Play the sample, then click to name each speaker
                    </p>
                    <div className="participants-heading">
                      <Users size={15} /> Participants <span>4</span>
                      <button onClick={() => setNames({})}>Re-run</button>
                    </div>
                    {participants.map((name, i) => (
                      <div className="speaker-row" key={name}>
                        <span className="speaker-dot">{i + 1}</span>
                        <button
                          className="speaker-name"
                          onClick={() => setNames({ ...names, [i]: name })}
                        >
                          {names[i] || `Speaker ${i + 1}`}
                        </button>
                        <button
                          className="listen"
                          onClick={() => setNames({ ...names, [i]: name })}
                        >
                          <Play size={10} />{" "}
                          {names[i] ? "Identified" : "Listen"}
                        </button>
                      </div>
                    ))}
                    <button className="done-button" onClick={() => select(3)}>
                      <Check size={12} /> Done
                    </button>
                  </div>
                )}
                {stage === 3 &&
                  (tick < 4 && !reduced ? (
                    <div className="generating">
                      <Sparkles size={30} />
                      <h3>Generating AI summary...</h3>
                      {[
                        "Analyzing transcript...",
                        "Identifying speakers...",
                        "Extracting key points...",
                        "Writing summary...",
                      ].map((text, i) => (
                        <p key={text}>
                          {tick > i ? (
                            <Check size={14} />
                          ) : (
                            <span className="spinner" />
                          )}
                          {text}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <div className="summary-view">
                      <h3>Q3 Review</h3>
                      <p className="demo-muted">
                        4 speakers · 6 min · generated locally
                      </p>
                      <h4>Key points</h4>
                      <ul>
                        <li>
                          Revenue up 18% QoQ, driven by new enterprise accounts
                        </li>
                        <li>Churn down to 2.1%; net retention is healthy</li>
                        <li>
                          Beta launch targeted for next week, pending QA
                          sign-off
                        </li>
                      </ul>
                      <h4>Action items</h4>
                      <ul>
                        <li>
                          <strong>Sarah:</strong> Send the board deck on Friday
                        </li>
                        <li>
                          <strong>Lauren:</strong> Prep release notes + customer
                          announcement
                        </li>
                      </ul>
                    </div>
                  ))}
                {stage > 0 && (
                  <div className="app-bottom">
                    {stage === 3 ? (
                      <>
                        <button onClick={copy}>
                          <Copy size={13} />
                          {copied ? "Copied!" : "Copy"}
                        </button>
                        <button onClick={() => setTick(0)}>
                          <RefreshCw size={13} />
                          Regenerate Summary
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          aria-label="Replay demonstration"
                          onClick={() => {
                            setStage(0);
                            setTick(0);
                            setManual(false);
                          }}
                        >
                          <Play size={13} />
                        </button>
                        <button onClick={() => select(2)}>
                          <Users size={13} />
                          Speakers
                        </button>
                        <Volume2 size={14} />
                        <span>0:{String(tick).padStart(2, "0")}</span>
                        <div className="audio-track" />
                        <span>5:12</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          {stage < 2 && (
            <div className="meeting-side">
              <div className="video-call">
                <div className="participant-grid">
                  {participants.map((name, i) => (
                    <div className="participant" key={name}>
                      <img
                        src={`/assets/${name.split(" ")[0].toLowerCase()}.webp`}
                        alt={name}
                      />
                      <span>
                        <Mic size={9} />
                        {name}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="call-controls" aria-hidden="true">
                  <span>
                    <Mic />
                  </span>
                  <span>
                    <Video />
                  </span>
                  <span className="hangup">
                    <Phone />
                  </span>
                </div>
              </div>
              <div className="platform-panel">
                <p>Works with</p>
                <div className="platform-icons">
                  {[
                    ["zoom.png", "Zoom"],
                    ["teams.png", "Microsoft Teams"],
                    ["meet.png", "Google Meet"],
                    ["slack.webp", "Slack"],
                    ["webex.png", "Webex"],
                    ["gotomeeting.png", "GoToMeeting"],
                  ].map(([src, name]) => (
                    <img
                      key={src}
                      src={`/assets/${src}`}
                      alt={name}
                      title={name}
                    />
                  ))}
                </div>
                <button onClick={() => openDialog("platforms")}>
                  …and more <ChevronDown size={12} />
                </button>
              </div>
            </div>
          )}
        </div>
        <p className="demo-caption">
          Interactive Demo • Click tabs to explore or let it auto-play
        </p>
      </div>
    </section>
  );
}
