import React from "react";
import { ArrowUpRight, Globe, Home as HomeIcon } from "lucide-react";
import { SmartLink } from "./components";
import data from "./data/home.json";
const image = (article) =>
  article.image?.startsWith("https://meetily.ai")
    ? `/assets/${article.image.split("/").pop()}`
    : article.image;
export default function Blog() {
  const articles = data.articles.filter((x) => x.href?.startsWith("/blog/"));
  return (
    <div className="editorial-blog">
      <div className="blog-breadcrumb">
        <SmartLink to="/" aria-label="Home">
          <HomeIcon size={16} />
        </SmartLink>
        <span>›</span>Blog
      </div>
      <section className="blog-masthead">
        <div className="editorial-label">
          <i />
          FIELD NOTES · VOL. 01 · 2026
        </div>
        <h1>Meetily Blogs</h1>
        <p>
          Expert notes on bot-free meeting transcription, GDPR and HIPAA
          compliance, self-hosted AI, and privacy-first meeting note takers for
          teams who care about where their data lives.
        </p>
        <div className="blog-meta">
          <span>28 DISPATCHES · CURATED BIWEEKLY</span>
          <label>
            <Globe size={17} />
            <select aria-label="Article language" defaultValue="English">
              <option>English</option>
            </select>
          </label>
        </div>
      </section>
      <section className="blog-cover">
        <div className="editorial-label">
          <i />
          THE COVER STORY <span>FEATURED</span>
        </div>
        <div className="cover-grid">
          <SmartLink to={articles[0].href} className="cover-lead">
            <img src={image(articles[0])} alt={articles[0].title} />
            <div className="editorial-label">
              N°01 · LEAD　 SEP 30, 2026　 4 MIN READ
            </div>
            <h2>{articles[0].title}</h2>
            <p>{articles[0].excerpt}</p>
            <span className="read-dispatch">
              READ THE DISPATCH <ArrowUpRight size={15} />
            </span>
          </SmartLink>
          <div className="cover-secondary">
            {articles.slice(1, 3).map((article, i) => (
              <SmartLink key={article.href} to={article.href}>
                <img src={image(article)} alt={article.title} />
                <div className="editorial-label">
                  N°0{i + 2}　{article.date}　 PRIVACY &amp; SECURITY
                </div>
                <h3>{article.title}</h3>
              </SmartLink>
            ))}
          </div>
        </div>
      </section>
      <section className="blog-archive">
        <div className="editorial-label">
          <i />
          THE ARCHIVE <span>ALL DISPATCHES</span>
        </div>
        <h2>Every dispatch, in order.</h2>
        {[...articles.slice(1, 4), articles[0], ...articles.slice(4)].map(
          (article, i) => (
            <SmartLink
              to={article.href}
              key={article.href}
              className="archive-row"
            >
              <span className="archive-number">
                N°{String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <div className="editorial-label">{article.date}</div>
                <h3>{article.title}</h3>
                <p>{article.excerpt}</p>
              </div>
              <img src={image(article)} alt="" loading="lazy" />
              <ArrowUpRight size={22} />
            </SmartLink>
          ),
        )}
      </section>
      <section className="syndicated">
        <div className="editorial-label">
          <i />
          ELSEWHERE <span>SYNDICATED ON DEV.TO</span>
        </div>
        <h2>Writing published beyond the masthead.</h2>
        <div>
          {data.articles
            .filter((a) => a.href?.startsWith("https://dev.to"))
            .slice(0, 10)
            .map((a) => (
              <a key={a.href} href={a.href}>
                <div className="editorial-label">DEV.TO　 {a.date}</div>
                <h3>{a.title}</h3>
                <p>{a.excerpt}</p>
                <ArrowUpRight size={18} />
              </a>
            ))}
        </div>
      </section>
      <section className="blog-departments">
        <div className="editorial-label">
          <i />
          DEPARTMENTS <span>BROWSE BY SUBJECT</span>
        </div>
        <h2>The standing sections.</h2>
        <div className="department-grid">
          {[
            [
              "I.",
              "Privacy & AI",
              "Bot-free transcription, GDPR and HIPAA compliance, self-hosted architecture.",
            ],
            [
              "II.",
              "Comparison Guides",
              "Tool comparisons, feature analysis, and alternatives to cloud note takers.",
            ],
            [
              "III.",
              "In Preparation",
              "Tutorials, case studies, and enterprise deployment walkthroughs.",
            ],
          ].map(([number, title, desc]) => (
            <div key={title}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
