import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/home.css';
import styles from './HomeHeader.module.css';

const Home: React.FC = () => {
  const [featured, setFeatured] = useState<Array<{book_id:number; title:string; description:string; photo:string|null; author_name:string}>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|undefined>();
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const id = setInterval(() => rotateNext(), 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    // Carrega livros em destaque (primeiros 6) sem exigir login
    const load = async () => {
      try {
        const res = await fetch('/api/books?limit=6');
        if (!res.ok) throw new Error('Falha ao carregar destaques');
        const data = await res.json();
        const list = (data?.books || []) as any[];
        setFeatured(list);
      } catch (e:any) {
        setError(e?.message || 'Erro ao carregar');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="home-root">
      <div className={styles.homeHeader}>
        <div className={styles.container}>
          <div className={styles.brand}>
            <span className={styles.logo} aria-hidden>📚</span>
            <h1 className={styles.title}>PedBook • Beta</h1>
          </div>
          <div className={styles.homeNav} role="navigation">
            <a href="#features" className={styles.navLink}>Funcionalidades</a>
            <a href="#contato" className={styles.navLink}>Contato</a>
            <Link to="/login" className={styles.loginBtn}>Entrar</Link>
          </div>
        </div>
      </div>

      <section className="hero">
        <div className="hero-gradient"/>
        <div className="carousel">
          <div className="slide active" style={{backgroundImage: "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600')"}}>
            <div className="overlay">
              <h2>Explore livros incríveis</h2>
              <p>Descubra autores, leia sinopses e gerencie seus favoritos.</p>
              <div className="cta-row">
                <button type="button" className="btn primary" onClick={() => navigate('/login')}>Entrar</button>
                <button type="button" className="btn ghost" onClick={() => navigate('/register')}>Criar conta</button>
              </div>
            </div>
          </div>
          <div className="slide" style={{backgroundImage: "url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1600')"}}>
            <div className="overlay">
              <h2>Catálogo organizado</h2>
              <p>Navegue por categorias e encontre sua próxima leitura.</p>
              <div className="cta-row">
                <button type="button" className="btn primary" onClick={() => navigate('/login')}>Entrar</button>
                <button type="button" className="btn ghost" onClick={() => navigate('/register')}>Criar conta</button>
              </div>
            </div>
          </div>
          <div className="slide" style={{backgroundImage: "url('https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=1600')"}}>
            <div className="overlay">
              <h2>Leituras para todos</h2>
              <p>Ficção, romance, crônicas e muito mais.</p>
              <div className="cta-row">
                <button type="button" className="btn primary" onClick={() => navigate('/login')}>Entrar</button>
                <button type="button" className="btn ghost" onClick={() => navigate('/register')}>Criar conta</button>
              </div>
            </div>
          </div>
          <div className="carousel-controls" aria-label="Controles do carrossel">
            <button className="prev" aria-label="Anterior" onClick={rotatePrev}>‹</button>
            <button className="next" aria-label="Próximo" onClick={rotateNext}>›</button>
          </div>
        </div>
      </section>

      <section id="features" className="features">
        <div className="feature-card">
          <h3>Biblioteca moderna</h3>
          <p>Interface intuitiva e responsiva, focada na melhor experiência.</p>
        </div>
        <div className="feature-card">
          <h3>Autenticação segura</h3>
          <p>Gerencie seu perfil, empréstimos e avaliações.</p>
        </div>
        <div className="feature-card">
          <h3>Conteúdo diverso</h3>
          <p>Coleções com curadoria para todos os gostos.</p>
        </div>
      </section>

      <section className="highlights">
        <div className="section-head">
          <h3>Livros em destaque</h3>
          <p>Confira algumas obras do nosso acervo</p>
        </div>
        {loading ? (
          <div className="loading">Carregando...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="cards">
            {featured.map((b) => (
              <div key={b.book_id} className="card">
                <div className="thumb" style={{backgroundImage: `url(${b.photo || 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?q=80&w=1200'})`}}/>
                <div className="card-body">
                  <h4 title={b.title}>{b.title}</h4>
                  <p className="author">{b.author_name}</p>
                  <p className="desc">{(b.description||'').slice(0,100)}{(b.description||'').length>100?'...':''}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="testimonials">
        <div className="section-head">
          <h3>O que dizem sobre o PedBook</h3>
        </div>
        <div className="quotes">
          <blockquote>
            “Interface linda e muito fácil de usar. Encontrei meus livros favoritos rapidinho.”
            <span>— Ana, leitora</span>
          </blockquote>
          <blockquote>
            “Perfeito para organizar empréstimos e acompanhar avaliações da equipe.”
            <span>— Júlio, bibliotecário</span>
          </blockquote>
          <blockquote>
            “Catálogo diverso e navegação fluida. Recomendo demais.”
            <span>— Carla, professora</span>
          </blockquote>
        </div>
      </section>

      <footer id="contato" className="home-footer">
        <div className="footer-content">
          <div>
            <h4>Contato</h4>
            <ul className="contact-list">
              <li><strong>Telefone:</strong> (14) 91234-5678</li>
              <li><strong>E-mail:</strong> admin@pedbot.com.br</li>
            </ul>
          </div>
          <div>
            <h4>Endereço</h4>
            <p>Pedbot Tecnologia Ltda.<br/>Av. Paulista, 1000 - Bela Vista<br/>São Paulo - SP, 01310-100</p>
          </div>
          <div>
            <h4>Sobre</h4>
            <p>Plataforma de biblioteca digital desenvolvida com NestJS + React.</p>
          </div>
          <div>
            <h4>Links</h4>
            <ul className="footer-links">
              <li><a href="#features">Funcionalidades</a></li>
              <li><a href="#contato">Contato</a></li>
              <li><Link to="/login">Entrar</Link></li>
              <li><Link to="/register">Criar conta</Link></li>
            </ul>
          </div>
        </div>
        <p className="copyright">© {new Date().getFullYear()} PedBook · Todos os direitos reservados</p>
      </footer>
    </div>
  );
};

function rotateNext() {
  const slides = document.querySelectorAll<HTMLDivElement>('.carousel .slide');
  if (slides.length === 0) return;
  const activeIndex = Array.from(slides).findIndex(s => s.classList.contains('active'));
  const nextIndex = (activeIndex + 1) % slides.length;
  slides[activeIndex]?.classList.remove('active');
  slides[nextIndex]?.classList.add('active');
}

function rotatePrev() {
  const slides = document.querySelectorAll<HTMLDivElement>('.carousel .slide');
  if (slides.length === 0) return;
  const activeIndex = Array.from(slides).findIndex(s => s.classList.contains('active'));
  const prevIndex = (activeIndex - 1 + slides.length) % slides.length;
  slides[activeIndex]?.classList.remove('active');
  slides[prevIndex]?.classList.add('active');
}

export default Home;
