import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Search, Plus, Sun, Moon, Bookmark, BookmarkCheck, Heart, MessageCircle,
  ArrowLeft, Pencil, Trash2, X, Menu, Sparkles, Clock3, Tag, UserRound,
  ChevronRight, Send, LayoutGrid, List, SlidersHorizontal
} from "lucide-react";
import "./styles.css";

const starterPosts = [
  {
    id: 1,
    title: "Designing Interfaces That Feel Effortless",
    excerpt: "Small interaction decisions can turn an ordinary interface into an experience people enjoy using.",
    content: "Great interfaces reduce cognitive load. Start with a clear hierarchy, meaningful spacing, predictable interactions, and feedback after every important action. Then test the experience on a small screen before polishing desktop details.",
    author: "Aarav Mehta",
    date: "2026-10-02",
    category: "Design",
    readTime: 5,
    likes: 42,
    comments: 8,
    cover: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 2,
    title: "A Practical Guide to Modern React",
    excerpt: "A simple mental model for building maintainable React interfaces without overengineering.",
    content: "Component boundaries should follow responsibilities, not file count. Keep state close to where it is used, derive values instead of duplicating them, and build reusable primitives only after patterns become clear.",
    author: "Neha Sharma",
    date: "2026-09-28",
    category: "Development",
    readTime: 7,
    likes: 67,
    comments: 14,
    cover: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 3,
    title: "How AI Is Changing Everyday Creativity",
    excerpt: "AI tools are becoming collaborators for brainstorming, prototyping, and repetitive creative work.",
    content: "The strongest workflows treat AI as a fast iteration partner. Humans still define intent, evaluate quality, provide context, and make the final creative decisions.",
    author: "Riya Kapoor",
    date: "2026-09-20",
    category: "AI",
    readTime: 6,
    likes: 91,
    comments: 21,
    cover: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 4,
    title: "Building Better Study Habits With Technology",
    excerpt: "Use technology to remove friction from learning instead of adding another source of distraction.",
    content: "A useful study system should make the next action obvious. Keep notes searchable, schedule focused sessions, and review difficult concepts using active recall rather than passive rereading.",
    author: "Kabir Singh",
    date: "2026-09-15",
    category: "Productivity",
    readTime: 4,
    likes: 35,
    comments: 5,
    cover: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80"
  }
];

const categories = ["All", "Design", "Development", "AI", "Productivity"];

function formatDate(date) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));
}

