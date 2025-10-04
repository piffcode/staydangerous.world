'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import feather from 'feather-icons';

import '@/styles/services.css';

const services = [
  {
    title: 'Brand Strategy',
    purpose: 'Build a brand that stands out and scales.',
    includes:
      'Discovery, audience persona, positioning, messaging, visual identity briefing.',
    price: 'Starting at $1,000',
    outcome: 'A clear, memorable brand foundation that drives growth.',
  },
  {
    title: 'Life / Mindset Coaching',
    purpose: 'Align mindset, clarity, and habits with your goals.',
    includes:
      'Clarity sessions, mindset reset, accountability, resilience training, ritual design.',
    price: 'Starting at $200',
    outcome: 'A stronger mindset and sustainable daily practices.',
  },
  {
    title: 'Business Coaching',
    purpose: 'Turn creativity into a business that works.',
    includes:
      'Career roadmap, brand positioning, monetization plan, content strategy, launch planning.',
    price: 'Starting at $500',
    outcome: 'A practical plan to grow, monetize, and manage your career.',
  },
  {
    title: 'Creative Direction',
    purpose: 'Shape ideas into powerful visuals and stories.',
    includes: 'Concept design, moodboards, storytelling blueprint, shotlists, on-set direction.',
    price: 'Starting at $700',
    outcome: 'A cohesive creative vision brought to life.',
  },
  {
    title: 'Production',
    purpose: 'Execute high-quality creative projects.',
    includes:
      'Pre-production, casting, location, cinematography, sound, editing, color grading.',
    price: 'Starting at $1,000',
    outcome: 'Professional visuals that match your vision and scale.',
  },
  {
    title: 'Songwriting',
    purpose: 'Create original music that connects deeply.',
    includes: 'Concepts, lyrics, melody, structure, co-writing, brand songs, feedback.',
    price: 'Starting at $300',
    outcome: 'Songs tailored to your story, audience, and goals.',
  },
  {
    title: 'Merchandising',
    purpose: 'Design and launch merch that builds culture and revenue.',
    includes:
      'Concepts, artwork, sourcing, mockups, production, e-commerce setup, marketing.',
    price: 'Starting at $500',
    outcome: 'Merch drops that reflect your brand and move product.',
  },
  {
    title: 'Website Building',
    purpose: 'Build a simple, branded digital home.',
    includes:
      'Up to 5 pages (Home, About, Services, Portfolio, Contact), hosting setup, mobile optimization.',
    price: 'Starting at $500',
    outcome: 'A professional site that represents your brand with clarity.',
  },
];