function App() {
  const [posts, setPosts] = useState(() => JSON.parse(localStorage.getItem("inkly-posts") || "null") || starterPosts);
  const [theme, setTheme] = useState(() => localStorage.getItem("inkly-theme") || "dark");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(null);
  const [bookmarks, setBookmarks] = useState(() => JSON.parse(localStorage.getItem("inkly-bookmarks") || "[]"));
  const [liked, setLiked] = useState(() => JSON.parse(localStorage.getItem("inkly-liked") || "[]"));
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [view, setView] = useState("grid");
  const [toast, setToast] = useState("");

  useEffect(() => localStorage.setItem("inkly-posts", JSON.stringify(posts)), [posts]);
  useEffect(() => localStorage.setItem("inkly-theme", theme), [theme]);
  useEffect(() => localStorage.setItem("inkly-bookmarks", JSON.stringify(bookmarks)), [bookmarks]);
  useEffect(() => localStorage.setItem("inkly-liked", JSON.stringify(liked)), [liked]);
  useEffect(() => document.documentElement.dataset.theme = theme, [theme]);

  const filtered = useMemo(() => posts.filter(p => {
    const haystack = `${p.title} ${p.excerpt} ${p.category} ${p.author}`.toLowerCase();
    return (category === "All" || p.category === category) && haystack.includes(query.toLowerCase());
  }), [posts, query, category]);

  const flash = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 1800);
  };

  const toggleLike = (id) => {
    setLiked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    setPosts(prev => prev.map(p => p.id === id ? {...p, likes: p.likes + (liked.includes(id) ? -1 : 1)} : p));
  };

  const toggleBookmark = (id) => {
    setBookmarks(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    flash(bookmarks.includes(id) ? "Removed from bookmarks" : "Saved to bookmarks");
  };

  const deletePost = (id) => {
    setPosts(prev => prev.filter(p => p.id !== id));
    setSelected(null);
    flash("Post deleted");
  };

  const savePost = (data) => {
    if (editing) {
      setPosts(prev => prev.map(p => p.id === editing.id ? {...p, ...data} : p));
      flash("Post updated");
    } else {
      setPosts(prev => [{...data, id: Date.now(), likes: 0, comments: 0, date: new Date().toISOString().slice(0,10)}, ...prev]);
      flash("Post published");
    }
    setShowEditor(false);
    setEditing(null);
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="nav-inner">
          <button className="brand" onClick={() => {setSelected(null); setCategory("All"); setQuery("")}}>
            <span className="brand-mark">i</span>
            <span>Inkly</span>
          </button>

          <nav className={showMenu ? "nav-links open" : "nav-links"}>
            <button onClick={() => {setSelected(null); setCategory("All"); setShowMenu(false)}}>Explore</button>
            <button onClick={() => {setCategory("All"); setShowMenu(false); document.getElementById("posts")?.scrollIntoView({behavior:"smooth"})}}>Latest</button>
            <button onClick={() => {setShowMenu(false); setBookmarks(posts.filter(p => bookmarks.includes(p.id))); flash(`${bookmarks.length} saved post${bookmarks.length === 1 ? "" : "s"}`)}}>Bookmarks</button>
          </nav>

          <div className="nav-actions">
            <button className="icon-btn" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} title="Toggle theme">
              {theme === "dark" ? <Sun size={19}/> : <Moon size={19}/>}
            </button>
            <button className="create-btn" onClick={() => {setEditing(null); setShowEditor(true)}}><Plus size={18}/> Write</button>
            <button className="menu-btn icon-btn" onClick={() => setShowMenu(!showMenu)}><Menu size={20}/></button>
          </div>
        </div>
      </header>

      <main>
        {!selected ? (
          <>
            <section className="hero">
              <div className="hero-copy">
                <div className="eyebrow"><Sparkles size={15}/> A smarter place for ideas</div>
                <h1>Read. Create.<br/><span>Share ideas.</span></h1>
                <p>Explore thoughtful stories, discover new perspectives, and publish your own ideas in one clean workspace.</p>
                <div className="hero-actions">
                  <button className="primary-btn" onClick={() => document.getElementById("posts")?.scrollIntoView({behavior:"smooth"})}>Explore stories <ChevronRight size={17}/></button>
                  <button className="secondary-btn" onClick={() => setShowEditor(true)}>Write a post</button>
                </div>
              </div>
              <div className="hero-card">
                <div className="hero-card-image" style={{backgroundImage:`url(${posts[0]?.cover})`}} />
                <div className="hero-card-content">
                  <span className="pill">{posts[0]?.category}</span>
                  <h3>{posts[0]?.title}</h3>
                  <div className="meta"><UserRound size={14}/> {posts[0]?.author} <span>•</span> {posts[0]?.readTime} min read</div>
                </div>
              </div>
            </section>

            <section id="posts" className="content-section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">Discover</span>
                  <h2>Latest stories</h2>
                </div>
                <div className="view-toggle">
                  <button className={view === "grid" ? "active" : ""} onClick={() => setView("grid")}><LayoutGrid size={17}/></button>
                  <button className={view === "list" ? "active" : ""} onClick={() => setView("list")}><List size={17}/></button>
                </div>
              </div>

              <div className="toolbar">
                <div className="search-box"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search stories, topics, authors..." /></div>
                <div className="filters">
                  <SlidersHorizontal size={16}/>
                  {categories.map(c => <button key={c} className={category === c ? "filter active" : "filter"} onClick={() => setCategory(c)}>{c}</button>)}
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon"><Search size={28}/></div>
                  <h3>No stories found</h3>
                  <p>Try another search term or category.</p>
                  <button className="secondary-btn" onClick={() => {setQuery("");setCategory("All")}}>Clear filters</button>
                </div>
              ) : (
                <div className={view === "grid" ? "post-grid" : "post-list"}>
                  {filtered.map(post => (
                    <article className="post-card" key={post.id}>
                      <button className="cover-btn" onClick={() => setSelected(post)}>
                        <img src={post.cover} alt="" />
                        <span className="card-category">{post.category}</span>
                      </button>
                      <div className="post-body">
                        <div className="meta"><Clock3 size={14}/> {post.readTime} min read <span>•</span> {formatDate(post.date)}</div>
                        <h3 onClick={() => setSelected(post)}>{post.title}</h3>
                        <p>{post.excerpt}</p>
                        <div className="card-footer">
                          <div className="author"><span className="avatar">{post.author[0]}</span>{post.author}</div>
                          <div className="card-actions">
                            <button className={liked.includes(post.id) ? "liked" : ""} onClick={() => toggleLike(post.id)}><Heart size={16} fill={liked.includes(post.id) ? "currentColor" : "none"}/> {post.likes}</button>
                            <button onClick={() => toggleBookmark(post.id)}>{bookmarks.includes(post.id) ? <BookmarkCheck size={16}/> : <Bookmark size={16}/>}</button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          <PostDetail post={selected} onBack={() => setSelected(null)} onEdit={() => {setEditing(selected);setShowEditor(true)}} onDelete={() => deletePost(selected.id)} liked={liked.includes(selected.id)} onLike={() => toggleLike(selected.id)} bookmarked={bookmarks.includes(selected.id)} onBookmark={() => toggleBookmark(selected.id)} />
        )}
      </main>

      <footer><span>© 2026 Inkly</span><span>Built for creators who care about ideas.</span></footer>

      {showEditor && <Editor post={editing} onClose={() => {setShowEditor(false);setEditing(null)}} onSave={savePost}/>}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function PostDetail({post, onBack, onEdit, onDelete, liked, onLike, bookmarked, onBookmark}) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  return (
    <section className="detail">
      <button className="back-btn" onClick={onBack}><ArrowLeft size={17}/> Back to stories</button>
      <div className="detail-layout">
        <article>
          <span className="pill">{post.category}</span>
          <h1>{post.title}</h1>
          <div className="detail-meta"><span className="avatar">{post.author[0]}</span><b>{post.author}</b><span>•</span>{formatDate(post.date)}<span>•</span>{post.readTime} min read</div>
          <img className="detail-cover" src={post.cover} alt="" />
          <p className="lead">{post.excerpt}</p>
          <p>{post.content}</p>
          <p>Good writing is less about adding more words and more about choosing the right ones. Keep the reader moving, give each section a purpose, and make the interface disappear behind the content.</p>
          <div className="article-actions">
            <button className={liked ? "action liked" : "action"} onClick={onLike}><Heart size={18} fill={liked ? "currentColor" : "none"}/> {post.likes + (liked ? 0 : 0)}</button>
            <button className="action" onClick={onBookmark}>{bookmarked ? <BookmarkCheck size={18}/> : <Bookmark size={18}/>} {bookmarked ? "Saved" : "Save"}</button>
            <button className="action" onClick={onEdit}><Pencil size={17}/> Edit</button>
            <button className="action danger" onClick={onDelete}><Trash2 size={17}/> Delete</button>
          </div>
        </article>
        <aside className="comments">
          <h3><MessageCircle size={19}/> Comments</h3>
          <div className="comment-input"><input value={comment} onChange={e=>setComment(e.target.value)} placeholder="Share your thoughts..." /><button onClick={() => {if(comment.trim()){setComments([...comments, comment.trim()]);setComment("")}}}><Send size={16}/></button></div>
          {comments.length === 0 ? <p className="muted">Be the first to comment.</p> : comments.map((c,i)=><div className="comment" key={i}><span className="avatar">Y</span><div><b>You</b><p>{c}</p></div></div>)}
        </aside>
      </div>
    </section>
  );
}

function Editor({post, onClose, onSave}) {
  const [form, setForm] = useState(post || {title:"", excerpt:"", content:"", category:"Design", author:"You", readTime:5, cover:"https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80"});
  const update = (key, value) => setForm({...form, [key]:value});
  return (
    <div className="modal-backdrop">
      <div className="editor">
        <div className="editor-head"><div><span className="eyebrow">Creator studio</span><h2>{post ? "Edit story" : "Create a story"}</h2></div><button className="icon-btn" onClick={onClose}><X/></button></div>
        <label>Title<input value={form.title} onChange={e=>update("title",e.target.value)} placeholder="Give your story a strong title"/></label>
        <label>Excerpt<textarea rows="2" value={form.excerpt} onChange={e=>update("excerpt",e.target.value)} placeholder="Short description"/></label>
        <div className="two-col">
          <label>Category<select value={form.category} onChange={e=>update("category",e.target.value)}>{categories.filter(c=>c!=="All").map(c=><option key={c}>{c}</option>)}</select></label>
          <label>Read time (min)<input type="number" min="1" value={form.readTime} onChange={e=>update("readTime",Number(e.target.value))}/></label>
        </div>
        <label>Cover image URL<input value={form.cover} onChange={e=>update("cover",e.target.value)} /></label>
        <label>Content<textarea className="content-input" rows="8" value={form.content} onChange={e=>update("content",e.target.value)} placeholder="Write your story..."/></label>
        <div className="editor-actions"><button className="secondary-btn" onClick={onClose}>Cancel</button><button className="primary-btn" disabled={!form.title.trim() || !form.content.trim()} onClick={()=>onSave(form)}>{post ? "Save changes" : "Publish story"}</button></div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