export default function ServicesPage() {
  useEffect(() => {
    feather.replace();

    const canvas = document.getElementById('particleCanvas') as HTMLCanvasElement | null;
    const ctx = canvas?.getContext('2d') ?? null;
    const loadingScreen = document.getElementById('loadingScreen');
    const bgVideo = document.getElementById('bgVideo') as HTMLVideoElement | null;
    const soundToggle = document.getElementById('soundToggle');
    const particleToggle = document.getElementById('particleToggle');
    const greetingText = document.getElementById('greetingText');
    const timeDisplay = document.getElementById('currentTime');
    const cursor = document.getElementById('customCursor');
    const navLinks = Array.from(document.querySelectorAll<HTMLElement>('.nav-link'));

    let particlesEnabled = true;
    let particleAnimation: number | null = null;
    let cursorAnimation: number | null = null;
    let trailTimeout: ReturnType<typeof setTimeout> | null = null;

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const intervals: ReturnType<typeof setInterval>[] = [];
    const cleanupFns: Array<() => void> = [];

    if (canvas && ctx) {
      const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };

      class Particle {
        x = 0;
        y = 0;
        vx = 0;
        vy = 0;
        size = 0;
        alpha = 0;

        constructor() {
          this.reset();
        }

        reset() {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
          this.vx = (Math.random() - 0.5) * 0.5;
          this.vy = (Math.random() - 0.5) * 0.5;
          this.size = Math.random() * 2;
          this.alpha = Math.random() * 0.5;
        }

        update() {
          this.x += this.vx;
          this.y += this.vy;
          if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
            this.reset();
          }
        }

        draw() {
          ctx.fillStyle = `rgba(255, 0, 0, ${this.alpha})`;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      let particles: Particle[] = [];

      const initParticles = () => {
        particles = Array.from({ length: 100 }, () => new Particle());
      };

      const animateParticles = () => {
        if (!particlesEnabled) {
          particleAnimation = null;
          return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((particle) => {
          particle.update();
          particle.draw();
        });
        particleAnimation = window.requestAnimationFrame(animateParticles);
      };

      resizeCanvas();
      initParticles();
      animateParticles();

      const handleResize = () => {
        resizeCanvas();
        initParticles();
      };

      window.addEventListener('resize', handleResize);
      cleanupFns.push(() => window.removeEventListener('resize', handleResize));

      if (particleToggle) {
        const icon = particleToggle.querySelector('i');

        const updateIcon = () => {
          if (icon) {
            icon.setAttribute('data-feather', particlesEnabled ? 'zap' : 'zap-off');
            feather.replace();
          }
        };

        const handleParticleToggle = () => {
          particlesEnabled = !particlesEnabled;
          if (!particlesEnabled) {
            if (particleAnimation !== null) {
              window.cancelAnimationFrame(particleAnimation);
              particleAnimation = null;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          } else if (particleAnimation === null) {
            animateParticles();
          }
          updateIcon();
        };

        particleToggle.addEventListener('click', handleParticleToggle);
        cleanupFns.push(() => particleToggle.removeEventListener('click', handleParticleToggle));
      }

      cleanupFns.push(() => {
        if (particleAnimation !== null) {
          window.cancelAnimationFrame(particleAnimation);
        }
      });
    }

    if (loadingScreen) {
      timeouts.push(window.setTimeout(() => loadingScreen.classList.add('hidden'), 2200));
    }

    if (bgVideo && soundToggle) {
      bgVideo.muted = true;
      const icon = soundToggle.querySelector('i');

      const updateIcon = () => {
        if (icon) {
          icon.setAttribute('data-feather', bgVideo.muted ? 'volume-x' : 'volume-2');
          feather.replace();
        }
      };

      const handleSoundToggle = () => {
        bgVideo.muted = !bgVideo.muted;
        updateIcon();
      };

      soundToggle.addEventListener('click', handleSoundToggle);
      cleanupFns.push(() => soundToggle.removeEventListener('click', handleSoundToggle));
      updateIcon();
    }

    if (greetingText && timeDisplay) {
      const updateTime = () => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');

        timeDisplay.textContent = `${hours}:${minutes}`;

        let greeting = 'Good evening';
        if (hours < 12) greeting = 'Good morning';
        else if (hours < 18) greeting = 'Good afternoon';
        greetingText.textContent = greeting;
      };

      updateTime();
      intervals.push(window.setInterval(updateTime, 60000));
    }

    if (cursor) {
      let mouseX = 0;
      let mouseY = 0;
      let cursorX = 0;
      let cursorY = 0;

      const updateCursor = () => {
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;
        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;
        cursorAnimation = window.requestAnimationFrame(updateCursor);
      };

      const handleMouseMove = (event: MouseEvent) => {
        mouseX = event.clientX;
        mouseY = event.clientY;
        cursor.classList.add('active');

        if (bgVideo) {
          const moveX = (event.clientX / window.innerWidth - 0.5) * 20;
          const moveY = (event.clientY / window.innerHeight - 0.5) * 20;
          bgVideo.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px)) scale(1.1)`;
        }

        if (trailTimeout) {
          window.clearTimeout(trailTimeout);
        }

        trailTimeout = window.setTimeout(() => {
          const trail = document.createElement('div');
          trail.className = 'trail';
          trail.style.left = `${event.clientX}px`;
          trail.style.top = `${event.clientY}px`;
          document.body.appendChild(trail);
          timeouts.push(window.setTimeout(() => {
            trail.remove();
          }, 450));
        }, 40);
      };

      document.addEventListener('mousemove', handleMouseMove);
      cleanupFns.push(() => document.removeEventListener('mousemove', handleMouseMove));

      updateCursor();
      cleanupFns.push(() => {
        if (cursorAnimation !== null) {
          window.cancelAnimationFrame(cursorAnimation);
        }
      });

      navLinks.forEach((link) => {
        const element = link;
        const handleMouseEnter = () => cursor.classList.add('hover');
        const handleMouseLeave = () => {
          cursor.classList.remove('hover');
          element.style.transform = 'translate(0, 0)';
        };
        const handleLinkMove = (event: MouseEvent) => {
          const rect = element.getBoundingClientRect();
          const x = event.clientX - rect.left - rect.width / 2;
          const y = event.clientY - rect.top - rect.height / 2;
          element.style.transform = `translate(${x * 0.08}px, ${y * 0.08}px)`;
        };

        element.addEventListener('mouseenter', handleMouseEnter);
        element.addEventListener('mouseleave', handleMouseLeave);
        element.addEventListener('mousemove', handleLinkMove);

        cleanupFns.push(() => {
          element.removeEventListener('mouseenter', handleMouseEnter);
          element.removeEventListener('mouseleave', handleMouseLeave);
          element.removeEventListener('mousemove', handleLinkMove);
        });
      });
    }

    const handleKeydown = (event: KeyboardEvent) => {
      const number = parseInt(event.key, 10);
      if (!Number.isNaN(number) && number > 0 && number <= navLinks.length) {
        const link = navLinks[number - 1];
        if (link instanceof HTMLElement) {
          link.click();
        }
      }
    };

    document.addEventListener('keydown', handleKeydown);
    cleanupFns.push(() => document.removeEventListener('keydown', handleKeydown));

    return () => {
      cleanupFns.forEach((fn) => fn());
      timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
      intervals.forEach((intervalId) => window.clearInterval(intervalId));
      if (trailTimeout) {
        window.clearTimeout(trailTimeout);
      }
    };
  }, []);

  return (
    <>
      <div id="loadingScreen" className="loading-screen">
        <div className="loader-text">Stay Dangerous Productions</div>
        <div className="loader-bar">
          <div className="loader-progress"></div>
        </div>
      </div>
      <canvas id="particleCanvas"></canvas>
      <div className="video-container">
        <div className="video-overlay"></div>
        <video id="bgVideo" autoPlay muted loop playsInline>
          <source src="https://static.photos/urban/1200x630/42" type="video/mp4" />
        </video>
      </div>
      <Link href="/" className="logo">
        STAY DANGEROUS
      </Link>
      <div className="greeting">
        <span id="greetingText">Good evening</span>
        <span id="currentTime" className="time-display">
          00:00
        </span>
      </div>
      <main className="content-wrapper">
        <div className="services-container">
          <header className="services-header">
            <h1 className="glitch-wrapper">
              <span className="glitch-text" data-text="Services">
                Services
              </span>
            </h1>
            <p>
              Strategies, coaching, and execution built for artists and brands who refuse to play it safe. Mix and match what
              you need and we’ll engineer an end-to-end plan that delivers.
            </p>
            <div className="cta-buttons">
              <Link href="/start" className="cta-button primary">
                Start a Project
              </Link>
              <Link href="/work" className="cta-button">
                See Recent Work
              </Link>
            </div>
          </header>

          <section className="services-grid">
            {services.map((service) => (
              <article key={service.title} className="service-card">
                <h3>{service.title}</h3>
                <p>
                  <strong>Purpose:</strong> {service.purpose}
                </p>
                <p>
                  <strong>Includes:</strong> {service.includes}
                </p>
                <p className="price">{service.price}</p>
                <p>
                  <em>Outcome: {service.outcome}</em>
                </p>
              </article>
            ))}
          </section>

          <section className="cta-banner">
            <h2>Ready to build with us?</h2>
            <p>Tap into full-stack creative production, strategy, and development. We plug in where you need us most.</p>
            <div className="cta-buttons">
              <Link href="/start" className="cta-button primary">
                Start Your Project
              </Link>
            </div>
          </section>
        </div>
      </main>
      <nav className="floating-nav">
        <Link href="/" className="nav-link">
          <div className="nav-number">01</div>
          <div className="glitch-wrapper">
            <span className="glitch-text" data-text="Home">
              Home
            </span>
          </div>
          <div className="gradient-line"></div>
        </Link>
        <Link href="/work" className="nav-link">
          <div className="nav-number">02</div>
          <div className="glitch-wrapper">
            <span className="glitch-text" data-text="Work">
              Work
            </span>
          </div>
          <div className="gradient-line"></div>
        </Link>
        <Link href="/services" className="nav-link active">
          <div className="nav-number">03</div>
          <div className="glitch-wrapper">
            <span className="glitch-text" data-text="Services">
              Services
            </span>
          </div>
          <div className="gradient-line"></div>
        </Link>
        <Link href="/start" className="nav-link">
          <div className="nav-number">04</div>
          <div className="glitch-wrapper">
            <span className="glitch-text" data-text="Start">
              Start
            </span>
          </div>
          <div className="gradient-line"></div>
        </Link>
      </nav>
      <div className="control-panel">
        <button id="soundToggle" className="control-btn" type="button" aria-label="Toggle sound">
          <i data-feather="volume-x"></i>
        </button>
        <button id="particleToggle" className="control-btn" type="button" aria-label="Toggle particles">
          <i data-feather="zap"></i>
        </button>
      </div>
      <div id="customCursor" className="custom-cursor"></div>
    </>
  );
}
